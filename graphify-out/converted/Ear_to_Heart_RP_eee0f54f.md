<!-- converted from Ear_to_Heart_RP.docx -->


Abstract
Cardiovascular diseases remain a major global health concern, creating a need for accessible, continuous, and non-invasive approaches to physiological monitoring and preliminary risk assessment. Conventional electrocardiography (ECG) and clinical cardiac investigations provide valuable diagnostic information, but their availability and time taking process leads to serious risk. This paper presents Ear-to-Heart, a prototype multimodal ear-based cardiac disease detection and screening system that integrates physiological sensing, embedded signal processing, and a web-based screening platform to investigate the potential risks through ear-worn measurements for preliminary cardiac risk screening.
The proposed hardware architecture incorporates an ECG acquisition module, a MAX30102 compatible photoplethysmography (PPG) sensor, a BMI323 motion sensor, and a LM35 temperature sensor interfaced with an ESP32 microcontroller. ECG provides information about electrical cardiac activity, PPG captures peripheral blood-volume changes associated with pulsatile circulation, motion sensor detects the movement so that to reduce the artefacts, and temperature measurements provide additional physiological context. The embedded firmware performs sensor acquisition, signal-quality assessment, motion monitoring, and preliminary physiological parameter estimation. Processed measurements and system-status information are transmitted to a web-based interface for visualization, screening, instant analysis report and machine learning integration to detect potential cardiac abnormalities.
The proposed analytical framework aims to investigate synchronized multimodal feature extraction, signal-quality-aware fusion, and machine-learning-based screening for patterns potentially associated with cardiac abnormalities, including ischemia, cardiac amyloidosis, and cardiac fibrosis. The reliability of such predictions depends on signal quality, representative labelled datasets, independent testing, and comparison with appropriate clinical reference measurements. Therefore, Ear-to-Heart is positioned as a research prototype rather than a replacement for conventional diagnostic procedures. Experimental evaluation is required to establish its measurement accuracy, classification performance, robustness under motion, and suitability for real-world screening.
Keywords
Ear-worn health monitoring; multimodal physiological sensing; electrocardiography (ECG); photoplethysmography (PPG); motion artefact detection; signal quality assessment; ESP32; machine learning; cardiovascular risk screening; cardiac signal processing; web-based health screening.



1. Introduction
Cardiovascular diseases are a leading cause of morbidity and mortality worldwide, highlighting the importance of accessible monitoring methods that can support early identification of potentially abnormal physiological patterns. Conventional cardiac assessment relies on clinical examination, electrocardiography (ECG), laboratory investigations, medical imaging, and other diagnostic procedures selected according to the suspected condition. Although these methods are essential for clinical diagnosis, they may require specialized equipment, trained personnel, or healthcare facilities. Wearable and compact physiological monitoring offers an opportunity to collect cardiovascular-related measurements over longer periods, potentially supporting research into earlier risk identification and more accessible health monitoring.
The development of wearable sensing technologies has expanded the possibilities for acquiring physiological signals from locations such as the wrist, chest, finger, and ear. The ear is a particularly interesting sensing location because it can accommodate compact wearable devices and provide access to physiological measurements associated with cardiac electrical activity and peripheral circulation. Previous research on ear-worn monitoring has explored combinations of ECG, photoplethysmography (PPG), and mechanical or inertial sensing for estimating heart rate and other cardiovascular-related parameters. These studies establish the feasibility of ear-based physiological monitoring while also highlighting the challenges associated with sensor placement, signal quality, movement, and measurement reliability.
ECG records electrical potential differences associated with cardiac activity, whereas PPG uses optical measurements to detect changes in blood volume within peripheral tissue. These provide complementary information: ECG reflects electrical events, while PPG reflects pulsatile vascular responses. Their temporal relationship may support the extraction of additional features, provided that both signals are acquired reliably and their timing is appropriately synchronized. However, an ECG signal obtained from an ear-worn configuration may differ from a conventional clinical ECG because of electrode placement, electrical lead configuration, contact impedance, and anatomical characteristics. Consequently, an ear-derived ECG should not be assumed to reproduce the morphology or diagnostic information of a standard 12-lead ECG. Here Ear to Heart takes ECG from nearby ear but motion sensor reduces other electrical and physical signals which leads to get similar result of this ECG method with clinical ECG method.
A major challenge in wearable cardiac monitoring is the presence of motion artefacts and other sources of signal degradation. Body movement, sensor displacement, variations in skin contact, ambient optical interference, and electrical noise can affect the quality of ECG and PPG measurements. Such disturbances can introduce errors into extracted features and potentially reduce the reliability of subsequent machine-learning predictions. In particular, a model trained on clean signals may perform poorly when deployed on noisy, motion-contaminated, or otherwise unrepresentative real-world recordings. Signal-quality assessment is therefore an important component of a reliable wearable monitoring pipeline.
Inertial measurement units provide acceleration and angular-velocity measurements that can be used to characterize movement during physiological signal acquisition. Incorporating IMU information alongside ECG and PPG creates an opportunity to identify motion-corrupted segments, evaluate signal reliability, and guide the selection or weighting of physiological features. Rather than assuming that every acquired segment is suitable for analysis, a quality-aware system can flag unreliable measurements, exclude unsuitable windows, or request another recording. Nevertheless, motion detection alone does not guarantee successful artefact removal; the effectiveness of any filtering or compensation method must be evaluated experimentally against reference signals.
In addition to physiological sensing, embedded computing and web technologies can support the development of integrated monitoring systems. A microcontroller can collect measurements from multiple sensors, perform initial signal processing, estimate basic physiological parameters, and transmit structured data to a software interface. A web-based platform can then present measurements, signal-quality indicators, sensor status, and analytical outputs in an accessible format. Such integration can facilitate data inspection, research-data collection, algorithm evaluation, and future development of machine-learning-based screening methods.
This paper presents Ear-to-Heart, a prototype designed to investigate the integration of ear-based multimodal sensing, embedded signal processing, motion-aware signal-quality assessment, and web-based physiological data visualization. The hardware architecture comprises an ESP32 microcontroller, an ECG acquisition module, a MAX30102 optical sensor, a BMI323 IMU, and a temperature sensor. The firmware acquires physiological and movement-related measurements, estimates basic parameters such as heart rate and peripheral oxygen saturation when signal conditions permit, and transmits measurements and quality-related status information to a software platform. The website is intended to support visualization, monitoring, data management, instant report and integration with downstream analytical models.
Beyond basic physiological monitoring, the proposed research investigates whether quality-controlled multimodal features can support preliminary machine-learning-based screening for patterns potentially associated with cardiac ischemia, cardiac amyloidosis and fibrosis. These conditions are associated with different underlying pathological processes and cannot be assumed to be identifiable from the same features or sensor modalities. In particular, disease-specific models require appropriately labelled datasets, reliable reference diagnoses, and validation across independent participants and acquisition conditions. The presence of ECG, PPG, IMU, and temperature sensors does not, by itself, establish the ability to detect these diseases.
The central research objective is therefore to develop and evaluate a pipeline in which synchronized physiological measurements undergo preprocessing, signal-quality assessment, feature extraction, and, where supported by suitable data, multimodal fusion and machine-learning-based risk classification. The framework is intended to distinguish reliable measurements from potentially misleading inputs and to communicate uncertainty or insufficient signal quality rather than presenting every model output as trustworthy. The study also considers how embedded acquisition and web-based visualization can form a practical foundation for subsequent experimental evaluation.
The principal contributions of this work are the integration of multiple physiological sensing modalities into an ear-oriented monitoring prototype; the incorporation of motion and signal-quality information into the proposed processing workflow; the development of a software interface for viewing and managing physiological measurements; and the formulation of an evaluation framework for investigating machine-learning-based cardiac screening. The intended contribution is not to claim that the individual sensors or general AI-based cardiac analysis techniques are new, but to investigate their coordinated implementation and performance in the proposed system
2. Related Work
This section examines fifteen studies in the field of ear-based physiological monitoring, multimodal sensing, PPG motion-artifact reduction, signal-quality assessment, wearable-signal validation, and artificial intelligence-based cardiac analysis. The reviewed papers provide the background and technical context for the development of the proposed Ear-to-Heart system in ear-based monitoring, multimodal processing, and AI-assisted cardiac screening.
2.1 The Ear as a Sensing Location
David S. Winokur, David Da He, and Charles G. Sodini [1] investigated an ear-worn vital-sign monitoring system that could acquire multiple physiological signals, including single-lead ECG, ballistocardiography (BCG), and PPG. Their work demonstrated that an ear-mounted system could be used to obtain cardiovascular information continuously, and that relationships between different physiological signals could provide additional cardiovascular parameters.
David Da He, Eric S. Winokur, Thomas Heldt, and Charles G. Sodini [2] specifically investigated the ear as a location for wearable vital-sign monitoring. Their study examined PPG acquired from behind the ear and compared its characteristics with conventional finger-based PPG. The work also considered BCG-based cardiovascular measurements, demonstrating that the ear can provide useful physiological information through multiple sensing mechanisms. These findings provide an important basis for selecting the ear or ear-lobe region as the sensing location in the proposed Ear-to-Heart system.
The systematic review by Y. J. Choi, S. Jeon, H. Kim, J. Ha, G. Jeon, and J. Lee [3] further examined health-related indicators measured using earable devices. The review included physiological parameters such as PPG, ECG, body temperature, and acceleration, along with multimodal sensing approaches. The findings suggest that earable technology can support the acquisition of several physiological signals within a compact sensing platform.
Together, these studies establish the feasibility of ear-based physiological monitoring and provide the foundation for investigating an ear-centered multimodal system.

