import os
import sys
import numpy as np
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

# Fix Windows stdout
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

class ECG1DGradCAM:
    """
    1D Grad-CAM (Gradient-Weighted Class Activation Mapping) for continuous ECG waveforms.
    Visualizes which exact morphological segments (P-wave, QRS, ST-segment, T-wave)
    triggered a specific pathology prediction (e.g. Myocardial Infarction or STTC).
    """
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Register hooks
        self.hook_forward = self.target_layer.register_forward_hook(self._save_activations)
        self.hook_backward = self.target_layer.register_full_backward_hook(self._save_gradients)
        
    def _save_activations(self, module, input, output):
        self.activations = output.detach()
        
    def _save_gradients(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()
        
    def generate_heatmap(self, input_tensor, class_idx):
        """
        input_tensor: Tensor of shape (1, 12, 1000)
        class_idx: Target integer index to explain (0: NORM, 1: MI, 2: STTC, 3: CD, 4: HYP)
        """
        self.model.eval()
        self.model.zero_grad()
        
        # Forward pass
        output = self.model(input_tensor)
        score = output[0, class_idx]
        
        # Backward pass for target class
        score.backward(retain_graph=True)
        
        # Global Average Pooling of gradients along time dimension
        # gradients shape: (1, Channels, Time_feat)
        weights = torch.mean(self.gradients, dim=2, keepdim=True) # (1, Channels, 1)
        
        # Weighted combination of forward activation maps
        cam = torch.sum(weights * self.activations, dim=1, keepdim=True) # (1, 1, Time_feat)
        
        # Apply ReLU (we only care about features that have a positive influence)
        cam = torch.clamp(cam, min=0.0)
        
        # Interpolate 1D CAM up to raw signal length (1000 samples)
        cam_1d = nn.functional.interpolate(cam, size=input_tensor.shape[2], mode='linear', align_corners=False)
        cam_1d = cam_1d.squeeze().cpu().numpy()
        
        # Normalize between 0 and 1
        max_val = np.max(cam_1d)
        min_val = np.min(cam_1d)
        if max_val - min_val > 1e-6:
            cam_norm = (cam_1d - min_val) / (max_val - min_val)
        else:
            cam_norm = np.zeros_like(cam_1d)
            
        return cam_norm

    def plot_attribution(self, waveform_1d, heatmap, class_name, save_path=None, lead_name="Lead II"):
        """
        Renders a publication-quality ECG plot with colorized attribution heatmap.
        High-risk cardiac pathology segments are highlighted in vibrant red/orange.
        """
        t = np.linspace(0, 10, len(waveform_1d))
        
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 5.5), sharex=True, gridspec_kw={'height_ratios': [3, 1]})
        
        # Plot ECG trace
        ax1.plot(t, waveform_1d, color='#1f2937', linewidth=1.4, label=f'ECG ({lead_name})')
        
        # Overlay heatmap using colored fill
        ax1.fill_between(t, waveform_1d.min(), waveform_1d.max(), where=(heatmap > 0.4),
                         color='#e63946', alpha=0.3, label=f'High Attribution ({class_name})')
        ax1.fill_between(t, waveform_1d.min(), waveform_1d.max(), where=(heatmap > 0.7),
                         color='#d90429', alpha=0.5, label='Critical Focus Zone')
                         
        ax1.set_ylabel('Amplitude (mV / norm)', fontweight='bold')
        ax1.set_title(f'1D Grad-CAM Explainability: Clinical Waveform Attribution for [{class_name}]', fontweight='bold', pad=12)
        ax1.grid(True, linestyle='--', alpha=0.4)
        ax1.legend(loc='upper right', frameon=True, facecolor='white', framealpha=0.9)
        
        # Plot Heatmap intensity
        ax2.plot(t, heatmap, color='#d90429', linewidth=1.8)
        ax2.fill_between(t, 0, heatmap, color='#e63946', alpha=0.25)
        ax2.set_ylim(-0.05, 1.05)
        ax2.set_xlabel('Time (seconds)', fontweight='bold')
        ax2.set_ylabel('Importance', fontweight='bold')
        ax2.grid(True, linestyle='--', alpha=0.4)
        
        plt.tight_layout()
        if save_path:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            plt.savefig(save_path, dpi=300)
            plt.close()
            print(f"[+] Grad-CAM attribution plot saved to: {save_path}")
        else:
            plt.show()

if __name__ == '__main__':
    print("ECG 1D Grad-CAM Engine ready.")
