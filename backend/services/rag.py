import chromadb

CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "math_data"

_collection = None


def _get_collection():
    global _collectionW
    if _collection is None:
        ef = chromadb.utils.embedding_functions.DefaultEmbeddingFunction()
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        _collection = client.get_collection(
            COLLECTION_NAME, embedding_function=ef)
    return _collection


def query(topic: str, n_results: int = 3) -> str:
    # Returns top-3 chunks relevant to topic
    try:
        results = _get_collection().query(
            query_texts=[topic], n_results=n_results)
        chunks = results["documents"][0]
        return "\n\n".join(chunks)
    except Exception:
        return ""