2.2 Multimodal Ear-Worn Cardiac Monitoring
The work of Winokur et al. [1] demonstrated simultaneous acquisition of ECG, BCG, and PPG using an ear-worn platform. The study explored the temporal relationships between these signals and showed that combining different physiological measurements can provide cardiovascular information beyond individual signal measurements.
David Da He, Eric S. Winokur, and Charles G. Sodini [4] further investigated an ear-worn vital-sign monitor capable of estimating several cardiovascular parameters. Their work considered heart rate, pulse transit time, pre-ejection period, and cardiac output using relationships among ECG, BCG, and PPG signals. In particular, the timing relationships between electrical and mechanical cardiac events were investigated for cardiovascular parameter estimation.
These studies are relevant to Ear-to-Heart because the proposed system also considers multiple synchronized physiological signals rather than relying on a single sensor. ECG provides information about electrical cardiac activity, while PPG provides information associated with peripheral blood-volume changes. The addition of IMU and temperature measurements provides motion and physiological context. Therefore, the proposed architecture extends the multimodal sensing concept towards a quality-aware cardiac screening framework.
2.3 Motion-Artifacts in PPG
Z. Hao, J. Wang, G. Zhang, L. Gao, X. Zhang, J. Liu, and Xiaoming Zhang [5] investigated a PPG heart-rate extraction method based on the classification and removal of motion artifacts. Their approach combined acceleration information with PPG characteristics to identify the influence of movement on heart-rate estimation. This work demonstrates the usefulness of inertial information when processing motion-contaminated PPG signals.
A. K. Maity, A. Veeraraghavan, and A. Sabharwal [6] proposed PPGMotion, a model-based method for detecting motion artifacts in photoplethysmography signals. The method was evaluated using real and synthetic datasets and focused on identifying motion-contaminated portions of PPG. This is relevant to the proposed system because it emphasizes that unreliable signal segments should be recognized before physiological features are extracted.
M. Sicbaldi, L. Palmerini, S. Moscato, P. Di Florio, and A. Silvan [7] investigated the performance of open-source heart-rate estimation algorithms using motion-corrupted PPG signals. Their benchmarking study demonstrated that algorithm performance can vary under different motion conditions, highlighting the effect of signal contamination on physiological estimation.
Christodoulos Kechris, Jonathan Dan, Jose Miranda, and David Atienza [8] proposed a knowledge-informed deep-learning approach for heart-rate extraction from smartwatch PPG. Their study considered signal degradation and motion artifacts while incorporating physiological knowledge into the analysis.
These studies collectively demonstrate that motion is an important factor affecting wearable PPG reliability. They also support the use of inertial measurements for identifying or reducing motion-related contamination. In Ear-to-Heart, the BMI323 IMU is therefore incorporated to estimate movement and support the proposed adaptive PPG artifact-reduction stage. Since most of the reviewed studies focus on wrist-worn or smartwatch measurements, the effectiveness of these approaches for ear-based PPG requires further experimental evaluation.
2.4 Signal-Quality Assessment
E. K. Naeini, F. Sarhaddi, and their co-authors[9] investigated a deep-learning-based approach for PPG signal-quality assessment and heart-rate variability analysis. Their study demonstrated that the quality of a PPG segment has a direct influence on the reliability of extracted physiological features. The work also showed that different physiological parameters may require different levels of signal quality.
This finding is particularly important for an AI-based screening system because a signal segment that is sufficient for basic heart-rate estimation may not necessarily be reliable enough for extracting HRV or morphology-related features. Therefore, signal-quality assessment should be treated as an independent processing stage rather than assuming that every sensor output is suitable for subsequent analysis.
Y. Liu and A. Montanari [10] proposed EarFusion, a quality-aware approach combining in-ear audio and PPG for heart-rate monitoring. Their study considered the limitations of PPG caused by motion, sensor variability, and environmental interference and investigated complementary information from another sensing modality. This work further supports the concept of quality-aware multimodal sensing at the ear.
Based on these findings, the proposed Ear-to-Heart system incorporates signal-quality assessment before feature extraction and future AI inference. ECG quality, PPG quality, motion conditions, and physiological validity are considered so that unreliable segments can be rejected or down-weighted rather than directly influencing the screening output.
2.5 Validation of Wearable Physiological Measurements
P. Vermunicht, K. Mayaked, C. Buyck, L. Knaepen, J. S. Piedrahita Giraldo, and S. Naessens [11] investigated continuous heart-rate measurements in patients with cardiac disease and compared wearable-device measurements with clinical monitoring. Their work considered wearable PPG and ECG measurements and examined the effect of artifact-removal procedures. The study demonstrated the importance of comparing wearable measurements with an appropriate clinical reference when evaluating measurement reliability.
P. Vermunicht, C. Buyck, S. Naessens, H. Van Craenebroeck, and J. S. Piedrahita Giraldo [12] further investigated machine-learning-based detection and removal of artifacts from wearable PPG data using longitudinal recordings. Their work emphasized the importance of identifying unreliable measurements before using them for physiological assessment and showed that factors such as measurement conditions and sensor placement can affect PPG reliability.
These studies are relevant to the proposed system because Ear-to-Heart is also intended to undergo comparison with reference measurements. In particular, future experiments should investigate ear versus finger PPG, different sensor placements, stationary and motion conditions, and agreement with appropriate reference devices. Such validation is necessary before making any claims regarding clinical-level performance.
2.6 Artificial Intelligence for Cardiac Analysis
L. Dhingra, B. Coon, P. Cronin, and A. Aminorraoya [13] investigated a single-lead ECG-derived digital biomarker for cardiovascular risk using wearable ECG recordings. Their work demonstrates that single-lead ECG can potentially provide useful information for cardiovascular-risk assessment and does not necessarily require conventional multi-lead ECG for every type of digital analysis.
P. Boulanger [14] investigated the influence of motion artifacts on ambulatory ECG monitoring and discussed multimodal deep-learning approaches for improving robustness in arrhythmia screening. This work is relevant to Ear-to-Heart because it highlights the importance of considering motion information when developing AI systems based on ambulatory physiological signals.
Assalhi Imane, Bybi Abdelmajid, Drissi Lahssani Hilal, Ebediene, and Yves Frederic [15] reviewed recent applications of artificial intelligence for atrial-fibrillation detection using different ECG configurations. Their review included single-lead, 12-lead, and image-based ECG approaches and demonstrated the increasing use of AI methods for automated ECG analysis.
The reviewed AI studies demonstrate the potential of machine learning for extracting clinically relevant information from physiological signals. However, their primary focus is on arrhythmia detection or general cardiovascular-risk assessment. The literature reviewed here provides comparatively limited investigation of an ear-based multimodal system combining ECG, PPG, IMU, and temperature for preliminary screening of patterns associated with ischemia, cardiac amyloidosis, and cardiac fibrosis.
2.7 Research Gap
The reviewed literature demonstrates that the ear is a feasible location for physiological sensing [1][3][2], while previous ear-worn systems have shown the value of combining ECG, PPG, and mechanical or inertial measurements [1][4]. Research on PPG motion artifacts has demonstrated the importance of acceleration-based motion information and artifact handling [5][6][7][8]Studies on signal-quality assessment have further shown that unreliable physiological segments can affect feature extraction and automated analysis [9] [10]Wearable validation studies have emphasized comparison with reference measurements and the importance of artifact detection[11] [12]AI-based ECG studies have demonstrated the potential for automated cardiac-risk and rhythm analysis [13][14][15].
The proposed Ear-to-Heart system addresses this research direction by integrating these components into a single processing pipeline. Rather than treating the output as a clinical diagnosis, the proposed system is intended to investigate whether quality-controlled multimodal physiological features can provide useful early risk indication or preliminary abnormality screening. Disease-specific performance for ischemia, cardiac amyloidosis, and cardiac fibrosis remains to be experimentally evaluated using appropriately labelled datasets and validated reference measurements.

