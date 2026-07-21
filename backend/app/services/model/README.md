# SentinelAI Local Models

Place local AI model files in this folder. The currency-note module currently loads:

- `naklinote.keras` for Indian currency-note authenticity detection.

## Currency Shield Runtime

The backend endpoint is already wired at:

- `GET /api/v1/currency/status`
- `POST /api/v1/currency/analyze`

The endpoint does not return dummy predictions. It only returns real output from `naklinote.keras`.

For TensorFlow/Keras `.keras` model loading, use a Python version supported by your selected TensorFlow build, usually Python 3.10, 3.11, or 3.12. Then install:

```bash
pip install "tensorflow>=2.16,<3" "keras>=3,<4" "numpy>=1.26,<3" "Pillow>=11,<12"
```

If your model uses a different label order, edit `currency_labels.json`. For a single sigmoid output, SentinelAI treats the positive output as `counterfeit` unless you change `binary_sigmoid_positive_label`.

## Audio Shield Runtime

The audio module loads the extracted Transformers/PyTorch folder:

- `audio/config.json`
- `audio/model.safetensors`
- `audio/preprocessor_config.json`

The copied `audio.keras` file is not the primary runtime artifact for this model. The folder is used because the architecture is `Wav2Vec2ForSequenceClassification`.

Endpoints:

- `GET /api/v1/audio/status`
- `POST /api/v1/audio/analyze`

Install the audio runtime with Python 3.10, 3.11, or 3.12:

```bash
pip install "torch>=2.3,<3" "transformers>=4.40,<6" "safetensors>=0.4.3,<1" "soundfile>=0.12.1,<1" "librosa>=0.10.2,<1"
```

If the model label order is different, edit `audio_labels.json`.
