import os
import sys
import time
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import f1_score
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV

import xgboost as xgb
import lightgbm as lgb
import catboost as cb

def engineer_clinical_features(df_raw):
    df = df_raw.copy()
    
    # 1. Rate-Pressure Product (Myocardial oxygen consumption index)
    df['RPP'] = (df['MaxHR'] * df['RestingBP']) / 100.0
    
    # 2. Chronotropic Incompetence Ratio
    age_pred_max = 220.0 - df['Age']
    df['HR_Ratio'] = df['MaxHR'] / age_pred_max
    
    # 3. Pulse Pressure (Vascular compliance and aortic stiffness)
    df['PulsePressure'] = df['RestingBP'] - 80.0
    
    # 4. Ischemic Burden Index
    if df['ExerciseAngina'].dtype == object or str(df['ExerciseAngina'].dtype) in ['str', 'string']:
        angina_num = df['ExerciseAngina'].map({'Y': 1.0, 'N': 0.0, '1': 1.0, '0': 0.0}).fillna(0.0).astype(float)
    else:
        angina_num = df['ExerciseAngina'].astype(float)
    df['Stress_Index'] = df['Oldpeak'] * (angina_num + 1.0)
    
    # 5. Duke Treadmill Score Equivalent (Clinical Risk Score)
    df['Duke_Equiv'] = (df['HR_Ratio'] * 10.0) - (5.0 * df['Oldpeak']) - (4.0 * angina_num)
    
    # 6. Atherosclerotic Exposure Index
    df['Cholesterol_Age_Ratio'] = df['Cholesterol'] / (df['Age'] + 1e-5)
    
    return df

class GPUMultiLearnerStackingClassifier:
    """
    Hospital-grade GPU-Accelerated Stacking Classifier for Heart Failure:
    - Base Level 0 (GPU & High-Diversity Ensembles):
      * XGBoost (CUDA Hist)
      * CatBoost (GPU Symmetric Trees)
      * LightGBM (Leaf-wise Gradient Boosting)
      * Random Forest (Bagging De-correlated Trees)
      * Extra Trees (Extremely Randomized Trees)
    - Meta Level 1:
      * Platt-Calibrated Logistic Regression on 5-Fold Out-of-Fold (OOF) Probabilities
    """
    def __init__(self, use_gpu=True):
        self.use_gpu = use_gpu
        self.scaler = StandardScaler()
        self.base_learners = {}
        self.meta_learner = None
        self.optimal_threshold = 0.50
        
    def fit(self, X_train, y_train):
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        n_samples = len(X_train)
        
        xgb_device = 'cuda' if self.use_gpu else 'cpu'
        cb_task = 'GPU' if self.use_gpu else 'CPU'
        
        self.base_learners = {
            'xgboost': xgb.XGBClassifier(
                n_estimators=300, max_depth=5, learning_rate=0.03,
                subsample=0.85, colsample_bytree=0.85,
                device=xgb_device, eval_metric='logloss', random_state=42
            ),
            'catboost': cb.CatBoostClassifier(
                iterations=400, depth=6, learning_rate=0.03,
                task_type=cb_task, verbose=0, random_state=42
            ),
            'lightgbm': lgb.LGBMClassifier(
                n_estimators=300, max_depth=5, num_leaves=31, learning_rate=0.03,
                subsample=0.85, colsample_bytree=0.85, random_state=42, verbose=-1
            ),
            'random_forest': RandomForestClassifier(
                n_estimators=350, max_depth=8, min_samples_split=4,
                n_jobs=-1, random_state=42
            ),
            'extra_trees': ExtraTreesClassifier(
                n_estimators=350, max_depth=8, min_samples_split=4,
                n_jobs=-1, random_state=42
            )
        }
        
        oof_preds = np.zeros((n_samples, len(self.base_learners)))
        
        for fold, (train_idx, val_idx) in enumerate(cv.split(X_train, y_train), 1):
            X_tr, y_tr = X_train[train_idx], y_train[train_idx]
            X_v, y_v = X_train[val_idx], y_train[val_idx]
            
            for m_idx, (m_name, clf) in enumerate(self.base_learners.items()):
                clf_fold = clf.__class__(**clf.get_params())
                clf_fold.fit(X_tr, y_tr)
                oof_preds[val_idx, m_idx] = clf_fold.predict_proba(X_v)[:, 1]
                
        meta_lr = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
        meta_lr.fit(oof_preds, y_train)
        self.meta_learner = meta_lr
        
        for m_name, clf in self.base_learners.items():
            clf.fit(X_train, y_train)
            
        meta_train_probs = self.predict_proba_raw(X_train)
        best_f1, best_th = 0.0, 0.50
        for th in np.linspace(0.20, 0.80, 61):
            f1 = f1_score(y_train, (meta_train_probs >= th).astype(int), zero_division=0)
            if f1 > best_f1:
                best_f1 = f1
                best_th = th
        self.optimal_threshold = float(best_th)
        return self
        
    def predict_proba_raw(self, X):
        base_preds = np.zeros((len(X), len(self.base_learners)))
        for m_idx, (m_name, clf) in enumerate(self.base_learners.items()):
            base_preds[:, m_idx] = clf.predict_proba(X)[:, 1]
        meta_probs = self.meta_learner.predict_proba(base_preds)[:, 1]
        return meta_probs
        
    def predict_proba(self, X):
        probs = self.predict_proba_raw(X)
        return np.column_stack([1.0 - probs, probs])
        
    def predict(self, X):
        probs = self.predict_proba_raw(X)
        return (probs >= self.optimal_threshold).astype(int)