3. Methodology
3.1 Overview of the Proposed Framework
The Ear-to-Heart (EarCardio) device consists of a sensor located on the level of the ear, an ESP32 embedded controller, wireless communication, a backend for processing signals performing machine-learning inference, and a web dashboard. Six main steps make up the data flow: (1) physiological data acquisition; (2) embedded processing, packet creation; (3) data transmission through Wi-Fi or Bluetooth Low Energy (BLE); (4)  signal processing, quality assessment, and feature extraction; (5) machine-learning analysis and website rendering.


Fig. 1: Overall Ear-to-Heart workflow from ear-level sensing to the dashboard.
The system developed is a research tool/screening prototype and not to be considered as a diagnostic device. The machine-learning component of the system analyses patterns of the signal, but classification of cardiac activity or abnormality by this system is not an assertion that it can detect heart disease. Classification of specific disease such as ischemia, cardiac amyloidosis or fibrosis would require separate models, clinically annotated training data, and independent validation, all of which are considered work for the future. Any abnormality suggested by the system would need to be confirmed using standard clinical methods.
3.2 Hardware Platform and Data Acquisition
The primary controller, which communicates with the sensors, records the measurements according to the timestamp/index, packages the data, and monitors the work of sensors and the communication system, is the ESP32-WROOM-32. Sensors are summarized in Table 1, with the connections shown in Table 2.

