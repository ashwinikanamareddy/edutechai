"""
services/embedding_service.py — Service for generating vector embeddings from text.
Uses sentence-transformers locally if available, or a fallback for demo purposes.
"""
import numpy as np

_model = None

def load_model():
    global _model
    if _model is not None:
        return _model
    
    try:
        from sentence_transformers import SentenceTransformer
        import os
        # Allow model name override via env var
        _MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
        print(f"[embedding_service] Loading local model: {_MODEL_NAME}")
        _model = SentenceTransformer(_MODEL_NAME)
        print("[embedding_service] Local SentenceTransformer loaded OK")
        return _model
    except Exception as e:
        import traceback
        print(f"[embedding_service] Could not load local model: {str(e)}")
        print(traceback.format_exc())
        return None

def generate_embedding(text: str) -> list[float]:
    """
    Generate a vector embedding for the given text.
    Returns a list of floats.
    """
    model = load_model()
    if model:
        try:
            embedding = model.encode(text)
            return embedding.tolist()
        except Exception as e:
            print(f"[embedding_service] Encoding failed: {e}")
    
    # Fallback/Mock embedding for demo (deterministic random-ish)
    # Using 384 dimensions as it's standard for MiniLM
    print("[embedding_service] Using mock embedding fallback")
    rng = np.random.default_rng(seed=sum(ord(c) for c in text))
    return rng.random(384).tolist()
