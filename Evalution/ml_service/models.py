# models.py
_whisper_model = None
_bert_model = None


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        print("Loading Whisper model...")
        _whisper_model = whisper.load_model("base")  # tiny / base / small
    return _whisper_model

def get_bert_model():
    global _bert_model
    if _bert_model is None:
        print("Loading BERT model (placeholder)...")
        # Example: from transformers import AutoModel, AutoTokenizer
        _bert_model = "bert-model-placeholder"
    return _bert_model