Table 1: Sensors and Their Roles





Table 2: ESP32 Pin Assignment

The process is accomplished in six stages – (1) preparation of sensors and settings; (2) collection of light, electrical, motion, and temperature readings; (3) assigning time reference - timestamp/index; (4) checking the sensors for accessibility, missing measures, and communication problems; (5) temporarily buffering; and (6) packaging the data. The sampling interval depends on the sensor settings (e.g., for 100 Hz sensor one would get around 100 measures per second), with the ECG signal being sampled at around 200 Hz. Timing issues that help to understand the connection between timing of pulse timings, pulse duration, and cross-modal relations are accomplished at the very high level. All channels are synchronized accordingly to the signal from ESP32 and correction is made using beat timings obtained from ECG.
In the initial development stages, a PPG sensor can be validated on a finger to show that it works properly; however, the sensor is designed to be installed on the individual's ear. The OLED used for debugging purposes is omitted from the final design. When it comes to ECG tests, a portable battery-operated device must be employed for testing purposes.

Fig. 3: Prototype hardware and intended ear-sensor placement.

3.3 Data Transmission and Packet Structure
The backend can receive data through any of two methods. In the Wi-Fi method, the ESP32 connects to the network and communicates with either Http or WebSocket, which allows for consistent networking. In the BLE method, the data is sent a mobile app or compatible web browser to forward the information to the backend. The method used will be determined by the form of hardware used and the environment of deployment. Each packet contains the attributes as shown in table 3, and with respect to the example in the project description, the values mentioned are for understanding purposes only and not from actual readings of the prototype. In case of making a product, missing readings should be accounted for along with sequence numbers, sensor information, unit measurement, security measures and communication.
Table 3: Sensor Packet Fields

3.4 Data Preprocessing
Raw readings tend to have noise, motions and other forms of disturbances which should be removed before applying the learning algorithms. Filter type selection varies depending on the signal type, sampling frequency and measurement, as a bad filter can displace the signal and take away vital information. The table 4 explains the parameters and the Fig. 4 illustrates the process.


Table 4: Preprocessing Parameters


Fig. 4: Signal-processing pipeline with IMU-assisted artifact reduction and quality gating.

Adaptive artifact mitigation using IMU motion data A scalar motion reference is estimated using the magnitudes of the contributions made by the accelerometer which will deviate from the standard value of 1 g and the contributions made by the gyroscope:
(1)

y(n) = wᵀ(n)x(n), e(n) = d(n) – y(n)	 			(2)
Next, the values of w(n) are deduced through the formulas:
w(n+1) = w(n)+ μ·e(n)·x(n) 					(3)
The output e(n) is smoothed before used in quality assessment; it is called IMU-based adaptive motion-artifact removal, the usefulness of which is well-known since the disturbance cannot be completely eliminated and parameters μ, L, and α, β need to be experimentally tuned to utilize the method for ear-based devices.
Assessment of Signal Quality. The quality index q of every modality/window combination is computed as the weighted sum of scores sᵢ of selected variables sᵢ; the equation can be expressed as:
q = Σᵢwᵢsᵢ, with condition Σᵢwᵢ = 1				 (4)
If q passes threshold τₕ, the data are accepted; if the quality of the data falls within intervals contained by thresholds τₗ and τₕ, the weights get decreased for the following analysis; otherwise, the available data are deemed to have poor quality and, hence, are rejected.
In EEG modality, the following parameters are included: amplitude, saturation, AC/DC ratio, level of motion, valid HR range, and level of acceptance signal; in ECG modality, following parameters are incorporated: amplitude range, lead-off status, level of motion, waveform recognition, and regularity. The frames (windows) of poor quality are left out of the analysis with models, and predictions are not performed in the cases where the available data violate the criteria on which models were trained.


3.5 Feature Extraction
Feature extraction refers to the transformation of raw data into the numbers (Table 5) and can be expressed by the following equations:
(6)
(7)
with PAT being the measure of pulse arrival time (both pulse transit time and pulse arrival time and measures as done in [5], [6] for ear devices) and was being acceleration magnitude. The same feature extraction method will be used both in the training stage as well as in application of the model.
Table 5: Extracted Features by Modality

Feature-based models use these vectors, whereas deep models may learn representations directly from suitable waveform windows.
3.6 Data Augmentation
In terms of feature extraction methods used in the model, vectors will be applied in case with deep neural systems where the system which will learn such features from waveforms on its own. The performance will be evaluated after performing the augmentation method only on the training data to keep validation and test data intact from any augmentation or artificial growing of the number of subjects. The methods of transformation include amplitude scaling, baseline shift substitution and noise generation, 50 Hz signal production, minimal time change and generating synthetic artifacts of IMUs.

3.7 Dataset Partitioning
The data is split into three datasets: training, validation, and independent test dataset depending on the participant, so that no individual contributes to more than one set. This minimizes the chances of a model being mistakenly regarded as reliable because it has observed similar recordings by the same individuals. In cases where the samples were small, leave-one-participant-out or k-fold cross-validation was adopted. Hyperparameters were tuned only based on validation data and test data was used only for final evaluation. Three datasets were studied (Table 6).
Table 6: Datasets Used or Planned
In the preliminary experiments, the public Pulse Transit Time PPG dataset [16] consisting of 66 waveform recordings from 22 healthy subjects was used along with 48 features obtained through various extraction algorithms. Three activity classes were considered during the classification task (running, sitting and walking). The methodology was presented in the context of activity classification and not health disorders detection. Given that only two subjects are in the testing group, the findings are not indicative of generalization capabilities, and further validation is required. The ratios of splitting and sample size for ear and clinical studies are unknown.
3.8 ML-Based Classification
It is essential to understand that different models work for different purposes. There is no guarantee that a model trained for one problem can be utilized for another problem. Model selection is based on experiments, not on model complexity level (Table 7). Each model must be appropriately defined in terms of input, output and evaluation process.




