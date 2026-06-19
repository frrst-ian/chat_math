import os
from pypdf import PdfReader
import chromadb

PDF_DIR = "math_data"
CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "math_data"
CHUNK_SIZE = 400
PAGE_LIMIT = 20 

def extract_text_by_page(pdf_path, limit):
    reader = PdfReader(pdf_path)
    pages = []
    for i in range(min(len(reader.pages), limit)):
        text = reader.pages[i].extract_text() or ""
        pages.append((i + 1, text))
    return pages

def chunk_text(text, size=CHUNK_SIZE):
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
    client = chromadb.PersistentClient(path=CHROMA_DIR)

    if COLLECTION_NAME in [c.name for c in client.list_collections()]:
        client.delete_collection(COLLECTION_NAME)
    
    collection = client.create_collection(COLLECTION_NAME)

    total_idx = 0

    for fname in os.listdir(PDF_DIR):
        if not fname.endswith(".pdf"):
            continue
        
        path = os.path.join(PDF_DIR, fname)
        print(f"\n[Reading] {fname}...")
        
        pages_data = extract_text_by_page(path, PAGE_LIMIT)
        
        for page_num, text in pages_data:
            chunks = chunk_text(text)
            if not chunks:
                continue

            ids = [f"{fname}_p{page_num}_{i}" for i in range(len(chunks))]
            metas = [{"source": fname, "page": page_num} for _ in range(len(chunks))]
            
            collection.add(
                documents=chunks,
                ids=ids,
                metadatas=metas
            )
            
            total_idx += len(chunks)
            print(f" -> Page {page_num} indexed ({len(chunks)} chunks)", end="\r")

    print(f"\n\nDone. {total_idx} total chunks saved to {CHROMA_DIR}/")

if __name__ == "__main__":
    main()