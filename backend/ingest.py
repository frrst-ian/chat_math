"""
Reads all PDFs from math_modules_deped/, chunks them, embeds, saves to chroma_db/.
"""
import os
from pypdf import PdfReader
import chromadb

PDF_DIR = "math_modules_deped"
CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "deped_math"
CHUNK_SIZE = 400


def extract_text(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    return " ".join(page.extract_text() or "" for page in reader.pages)


def chunk_text(text: str, size: int = CHUNK_SIZE) -> list[str]:
    words = text.split()
    chunks, current = [], []
    for word in words:
        current.append(word)
        if len(" ".join(current)) >= size:
            chunks.append(" ".join(current))
            current = []
    if current:
        chunks.append(" ".join(current))
    return chunks


def main():
    ef = chromadb.utils.embedding_functions.DefaultEmbeddingFunction()

    client = chromadb.PersistentClient(path=CHROMA_DIR)

    # Wipe and recreate so re-runs don't duplicate
    client.delete_collection(COLLECTION_NAME) if COLLECTION_NAME in [
        c.name for c in client.list_collections()] else None
    collection = client.create_collection(
        COLLECTION_NAME, embedding_function=ef)

    docs, ids, metas = [], [], []
    idx = 0

    for fname in os.listdir(PDF_DIR):
        if not fname.endswith(".pdf"):
            continue
        path = os.path.join(PDF_DIR, fname)
        print(f"Processing {fname}...")
        text = extract_text(path)
        for chunk in chunk_text(text):
            docs.append(chunk)
            ids.append(f"chunk_{idx}")
            metas.append({"source": fname})
            idx += 1

    collection.add(documents=docs, ids=ids, metadatas=metas)
    print(f"Done. {idx} chunks indexed from {PDF_DIR}/")


if __name__ == "__main__":
    main()