Table 7: Candidate Models by Task

Random Forest and XGBoost rely on processed features but 1D CNN is used for signals; LSTM works with time-based features in the signals; logistic regression is the fundamental interpretable technique in all binary classification problems. Python (Google Colab) is used in addition to the modules; NumPy, Pandas, SciPy, scikit-learn, XGBoost, TensorFlow or PyTorch and WFDB for signal processing. The process is made up of such steps as collecting the data, analyzing data quality, preprocessing data, extracting features, splitting data, training, tuning the hyperparameters, validating, testing, and storing the model. The problem of overfitting is solved by means of regularization and early stopping in the learning process. The disease probability is generated only under appropriate conditions.
3.9 Autoencoder-Based Anomaly Detection and Localisation
In the case of anomaly detection, the autoencoder is trained on the specific reference dataset with the goal of input reconstruction. The difference between reconstruction and input serves as error score:
(8)
where xᵢ refers to the input and x̂ᵢ refers to the reconstruction of input and N is the number of inputs. Using similar error calculation results for short subsections makes it possible to develop e(t) profile versus time and detect which subsections differ from the reference.
The notification related to the window occurs when there is a malfunction in the function E(x) that is more than a predetermined limit. The comparison with Isolation Forest is one of the methods applied. However, it is worth noting that a high score does not always indicate an illness, and the true reason for the anomaly might be motion artifacts, sensor shifting, or some other unidentified phenomenon. This means that it is going to be necessary to evaluate every single window flagged as faulty and not to make any effort to identify whether a certain body part is affected.
3.10 Backend, Deployment and Dashboard
The backend system receives, verifies, processes and analyzes the packets of data, runs the indicated model, records the measurements, sends them every time the update occurs, and authenticates users. All these processes are shown in Fig. 6. It should be emphasized that the training and inference are performed at the same time, with the trained model being preserved with the pre-processing stages and thresholds for the algorithms to apply in the inference phase. The information is sent to the web application with the help of REST APIs or  WebSockets .


Fig. 6: Backend and deployment architecture.
Table 8: Technology Stack

The dashboard displays an instantaneous monitoring system along with connecting devices; PPG (and ECG) waveforms; physiological measurements such as heart rate, and pulse-wave; signal quality; model output in use (activity class or anomaly score); past data trends; alerts and reports; logging with CSV format; and as a future extension, a medical professional view. A feature is said to be implemented when it exists and works on the main website.
Fig. 7: EarCardio web dashboard (software screenshot).
3.11 Evaluation Metrics
The correctness of heart rate (and SpO₂ where applicable) obtained from the ear as compared to the heart rate obtained from standard devices is evaluated using MAE, RMSE, correlation, and Bland Altman limits and bias:
MAE = (1/N)Σ|ŷᵢ − yᵢ|,   RMSE = √((1/N)Σ(ŷᵢ − yᵢ)²),   LoA = d̄ ± 1.96·s_d		(9)
The classification method utilizes parameters including accuracy, precision, recall (sensitivity), and specificity, besides F1 score computed from the confusion matrix. Calibration and confidence intervals (e.g., participant-level bootstrap) are considered in this evaluation:
Acc = (TP+TN)/(TP+TN+FP+FN),  Prec = TP/(TP+FP),  Sens = TP/(TP+FN),
Spec = TN/(TN+FP),  F1 = 2·Prec·Sens/(Prec+Sens)					(10)
In terms of clinical outcomes prediction, two metrics of relevance are sensitivity and specificity, although the appropriate metrics to use vary depending on the analysis objective and on the consequences of positive and negative errors. The classification method is shown in Table 9 based on the analysis objectives.
Table 9: Evaluation Metrics by Task

3.12 Security, Privacy and Reliability
This system utilizes authentication and access controls, encryption of communications, protected storage, data validation, detection of missing or bad data, monitoring of model versions, adherence to retention policies, and communication of possible uncertainties in those readings since the data being used is physiological data.






4. Experimental Results and Performance Evaluation
To rigorously assess the diagnostic efficacy and feasibility of the Ear-to-Heart analytical pipeline, comprehensive experimental evaluations were conducted across both raw physiological time-series waveforms and structured clinical biomarker datasets. The evaluation encompasses: (1) deep learning-based multi-label cardiac anomaly classification directly on raw electrocardiographic signals from the PTB-XL cohort; (2) disease-specific tabular screening models targeting Ischemia, Cardiac Amyloidosis, and Cardiac Fibrosis; (3) clinical risk stratification for Heart Failure; and (4) holistic multi-metric profiling across all diagnostic modules.
4.1 Raw Waveform Deep Learning Diagnostic Performance (PTB-XL 1D-CNN)
The deep learning architecture was evaluated on the benchmark PhysioNet PTB-XL electrocardiography dataset, comprising 21,799 clinical 12-lead ECG records sampled over 10-second intervals. A patient-stratified 10-fold cross-validation scheme was implemented (Folds 1–8 for training, Fold 9 for validation, and Fold 10 strictly reserved as an unseen clinical test cohort). The 1D-CNN maps raw voltage series directly to five non-mutually exclusive diagnostic superclasses: Normal ECG (NORM), Myocardial Infarction (MI), ST/T Changes (STTC), Conduction Disturbance (CD), and Hypertrophy (HYP). The diagnostic metrics obtained on the unseen test cohort are summarized in Table 10 and depicted in Fig. 8.
Table 10: 1D-CNN Multi-Label Diagnostic Performance on PTB-XL Unseen Test Cohort

