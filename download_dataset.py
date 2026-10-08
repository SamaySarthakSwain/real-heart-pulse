import kagglehub
import shutil
import os

path = kagglehub.dataset_download("fedesoriano/heart-failure-prediction")
print("Path to dataset files:", path)

target_dir = "cardiac_ml_studio/data/heart_failure"
os.makedirs(target_dir, exist_ok=True)

for file in os.listdir(path):
    shutil.copy(os.path.join(path, file), target_dir)

print("Dataset copied to", target_dir)
