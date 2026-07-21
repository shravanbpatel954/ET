import os
import zipfile

extension_dir = r"c:\Users\Admin\Downloads\ET\ET\extension"
output_dir = r"c:\Users\Admin\Downloads\ET\ET\frontend-react\public"
os.makedirs(output_dir, exist_ok=True)

zip_path = os.path.join(output_dir, "sentinel-ai-extension.zip")

with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(extension_dir):
        for file in files:
            if file.endswith(".pyc") or file == "zip_extension.py":
                continue
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, extension_dir)
            zipf.write(full_path, arcname)

print(f"Extension zipped successfully to: {zip_path}")