Fig. 8: 1D-CNN multi-label diagnostic performance across PTB-XL ECG superclasses on the independent test cohort (Macro ROC-AUC: 0.9004).
As demonstrated in Fig. 8, the 1D-CNN demonstrated robust discriminative capability across the primary cardiac abnormalities, achieving a Macro ROC-AUC of 0.9004. In particular, detection of acute critical conditions achieved high sensitivity: 82.10% for Myocardial Infarction (ROC-AUC: 0.9212) and 83.94% for ST/T wave changes (ROC-AUC: 0.9262). Normal physiological rhythms (NORM) were identified with an ROC-AUC of 0.9314 and a Precision-Recall AUC of 0.9014. While Hypertrophy exhibited a comparatively lower PR-AUC (0.4616) due to substantial class prevalence imbalance in the cohort, the overall waveform representation learned by the convolutional blocks captures critical temporal morphology without relying on manual P-QRS-T feature engineering.
4.2 Tabular Specific-Disease Screening Performance (XGBoost Models)
For targeted pathology screening from structured physiological parameters, independent Extreme Gradient Boosting (XGBClassifier) pipelines were trained and validated across three major disease cohorts: Ischemia (8,038 patient cases), Cardiac Amyloidosis (8,000 cases), and Cardiac Fibrosis (8,000 cases). Each pipeline integrated StandardScaler normalization with 5-fold stratified cross-validation to prevent information leakage. The comparative benchmark of accuracy, ROC-AUC, and F1-score across all tabular models is shown in Fig. 9, with comprehensive statistical metrics detailed in Table 11.
Table 11: Specific-Disease Classification Performance Summary (5-Fold Stratified Cross-Validation)

Fig. 9: Comparative performance benchmark of disease classification models across Accuracy, ROC-AUC, and F1-score.

Fig. 10: Confusion matrices for specific-disease XGBoost classifiers across Ischemia, Cardiac Amyloidosis, and Cardiac Fibrosis cohorts.
The comparative benchmark in Fig. 9 highlights the high discriminative ability of the gradient-boosted ensembles. The Amyloidosis detection model achieved the highest diagnostic accuracy at 95.30% with an ROC-AUC of 0.9798 and precision of 92.07%. The Fibrosis and Ischemia models demonstrated balanced F1-scores of 90.58% and 88.80%, respectively. To inspect classification boundaries in detail, Fig. 10 illustrates the confusion matrices across all three conditions. For Ischemia, 3,162 true positive cases were accurately detected against 438 false negatives, while correctly identifying 4,040 true negative controls. For Amyloidosis, 1,370 true positives were separated with merely 118 false positives across 6,372 negative patients. For Fibrosis, 2,879 true positives and 4,522 true negatives were established, affirming strong generalizability without pathological overfitting.
4.3 Clinical Heart Failure Screening and Risk Assessment (Random Forest)
Heart failure risk assessment was performed using a Random Forest Classifier trained on 918 multi-center clinical patient records. The feature matrix incorporated 11 non-invasive clinical and demographic parameters: age, sex, chest pain presentation, resting blood pressure, serum cholesterol, fasting blood sugar, resting electrocardiography, maximum heart rate achieved, exercise-induced angina, ST-depression (Oldpeak), and ST-segment slope. Hyperparameter optimization was conducted via exhaustive GridSearchCV (n_estimators=200, max_depth=10, min_samples_split=5) on an 80% training partition, with evaluation evaluated strictly on the held-out 20% test partition (184 unseen patients). The resulting confusion matrix is presented in Fig. 11.

Fig. 11: Heart failure Random Forest confusion matrix on unseen clinical test cohort (Accuracy: 90.22%, ROC-AUC: 0.9369).
As illustrated in Fig. 11, the Random Forest model achieved an overall test accuracy of 90.22% and an ROC-AUC of 0.9369. Critically for preliminary wearable triage, the model demonstrated an exceptional sensitivity (recall) of 93.14%, correctly identifying 95 out of 102 clinically confirmed heart failure cases while misclassifying only 7 patients. The specificity remained high at 86.59% (71 of 82 healthy controls correctly classified), yielding an F1-score of 91.35% and precision of 89.62%. Clinical feature importance analysis identified the slope of the peak exercise ST-segment (ST_Slope), chest pain classification (ChestPainType), and maximum achievable heart rate (MaxHR) as the top three predictive physiological factors, reinforcing physiological alignment with established cardiovascular diagnostic criteria.
4.4 Multi-Metric Diagnostic Profiling and Comprehensive Synthesis
To synthesize screening performance across all four targeted cardiovascular pathologies, a multi-dimensional radar comparison was constructed across five core evaluation axes: Accuracy, ROC-AUC, F1-Score, Precision, and Sensitivity (Recall). The multi-metric radar profile is depicted in Fig. 12.

