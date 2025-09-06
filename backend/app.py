import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import google.generativeai as genai
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


pdf_storage = {}  


def extract_text_from_pdf(pdf_file):
    """Extract text from PDF file"""
    text = ""
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text.strip()


def chunk_text(text, chunk_size=300, overlap=50):
    """Split text into overlapping chunks"""
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks


def get_embeddings(text_chunks):
    """Get Gemini embeddings for text chunks"""
    try:
        embeddings = []
        for chunk in text_chunks:
            result = genai.embed_content(
                model="models/embedding-001",
                content=chunk
            )
            embeddings.append(result["embedding"])
        return embeddings
    except Exception as e:
        print(f"Error getting embeddings: {e}")
        return None


def find_relevant_chunks(question, chunks, embeddings, top_k=3):
    """Find most relevant chunks for the question"""
    try:
      
        q_embed = genai.embed_content(
            model="models/embedding-001",
            content=question
        )["embedding"]

        similarities = cosine_similarity([q_embed], embeddings)[0]

        top_indices = np.argsort(similarities)[-top_k:][::-1]

        return [(chunks[i], similarities[i]) for i in top_indices]
    except Exception as e:
        print(f"Error finding relevant chunks: {e}")
        return []


def generate_answer(context, question):
    """Generate answer using Gemini"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""You are a helpful assistant that answers based only on the provided context.
Context:
{context}

Question: {question}

If the answer is not in the context, say you cannot find it."""
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        return None


@app.route("/api/upload-pdf", methods=["POST"])
def upload_pdf():
    """Route 1: Upload and process PDF"""
    try:
        if "pdf" not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400

        pdf_file = request.files["pdf"]
        if pdf_file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        file_id = str(uuid.uuid4())

        pdf_file.seek(0)
        text = extract_text_from_pdf(pdf_file)

        if not text.strip():
            return jsonify({"error": "Could not extract text from PDF"}), 400

        chunks = chunk_text(text)

        embeddings = get_embeddings(chunks)
        if not embeddings:
            return jsonify({"error": "Failed to generate embeddings"}), 500

        pdf_storage[file_id] = {
            "text": text,
            "chunks": chunks,
            "embeddings": embeddings
        }

        return jsonify({
            "fileId": file_id,
            "message": "PDF processed successfully",
            "chunks_count": len(chunks)
        })

    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({"error": "Failed to process PDF"}), 500


@app.route("/api/ask-question", methods=["POST"])
def ask_question():
    """Route 2: Answer questions using RAG"""
    try:
        data = request.get_json()
        file_id = data.get("fileId")
        question = data.get("question")

        if not file_id or not question:
            return jsonify({"error": "Missing fileId or question"}), 400

        if file_id not in pdf_storage:
            return jsonify({"error": "File not found"}), 404

        stored = pdf_storage[file_id]
        chunks = stored["chunks"]
        embeddings = stored["embeddings"]

        relevant_chunks = find_relevant_chunks(question, chunks, embeddings)

        if not relevant_chunks:
            return jsonify({"error": "Could not find relevant information"}), 500

        context = "\n\n".join([chunk for chunk, _ in relevant_chunks])

        answer = generate_answer(context, question)
        if not answer:
            return jsonify({"error": "Failed to generate answer"}), 500

        return jsonify({
            "answer": answer,
            "relevant_chunks_used": len(relevant_chunks)
        })

    except Exception as e:
        print(f"Question error: {e}")
        return jsonify({"error": "Failed to process question"}), 500


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "files_processed": len(pdf_storage)})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
