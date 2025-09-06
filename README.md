# PDF Q&A Assistant

A modern web application that allows you to upload PDF documents and ask questions about their content using AI-powered retrieval-augmented generation (RAG).


## Demo Video

https://github.com/user-attachments/assets/382318d2-09bf-44a6-accf-6344dda28faf


##  Features

- **PDF Upload**: Upload and process PDF documents
- **AI-Powered Q&A**: Ask questions and get intelligent answers based on document content
- **RAG Implementation**: Uses retrieval-augmented generation for accurate, context-aware responses
- **Vector Search**: Semantic search using Google Gemini embeddings
- **Real-time Processing**: Fast document processing and question answering

##  Architecture

### Frontend (Next.js + TypeScript)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS for modern, responsive design
- **State Management**: React hooks for local state

### Backend (Flask + Python)
- **Framework**: Flask with CORS support
- **PDF Processing**: PyPDF2 for text extraction
- **AI Integration**: Google Gemini API for embeddings and text generation
- **Vector Search**: Cosine similarity for semantic search
- **Storage**: In-memory storage for simplicity

### RAG Pipeline
1. **Document Processing**: Extract text from PDF and chunk into overlapping segments
2. **Embedding Generation**: Create vector embeddings using Gemini's embedding model
3. **Query Processing**: Convert questions to embeddings for semantic search
4. **Retrieval**: Find most relevant document chunks using cosine similarity
5. **Generation**: Use Gemini to generate answers based on retrieved context

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Flask server**
   ```bash
   python app.py
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm i
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Application will run on `http://localhost:3000`


##  Usage

1. **Upload a PDF**: Click the upload area and select a PDF file
2. **Wait for Processing**: The system will extract text and generate embeddings
3. **Ask Questions**: Type your questions about the document content
4. **Get Answers**: Receive AI-generated answers based on the document

##  Technical Approach

### Document Processing
- **Text Extraction**: Uses PyPDF2 to extract text from PDF pages
- **Chunking Strategy**: Splits text into 300-word chunks with 50-word overlap
- **Overlap Purpose**: Ensures context isn't lost at chunk boundaries

### Vector Search
- **Embeddings**: Uses Gemini's `embedding-001` model for vector generation
- **Similarity**: Cosine similarity to find most relevant chunks
- **Retrieval**: Returns top 3 most relevant chunks for context

### Answer Generation
- **Model**: Google Gemini 1.5 Flash for fast, accurate responses
- **Context-Aware**: Only uses information from retrieved document chunks
- **Fallback**: Graceful handling when answers can't be found in context

##  API Endpoints

- `POST /api/upload-pdf` - Upload and process PDF files
- `POST /api/ask-question` - Ask questions about uploaded documents
- `GET /api/health` - Health check endpoint

##  Project Structure

```
ForceEquals/
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── page.tsx         # Main PDF Q&A interface
│   │   └── layout.tsx       # App layout
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Flask backend
│   ├── app.py               # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
└── README.md
```

##  License

This project is open source and available under the MIT License.