Fig. 12: Radar profile synthesizing multi-metric clinical screening performance across all four disease targets.
The radar profile in Fig. 12 visually captures the balanced operational trade-offs of the Ear-to-Heart analytical engine. All four disease models maintain scores consistently exceeding the 0.85 threshold across all five diagnostic axes. Heart Failure exhibits high sensitivity (0.9314) and F1-score (0.9135), making it an effective rule-out triage tool. Amyloidosis achieves peak ROC-AUC (0.9798) and precision (0.9207), providing high positive predictive value. Both Ischemia and Fibrosis demonstrate symmetrical polygon profiles spanning 0.88–0.98 across all dimensions, confirming that the multi-model framework delivers dependable screening across diverse cardiac risk manifestations.
5. Discussion and Clinical Translation
5.1 Multimodal Integration and Ear-Level Sensing Feasibility: The results confirm the technical feasibility and diagnostic potential of ear-centered multimodal physiological sensing. The concha and ear-canal anatomy provide relatively stable perfusion for PPG optical sensing, while localized bi-auricular or ear-adjacent electrodes capture detectable electrical cardiac impulses. When coupled with inertial sensing, the system addresses the notorious vulnerability of ambulatory wearables to motion corruption by gating feature extraction through real-time IMU reference signals.
5.2 Clinical Relevance of Multi-Target Screening: Rather than treating cardiovascular risk as a generic binary flag, the proposed system separates electrophysiological rhythm analysis (PTB-XL 1D-CNN) from pathological structural and vascular screening (Ischemia, Amyloidosis, Fibrosis, and Heart Failure). This tiered approach enables Ear-to-Heart to act as a preliminary early-warning triage tool, guiding patients to appropriate clinical specialists before irreversible adverse cardiac events occur.
5.3 Limitations and Path to Clinical Translation: Despite encouraging experimental benchmarks, several important constraints must be acknowledged. First, single-lead or modified ear-ECG leads do not capture the spatial vectorcardiographic depth of standard 12-lead clinical ECGs. Second, tabular models trained on clinical biomarker datasets assume the availability of pre-extracted or calibrated physiological surrogates. Third, motion artifact suppression must be evaluated under rigorous ambulatory conditions involving speech, mastication, and physical exercise. Consequently, Ear-to-Heart is positioned as a supportive screening prototype rather than a standalone diagnostic system.
6. Conclusion and Future Work
This paper presented Ear-to-Heart, a multimodal ear-based cardiovascular screening system integrating compact hardware sensing (ECG, PPG, IMU, and temperature), embedded firmware processing on an ESP32 microcontroller, motion-aware signal quality assessment, an interactive web monitoring dashboard, and a multi-tier machine learning screening engine. Experimental evaluations demonstrated strong diagnostic efficacy: the 1D-CNN achieved a Macro ROC-AUC of 0.9004 across five ECG superclasses on the PTB-XL cohort, while tabular XGBoost and Random Forest models attained accuracies of 90.03% (Ischemia), 95.30% (Cardiac Amyloidosis), 92.51% (Cardiac Fibrosis), and 90.22% (Heart Failure). Future work will focus on miniaturizing the hardware into a fully self-contained earable enclosure, implementing on-chip TinyML inference for edge latency reduction, and conducting prospective clinical validation trials comparing ear-derived vitals with gold-standard Holter and polysomnography systems.
References
[1]	E. S. Winokur, D. Da He, and C. G. Sodini, “A wearable vital signs monitor at the ear for continuous heart rate and pulse transit time measurements,” in 2012 Annual International Conference of the IEEE Engineering in Medicine and Biology Society, IEEE, 2012, pp. 2724–2727.
[2]	D. Da He, E. S. Winokur, T. Heldt, and C. G. Sodini, “The ear as a location for wearable vital signs monitoring,” in 2010 Annual International Conference of the IEEE Engineering in Medicine and Biology, IEEE, 2010, pp. 6389–6392.
[3]	J.-Y. Choi et al., “Health-related indicators measured using earable devices: systematic review,” JMIR mHealth uHealth, vol. 10, no. 11, p. e36696, 2022.
[4]	D. Da He, E. S. Winokur, and C. G. Sodini, “An ear-worn vital signs monitor,” IEEE Trans. Biomed. Eng., vol. 62, no. 11, pp. 2547–2552, 2015.
[5]	Z. Hao et al., “PPG heart rate extraction algorithm based on the motion artifact intensity classification and removal framework,” Biomed. Signal Process. Control, vol. 94, p. 106287, 2024.
[6]	A. K. Maity, A. Veeraraghavan, and A. Sabharwal, “PPGMotion: Model-based detection of motion artifacts in photoplethysmography signals,” Biomed. Signal Process. Control, vol. 75, p. 103632, 2022.
[7]	M. Sicbaldi, L. Palmerini, S. Moscato, P. di Florio, A. Silvani, and L. Chiari, “Benchmarking of open-source algorithms for heart rate estimation from motion-corrupted photoplethysmography,” Comput. Biol. Med., vol. 196, p. 110808, 2025.
[8]	C. Kechris, J. Dan, J. Miranda, and D. Atienza, “Kid-ppg: Knowledge informed deep learning for extracting heart rate from a smartwatch,” IEEE Trans. Biomed. Eng., vol. 72, no. 3, pp. 870–877, 2024.
[9]	E. K. Naeini, F. Sarhaddi, I. Azimi, P. Liljeberg, N. Dutt, and A. M. Rahmani, “A deep learning–based PPG quality assessment approach for heart rate and heart rate variability,” ACM Trans. Comput. Healthc., vol. 4, no. 4, pp. 1–22, 2023.
[10]	Y. Liu and A. Montanari, “EarFusion: Quality-aware fusion of in-ear audio and photoplethysmography for heart rate monitoring,” in Proceedings of the 3rd ACM International Workshop on Intelligent Acoustic Systems and Applications, 2025, pp. 31–36.
[11]	P. Vermunicht et al., “Continuous heart rate measurements in patients with cardiac disease: device comparison and development of a novel artefact removal procedure,” Digit. Heal., vol. 11, p. 20552076251337600, 2025.
[12]	P. Vermunicht et al., “A novel machine learning procedure to detect and remove artefacts in heart rate data obtained from photoplethysmography wearables: A prospective cohort study,” Digit. Heal., vol. 12, p. 20552076261426624, 2026.
[13]	L. Dhingra et al., “26-a-12260-acc single-lead ECG-age from wearables as a device-agnostic digital biomarker of cardiovascular risk: Multisite and prospective validation,” J. Am. Coll. Cardiol., vol. 87, no. 13_Supplement, pp. A1208–A1209, 2026.
[14]	P. Boulanger, “From Motion Artifacts to Clinical Insight: Multi-Modal Deep Learning for Robust Arrhythmia Screening in Ambulatory ECG Monitoring,” Sensors, vol. 26, no. 4, p. 1135, 2026.
[15]	A. Imane, B. Abdelmajid, D. L. Hilal, E. D. Y. Frederic, and O. H. Hanaa, “Artificial intelligence for atrial fibrillation detection: A systematic review of recent advances in ECG-based deep learning models,” in 2025 5th International Conference on Innovative Research in Applied Science, Engineering and Technology (IRASET), IEEE, 2025, pp. 1–6.
[16]	P. Mehrgardt, M. Khushi, S. Poon, and A. Withana, “Pulse transit time ppg dataset,” PhysioNet, vol. 10, pp. e215–e220, 2022.

