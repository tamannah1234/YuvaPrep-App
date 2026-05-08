import whisper
from sentence_transformers import SentenceTransformer

_whisper_model = None
_bert_model = None


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        print("Loading Whisper model...")
        _whisper_model = whisper.load_model("base")
    return _whisper_model


def get_bert_model():
    global _bert_model
    if _bert_model is None:
        print("Loading SentenceTransformer model...")
        _bert_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _bert_model