class GPUClinicalStackingEnsemble:
    """
    Hospital-grade GPU-Accelerated Multi-Learner Ensemble for Large-Cohort Clinical Prediction.
    """
    def __init__(self, use_gpu=True, scale_pos_weight=1.0):
        self.use_gpu = use_gpu
        self.scale_pos_weight = scale_pos_weight
        self.models_level0 = {}
        self.meta_learner = None
        self.optimal_threshold = 0.50
        self.is_fitted = False
        
    def _create_level0_learners(self):
        learners = {}
        # 1. XGBoost CUDA
        try:
            xgb_clf = xgb.XGBClassifier(
                n_estimators=300,
                max_depth=6,
                learning_rate=0.04,
                subsample=0.85,
                colsample_bytree=0.85,
                tree_method='hist' if self.use_gpu else 'hist',
                device='cuda' if self.use_gpu else 'cpu',
                scale_pos_weight=self.scale_pos_weight,
                random_state=42,
                eval_metric='logloss'
            )
            learners['xgb'] = xgb_clf
        except Exception:
            learners['xgb'] = xgb.XGBClassifier(n_estimators=300, max_depth=6, learning_rate=0.04, random_state=42)
            
        # 2. CatBoost GPU
        try:
            cb_clf = cb.CatBoostClassifier(
                iterations=350,
                depth=6,
                learning_rate=0.04,
                task_type='GPU' if self.use_gpu else 'CPU',
                auto_class_weights='Balanced' if self.scale_pos_weight != 1.0 else None,
                verbose=0,
                random_seed=42
            )
            learners['cat'] = cb_clf
        except Exception:
            learners['cat'] = cb.CatBoostClassifier(iterations=350, depth=6, verbose=0, random_seed=42)
            
        # 3. LightGBM
        lgb_clf = lgb.LGBMClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.04,
            subsample=0.85,
            colsample_bytree=0.85,
            scale_pos_weight=self.scale_pos_weight,
            random_state=42,
            n_jobs=-1,
            verbose=-1
        )
        learners['lgb'] = lgb_clf
        
        # 4. Extra Trees
        et_clf = ExtraTreesClassifier(
            n_estimators=200,
            max_depth=12,
            class_weight='balanced' if self.scale_pos_weight != 1.0 else None,
            random_state=42,
            n_jobs=-1
        )
        learners['et'] = et_clf
        
        return learners

    def fit(self, X, y, n_splits=5):
        skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
        learners_dict = self._create_level0_learners()
        learner_names = list(learners_dict.keys())
        oof_preds = np.zeros((len(X), len(learner_names)), dtype=np.float32)
        
        for train_idx, val_idx in skf.split(X, y):
            X_tr, y_tr = X[train_idx], y[train_idx]
            X_va, y_va = X[val_idx], y[val_idx]
            
            fold_learners = self._create_level0_learners()
            for col_i, name in enumerate(learner_names):
                clf = fold_learners[name]
                clf.fit(X_tr, y_tr)
                oof_preds[val_idx, col_i] = clf.predict_proba(X_va)[:, 1]
                
        self.models_level0 = self._create_level0_learners()
        for name, clf in self.models_level0.items():
            clf.fit(X, y)
            
        base_meta = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
        self.meta_learner = CalibratedClassifierCV(estimator=base_meta, method='sigmoid', cv=3)
        self.meta_learner.fit(oof_preds, y)
        self.is_fitted = True
        return self

    def predict_proba_raw(self, X):
        learner_names = list(self.models_level0.keys())
        preds = np.zeros((len(X), len(learner_names)), dtype=np.float32)
        for col_i, name in enumerate(learner_names):
            clf = self.models_level0[name]
            preds[:, col_i] = clf.predict_proba(X)[:, 1]
        return self.meta_learner.predict_proba(preds)[:, 1]

    def predict_proba(self, X):
        probs = self.predict_proba_raw(X)
        return np.column_stack([1.0 - probs, probs])

    def predict(self, X, threshold=None):
        th = threshold if threshold is not None else self.optimal_threshold
        probs = self.predict_proba_raw(X)
        return (probs >= th).astype(int)
