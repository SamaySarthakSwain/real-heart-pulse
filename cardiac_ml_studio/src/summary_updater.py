import os
import re

def get_dir_size_str(path):
    if not os.path.exists(path):
        return "N/A"
    if os.path.isfile(path):
        size = os.path.getsize(path)
        if size > 1024 * 1024 * 1024:
            return f"**{size / (1024*1024*1024):.2f} GB** ({size:,} B)"
        elif size > 1024 * 1024:
            return f"**{size / (1024*1024):.2f} MB** ({size:,} B)"
        elif size > 1024:
            return f"**{size / 1024:.2f} KB** ({size:,} B)"
        return f"**{size} B**"
    
    total = 0
    for root, _, files in os.walk(path):
        for f in files:
            total += os.path.getsize(os.path.join(root, f))
    if total > 1024 * 1024 * 1024:
        return f"**{total / (1024*1024*1024):.2f} GB** ({total:,} B)"
    elif total > 1024 * 1024:
        return f"**{total / (1024*1024):.2f} MB** ({total:,} B)"
    elif total > 1024:
        return f"**{total / 1024:.2f} KB** ({total:,} B)"
    return f"**{total} B**"

def update_summary_registry(
    summary_path=None,
    model_name=None,
    architecture=None,
    dataset_name=None,
    metrics=None,
    model_artifact_path=None,
    additional_notes=None
):
    """
    Automated utility to update 'ML model Summary.md' with new model training results or artifacts.
    """
    if summary_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        summary_path = os.path.join(base_dir, "ML model Summary.md")

    if not os.path.exists(summary_path):
        print(f"[Warning] Summary file {summary_path} not found.")
        return

    print(f"[*] Updating ML model summary in: {summary_path}")
    
    with open(summary_path, "r", encoding="utf-8") as f:
        content = f.read()

    # If new model entry is provided, check if it's already in the file or append it
    if model_name:
        header = f"### {model_name}"
        if header not in content:
            new_section = f"\n\n### {model_name}\n"
            if architecture:
                new_section += f"- **Concept / Architecture:** {architecture}\n"
            if dataset_name:
                new_section += f"- **Dataset Used:** {dataset_name}\n"
            if metrics:
                new_section += "\n#### Performance Metrics\n"
                new_section += "| Metric | Score |\n|---|---|\n"
                for k, v in metrics.items():
                    val = f"{v:.4f}" if isinstance(v, float) else str(v)
                    new_section += f"| **{k}** | {val} |\n"
            if model_artifact_path and os.path.exists(model_artifact_path):
                sz = get_dir_size_str(model_artifact_path)
                new_section += f"- **Model Artifact:** `{model_artifact_path}` (Size: {sz})\n"
            if additional_notes:
                new_section += f"\n*{additional_notes}*\n"

            # Insert before model weights registry or note
            insert_marker = "## 💾 Model Weights & Artifacts Storage Registry"
            if insert_marker in content:
                content = content.replace(insert_marker, new_section + "\n---\n\n" + insert_marker)
            else:
                content += new_section

            with open(summary_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[+] Successfully logged {model_name} into {summary_path}")
        else:
            print(f"[*] Section {model_name} already exists in summary.")

if __name__ == "__main__":
    print("ML Summary Updater ready.")
