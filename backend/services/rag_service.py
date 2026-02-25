"""
services/rag_service.py — Service for document retrieval using vector similarity search.
"""
from typing import List
from services.db import supabase
from services.embedding_service import generate_embedding

def search_similar_documents(query: str, user_id: str = None, limit: int = 3) -> List[str]:
    """
    Search for similar document segments in Supabase pgvector.
    Returns a list of content strings.
    """
    try:
        query_embedding = generate_embedding(query)
        
        # Call the Supabase RPC function 'match_documents' 
        # (This function must be created in Supabase SQL editor)
        # Parameters: query_embedding (vector), match_threshold (float), match_count (int)
        # Note: If RPC is not set up, this will fail gracefully.
        res = supabase.rpc("match_documents", {
            "query_embedding": query_embedding,
            "match_threshold": 0.5,
            "match_count": limit
        }).execute()
        
        if res.data:
            return [doc.get("content", "") for doc in res.data if doc.get("content")]
            
    except Exception as e:
        print(f"[rag_service] Similarity search failed: {e}")
        
    return []

def store_document(title: str, content: str, user_id: str = None):
    """
    Store a document segment with its embedding.
    """
    try:
        embedding = generate_embedding(content)
        supabase.table("rag_documents").insert({
            "title": title,
            "content": content,
            "embedding": embedding,
            "uploaded_by": user_id
        }).execute()
        return True
    except Exception as e:
        print(f"[rag_service] Storing document failed: {e}")
        return False