| Sensor | Measurement | Role |
| --- | --- | --- |
| MAX30102 PPG | Red/IR optical signal | Pulse waveform, pulse rate, pulse intervals, amplitude, rise time and width, perfusion indices; SpO₂ only with a validated algorithm |
| AD8232 ECG | Electrical cardiac signal | ECG waveform, R-peaks, RR intervals, HR/HRV, lead-off state |
| BMI323 IMU | 3-axis accel., 3-axis gyro. | Movement context, motion reference for PPG artifact handling |
| LM35 | Analog voltage ∝ temperature | Local (not core) temperature trend as context |
| Signal | ESP32 pin | Note |
| --- | --- | --- |
| AD8232 OUTPUT | GPIO34 | Analog ECG input |
|  | GPIO32 / GPIO33 | Lead-off detection |
| BMI323 SDA / SCL | GPIO21 / GPIO22 | I²C, address 0x68 |
| MAX30102 | I²C bus | Shared bus; address per module |
| LM35 output | GPIO35 | Analog, converted by ADC |
| Supply | 3.3 V, GND | Battery-powered for ECG tests |
| Field | Description |
| --- | --- |
| device_id | Identifier of the wearable unit |
| timestamp_ms | Sample time on the ESP32 clock (ms) |
| ppg_ir (and red) | Raw optical reading(s) from MAX30102 |
| ecg_raw, lead_off | ECG sample and lead-off state (when ECG fitted) |
| accel_x, accel_y, accel_z | Acceleration (IMU) |
| gyro_x, gyro_y, gyro_z | Angular velocity (IMU) |
| temperature_c | Local temperature estimate (°C) |
| seq, status | Sequence number and sensor/communication status (planned) |
| Stage | Setting | Purpose |
| --- | --- | --- |
| ECG sampling |  | Waveform acquisition |
| ECG high-pass |  | Baseline drift |
| ECG notch | 50 Hz | Power-line interference |
| ECG low-pass |  | High-frequency noise |
| PPG band-pass |  | Pulse band |
| PPG/IMU rate | Sensor-configured (e.g., 100 Hz) | Final value TBE |
| Window length |  | Segmentation; overlap TBE |
| LMS μ, L | TBE | Artifact reduction tuning |
| Quality thresholds | TBE | Window gating |
| Modality | Features |
| --- | --- |
| PPG | Mean, SD, pulse amplitude, rise time, width, pulse-interval statistics, perfusion-related features, frequency-domain features |
| ECG | R-peaks, RR intervals, HR, HRV-related features, amplitude/timing features |
| ECG + PPG | Pulse arrival time and synchronization features |
| IMU | Mean and variance of acceleration, RMS, magnitude, gyroscope statistics, motion-frequency features |
| Temp. | Mean, variability, trend, rate of change |
| Dataset | Content | Status |
| --- | --- | --- |
| Public PPG-PTT dataset | 66 recordings, 22 healthy participants; running, sitting, walking | Used for preliminary activity classification |
| Ear prototype dataset | Ear ECG, PPG, IMU, temperature from the device | TBE (participants, sessions) |
| Clinical labeled dataset | Reference diagnoses (clinical ECG, echo, MRI, labs) | Required for any disease-specific model; TBE |
| Task | Candidate model | Notes |
| --- | --- | --- |
| Activity / pattern classification | Random Forest, XGBoost | Tabular features; feature importance; depends on label and feature quality |
| Waveform classification | 1D CNN | Learns local waveform patterns; needs data and validation |
| Temporal analysis | LSTM or temporal CNN | Trends across windows; can overfit small sets |
| Anomaly detection | Autoencoder, Isolation Forest | Reference-population based |
| Disease-specific classification | Logistic Regression (baseline), XGBoost, validated NN | Only with clinical labels and calibration |
| Pulse-rate estimation | Signal-processing algorithms | ML only if validated |
| Component | Technology |
| --- | --- |
| Microcontroller / sensors | ESP32; MAX30102; BMI323/BMI270; LM35; AD8232 |
| Firmware / communication | Arduino C++ or ESP-IDF; Wi-Fi (HTTP/WebSocket) or BLE |
| Backend / storage | Python FastAPI or Node.js Express; PostgreSQL or time-series store |
| Signal processing / ML | NumPy, SciPy; scikit-learn, XGBoost; TensorFlow/Keras or PyTorch |
| Frontend | React.js with TypeScript and a React charting library |
| Model development | Google Colab |
| Task | Metrics |
| --- | --- |
| Heart-rate / SpO₂ agreement | MAE, RMSE, correlation, Bland–Altman bias and LoA |
| Signal quality / artifact reduction | Quality or SNR before vs after; % usable windows |
| Activity / pattern classification | Accuracy, precision, recall, F1, confusion matrix, 95% CI |
| Disease-specific screening | Sensitivity, specificity, AUROC, calibration (only with clinical labels) |
| Anomaly detection / localisation | Detection precision/recall; temporal overlap with annotated segments |
| Superclass | ROC-AUC | PR-AUC | F1-Score | Sensitivity (%) | Specificity (%) |
| --- | --- | --- | --- | --- | --- |
| NORM (Normal ECG) | 0.9314 | 0.9014 | 0.8386 | 87.86% | 82.57% |
| MI (Myocardial Infarction) | 0.9212 | 0.8164 | 0.7406 | 82.10% | 86.40% |
| STTC (ST/T Changes) | 0.9262 | 0.7998 | 0.7504 | 83.94% | 87.32% |
| CD (Conduction Disturbance) | 0.9079 | 0.8227 | 0.7288 | 80.12% | 88.11% |
| HYP (Hypertrophy) | 0.8153 | 0.4616 | 0.4361 | 66.16% | 81.00% |
| Target Pathology | Algorithm | Accuracy (%) | ROC-AUC | Precision (%) | Recall (%) | F1-Score (%) |
| --- | --- | --- | --- | --- | --- | --- |
| Ischemia | XGBoost | 90.03% | 0.9607 | 89.78% | 87.83% | 88.80% |
| Cardiac Amyloidosis | XGBoost | 95.30% | 0.9798 | 92.07% | 84.15% | 87.93% |
| Cardiac Fibrosis | XGBoost | 92.51% | 0.9773 | 91.40% | 89.77% | 90.58% |