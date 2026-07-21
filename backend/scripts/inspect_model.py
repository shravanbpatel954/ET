"""Inspect Keras model architecture."""
import json
import zipfile
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parent.parent / "app" / "services" / "model"

for model_name in ("naklinote.keras", "currency_model.keras"):
    path = MODEL_DIR / model_name
    if not path.exists():
        print(f"{model_name}: missing")
        continue
    print(f"\n=== {model_name} ({path.stat().st_size} bytes) ===")
    with zipfile.ZipFile(path, "r") as z:
        cfg = json.loads(z.read("config.json"))
        layers = cfg["config"]["layers"]
        for layer in layers:
            cls = layer.get("class_name", "")
            name = layer.get("name", "")
            units = layer.get("config", {}).get("units")
            if cls in ("Dense", "GlobalAveragePooling2D", "Dropout", "InputLayer"):
                print(f"  {cls:30} {name:25} units={units} shape={layer.get('config', {}).get('batch_shape')}")
