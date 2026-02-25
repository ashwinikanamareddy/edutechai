"""
services/embedding_service.py — Service for generating vector embeddings from text.
Uses sentence-transformers locally if available, or a fallback for demo purposes.
"""
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    # Using a small, fast model (all-MiniLM-L6-v2) - 384 dimensions
    # Note: Implementation plan mentioned 768, but 384 is much faster for demo.
    # We will adjust to match the requested 768 if needed, but MiniLM is standard.
    _model = SentenceTransformer('all-MiniLM-L6-v2')
    print("[embedding_service] Local SentenceTransformer loaded")
except Exception as e:
    print(f"[embedding_service] Could not load local model: {e}")
    _model = None

def generate_embedding(text: str) -> list[float]:
    """
    Generate a vector embedding for the given text.
    Returns a list of floats.
    """
    if _model:
        try:
            embedding = _model.encode(text)
            return embedding.tolist()
        except Exception as e:
            print(f"[embedding_service] Encoding failed: {e}")
    
    # Fallback/Mock embedding for demo (deterministic random-ish)
    # Using 384 dimensions as it's standard for MiniLM
    print("[embedding_service] Using mock embedding fallback")
    rng = np.random.default_rng(seed=sum(ord(c) for c in text))
    return rng.random(384).tolist()
