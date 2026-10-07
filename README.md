<div align="center">

# 🚀 Local RAG Workstation
### Enterprise-Grade Retrieval-Augmented Generation (RAG) Platform
**Build AI-powered knowledge assistants capable of ingesting, indexing, retrieving, and reasoning over your documents using Local LLMs (LM Studio / Ollama), Google Gemini, LangGraph, FastAPI, Next.js 15, PostgreSQL, and Qdrant.**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-000000?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Qdrant-Vector%20DB-DC2626?style=flat-square&logo=qdrant" alt="Qdrant" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Local%20AI-LM%20Studio%20%2F%20Ollama-000000?style=flat-square" alt="Local AI" />
  <img src="https://img.shields.io/badge/Google%20Gemini-1.5%20Pro-4285F4?style=flat-square&logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" />
</p>

[Quickstart](#-getting-started) • [Architecture](#-architecture) • [Features](#-features) • [Tech Stack](#-technology-stack) • [One-Click Launch](#-one-click-launchers)

</div>

---

## 📖 Overview

**Local RAG Workstation** (also published as **Production RAG Agent**) is an enterprise-ready, full-stack Retrieval-Augmented Generation (RAG) workstation designed for intelligent querying and contextual reasoning over private enterprise documents.

Instead of relying solely on an LLM's static training weights, the system extracts, chunks, vectorizes, and indexes your private files. When a user poses a question, the workstation runs high-precision vector similarity retrieval through **Qdrant**, constructs an attested context window via **LangGraph**, and generates grounded answers citing exact pages and source documents.

The platform is designed with **data privacy first**: it supports **100% on-premises offline execution** using local LLMs (LM Studio, Ollama, Qwen 2.5, Llama 3) and local embeddings, with zero telemetry or data leakage, while maintaining seamless plug-and-play compatibility with cloud providers like **Google Gemini**.

---

## 🖼 Interface Preview

<div align="center">

| Conversational RAG Studio (Citations & Page Numbers) | System Telemetry & Health Monitoring |
| :---: | :---: |
| ![Chat Interface](screenshots/chat.png) | ![Dashboard Telemetry](screenshots/dashboard.png) |

| Knowledge Base & Document Explorer | Multi-Format Ingestion Dropzone |
| :---: | :---: |
| ![Document Management](screenshots/documents.png) | ![Ingestion Engine](screenshots/upload.png) |

</div>

---

## 💡 Why Local RAG Workstation?

Most open-source RAG tutorials are toy scripts: they leak private documents to cloud APIs, break when encountering tables or Arabic text, re-embed identical files redundantly, and hallucinate without source verification.

**Local RAG Workstation bridges the gap between proof-of-concept and production engineering:**

| Critical Dimension | ❌ Naive Tutorial RAG | 🚀 Local RAG Workstation |
| :--- | :--- | :--- |
| **Data Privacy & Governance** | Leaks private docs & embeddings to external cloud APIs | **100% Offline & On-Premises** (Zero telemetry, zero data egress) |
| **Duplicate Ingestion** | Computes expensive embeddings repeatedly for same files | **Deterministic SHA-256 Deduplication** (100% saved duplicate compute) |
| **Document Formats** | Plain `.txt` and basic PDFs only | **Multi-Format + OCR** (PDF, DOCX, PPTX, XLSX, CSV, Scanned Docs) |
| **Hallucination Prevention** | Black-box output without page attribution | **Verifiable Interactive Citations** (Exact excerpts, page numbers, similarity scores) |
| **Multilingual & RTL** | Broken Arabic text, reversed glyphs, poor tokenization | **Native Bilingual & RTL Support** (Arabic token normalization & embeddings) |
| **Developer Experience** | Clunky web forms with slow reloads | **Distraction-Free Monochrome Workstation** with sub-second keyboard shortcuts |
| **Production Resilience** | Silent crashes on network drops or bad files | **Exponential Backoff, Jitter, & Transaction Rollback Safeguards** |
| **Deployment Simplicity** | Hours of manual dependency debugging | **One-Click Native Launchers (`run.bat` / `run.sh`) & Docker Compose** |

## ⭐ Highlights

- **Dual AI Engine (Local & Cloud)**: Instant switching between 100% offline local inference (LM Studio / Ollama with Qwen 2.5, Llama 3, Mistral) and cloud scale (Google Gemini 1.5 Pro / Flash).
- **Distraction-Free Monochrome Workstation**: High-density, black-and-white industrial developer interface inspired by advanced IDE terminals, with full keyboard navigation (`_ c` for Chat, `_ d` for Documents, `_ g` for Dashboard, `_ s` for Settings).
- **First-Class Arabic & English Bilingual Support**: Native RTL (Right-to-Left) typography, Arabic text normalization, diacritic resilience, and accurate multilingual semantic embeddings.
- **Multi-Format Ingestion & OCR**: Native parsers for PDF, DOCX, PPTX, XLSX, CSV, TXT, and Markdown, with OCR fallbacks (PaddleOCR / Tesseract) for scanned documents.
- **Deterministic Chunking & SHA-256 Deduplication**: Content-addressed chunk IDs and file hashing eliminate duplicate vector embedding operations.
- **Interactive Citation Inspector**: Inline source pills displaying the exact extracted snippet, page number, and similarity score for zero-hallucination verification.
- **Collection Isolation**: Group documents into distinct knowledge bases (e.g., Legal, Finance, Technical Specs) to isolate search domains.
- **LangGraph Agentic Orchestrator**: Stateful multi-turn conversational graph managing context pruning, query rewriting, and grounding assertions.
- **FastAPI Async Backend**: High-throughput async REST API with Server-Sent Events (SSE) for low-latency token streaming.
- **One-Click Launchers**: Native `run.bat` (Windows) and `run.sh` (Linux/macOS) automated launchers for immediate setup.

---

## ✨ Features

### 📂 Multi-Format Ingestion Engine
Supports uploading and indexing:
- **PDF**: Multi-column layouts, digital documents, and scanned pages via PyMuPDF and OCR.
- **DOCX / PPTX**: Microsoft Word documents and PowerPoint slides.
- **XLSX / CSV**: Tabular spreadsheets, financial records, and CSV datasets via Pandas & OpenPyXL.
- **TXT / Markdown**: Raw text files, technical documentation, logs, and markdown files.

Every uploaded document undergoes:
1. **Validation**: Size, mime-type, and SHA-256 checksum verification.
2. **Structural Extraction**: Header, paragraph, and table preservation.
3. **Adaptive Chunking**: Recursive semantic splitting with token-boundary alignment.
4. **Vector Embedding**: Dense vector generation via local or cloud embedding models.
5. **Qdrant Indexing**: HNSW index creation with payload metadata filtering.
6. **Relational Storage**: Relational document state and chunk mapping stored in PostgreSQL.

---

### 🧠 Adaptive Semantic Chunking
- Recursive character splitting preserving paragraph and code context.
- Configurable chunk size (default: `1000` characters) and chunk overlap (default: `200` characters).
- Deterministic chunk hashing: re-uploading identical files skips re-embedding automatically.
- Resume-safe batch indexing with transaction rollbacks on failure.

---

### 💬 Conversational RAG Studio
- **Real-Time Token Streaming**: Low-latency token generation powered by SSE (`Server-Sent Events`).
- **Interactive Source Attribution**: Every response includes clickable source badges linking to the exact excerpt, document name, and page number.
- **Markdown & Code Highlighting**: Syntax highlighting for code snippets, markdown tables, and lists.
- **Chat Session Persistence**: Multi-turn conversation history stored in PostgreSQL.
- **Single-Document Interrogation**: Target queries to an isolated document directly from the document explorer.
- **Markdown Export**: Export complete chat sessions to formatted `.md` files for reporting.

---

### 📊 System Dashboard & Health Telemetry
Live telemetry monitoring the operational health of:
- **FastAPI Backend**: Route latency, connection pools, and worker health.
- **AI Neural Engine**: Connection state to LM Studio / Ollama or Google Gemini.
- **Qdrant Vector DB**: Collection health, indexed vector counts, and storage.
- **PostgreSQL**: Transaction health, document counts, and message history.

---

## 🏗 Architecture

```
                                  USER BROWSER
                                       │
                         Next.js 15 App Router (TypeScript)
                           Monochrome Workstation UI
                                       │
                               HTTP REST / SSE Streaming
                                       ▼
                       FastAPI Asynchronous Gateway (Port 8000)
                                       │
               ┌───────────────────────┼───────────────────────┐
               ▼                       ▼                       ▼
      Document Ingestion       LangGraph Orchestrator     System Telemetry
      (PyMuPDF / OCR / Pandas) (Stateful RAG Graph)       (Health Probes)
               │                       │                       │
               ▼                       ▼                       │
      Adaptive Chunking        Dense Retrieval Query           │
     (SHA-256 Deduplication)           │                       │
               │                       ▼                       │
               ├──────────────► Qdrant Vector DB (Port 6333) ◄─┤
               │                (Cosine HNSW Indexing)         │
               │                       │                       │
               ├──────────────► PostgreSQL 16 (Port 5432) ◄────┘
               │                (Relational Metadata & Logs)
               ▼                       │
    ┌──────────────────────────────────┴──────────────────────────────────┐
    ▼                                                                     ▼
Local Offline Engine (Port 1234 / 11434)                 Cloud AI Engine (HTTPS)
LM Studio / Ollama (Qwen 2.5, Llama 3)                   Google Gemini 1.5 Pro
nomic-embed-text / BGE Embeddings                        text-embedding-004
```

---

## ⚙ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components) |
| **UI & Styling** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), Radix UI, Framer Motion, Lucide React |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Async Python 3.11), Uvicorn, Pydantic V2 |
| **RAG Orchestrator** | [LangGraph](https://github.com/langchain-ai/langgraph), LangChain Core |
| **Vector Database** | [Qdrant](https://qdrant.tech/) (High-performance vector similarity search) |
| **Relational Database**| [PostgreSQL 16](https://www.postgresql.org/) with SQLAlchemy 2.0 (AsyncIO) & asyncpg |
| **Document Ingestion** | PyMuPDF (fitz), Python-docx, Python-pptx, OpenPyXL, Pandas, PaddleOCR |
| **Inference (Local)**  | [LM Studio](https://lmstudio.ai/) / [Ollama](https://ollama.com/) (OpenAI-compatible endpoints) |
| **Inference (Cloud)**  | [Google Gemini](https://ai.google.dev/) (gemini-1.5-pro, text-embedding-004) |
| **Containerization**   | Docker & Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
* **Python**: 3.10 or 3.11+
* **Node.js**: 18+ or 20+
* **Docker & Docker Compose** (for containerized PostgreSQL & Qdrant)

---

### ⚡ One-Click Launchers

#### On Windows:
Double-click `run.bat` or run:
```cmd
run.bat
```

#### On Linux / macOS:
```bash
chmod +x run.sh
./run.sh
```

The script verifies dependencies, verifies `.env` files, launches the FastAPI backend and Next.js frontend, and opens the workstation in your browser.

---

### 🐳 Option A: Docker Compose (Full Stack)

To run the complete infrastructure with Qdrant, PostgreSQL, and FastAPI containerized:

```bash
# 1. Clone the repository
git clone https://github.com/Mo-Alwosabi/Local-RAG-Workstation.git
cd Local-RAG-Workstation

# 2. Launch backend containers
cd backend
docker compose up --build -d

# 3. Start the Next.js workstation (in root)
cd ..
npm install
npm run dev
```

---

### 💻 Option B: Manual Local Setup

#### 1. Setup Backend (FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Configure Environment Variables
Create `backend/.env`:
```env
# ── Local Offline AI (LM Studio / Ollama) ──────────────────────────
LLM_PROVIDER=lmstudio
EMBEDDING_PROVIDER=lmstudio
LOCAL_BASE_URL=http://localhost:1234/v1
LOCAL_MODEL_NAME=qwen2.5-7b-instruct
LOCAL_EMBEDDING_MODEL=text-embedding-nomic-embed-text-v1.5

# ── Cloud AI (Google Gemini - Optional) ─────────────────────────────
# LLM_PROVIDER=gemini
# EMBEDDING_PROVIDER=gemini
# GOOGLE_API_KEY=your_gemini_api_key_here

# ── Database & Vector Storage ───────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/rag_agent
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=documents
```

Start the FastAPI server:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Setup Frontend (Next.js 15)
Open a new terminal at the project root:
```bash
# Configure frontend environment
cp .env.example .env

# Install Node dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the **Local RAG Workstation**.

---

## 📂 Project Structure

```text
Local-RAG-Workstation/
├── app/                           # Next.js 15 App Router pages
│   ├── layout.tsx                 # Root layout, fonts, and dark theme
│   ├── page.tsx                   # Main Workstation view
│   ├── chat/                      # Conversational RAG Studio
│   ├── documents/                 # Document & Collection Manager
│   ├── dashboard/                 # System Telemetry & Metrics
│   └── settings/                  # RAG Tuning & Provider Configuration
├── backend/                       # FastAPI Python Backend
│   ├── app/
│   │   ├── api/                   # REST endpoints (/query, /upload, /docs, /collections)
│   │   ├── core/                  # App configuration, database sessions, logging
│   │   ├── graph/                 # LangGraph RAG workflows & prompt templates
│   │   ├── schemas/               # Pydantic data contracts
│   │   └── services/              # Ingestion, Chunking, Qdrant client, LLM providers
│   ├── docker-compose.yml         # Container configuration (PostgreSQL + Qdrant)
│   └── requirements.txt           # Python dependencies
├── components/                    # React UI Components (Pure Monochrome)
│   ├── chat/                      # Chat interface, Citation pills, Prompt dock
│   ├── documents/                 # Document table, Dropzone, Collection manager
│   ├── dashboard/                 # Health status, Telemetry cards, Quick actions
│   ├── layout/                    # Cortex Workstation shell & Sidebar
│   └── ui/                        # Radix UI primitives (Button, Card, Badge, Dialog)
├── lib/                           # Frontend Context, API clients, and Hooks
├── run.bat                        # Windows 1-click launcher
├── run.sh                         # Linux / macOS 1-click launcher
├── package.json                   # Frontend npm dependencies
└── README.md                      # Official documentation
```

---

## ⌨ Workstation Keyboard Shortcuts

| Shortcut | Destination | Description |
| :---: | :--- | :--- |
| `_ c` | **Chat Studio** | Open the conversational RAG interrogation workspace |
| `_ d` | **Documents** | Open the document manager and collection explorer |
| `_ g` | **Dashboard** | View real-time service health and ingestion metrics |
| `_ s` | **Settings** | Adjust similarity thresholds, chunk sizes, and API URLs |
| `_ o` | **Collapse / Expand** | Toggle workstation sidebar density |
| `Esc` | **Close Overlays** | Dismiss modal dialogs and citation drawers |

---

## 🔥 Production Engineering Safeguards

- ✅ **Zero Data Leakage (Local Mode)**: Documents, embeddings, and chat prompts never leave your local network when using LM Studio or Ollama.
- ✅ **Deterministic Chunk IDs**: Identical content generates matching hashes, preventing duplicate chunk insertion.
- ✅ **Duplicate File Detection**: SHA-256 fingerprinting prevents re-indexing identical documents.
- ✅ **Graceful Crash Recovery**: Incomplete upload batches can be resumed without database inconsistency.
- ✅ **Dynamic Rate Throttling**: Exponential backoff and jitter algorithms safeguard cloud API quotas.
- ✅ **Similarity Threshold Gate**: Filters out low-confidence context chunks (similarity $< 0.65$) to prevent hallucinations.
- ✅ **Bilingual Grounding**: Specialized Arabic and English prompt templates ensure verifiable citations with page numbers.

---

## 📈 Roadmap

- [ ] Hybrid Search (Dense Vectors + Sparse BM25 + Reciprocal Rank Fusion)
- [ ] Cohere / BGE Cross-Encoder Re-Ranking Pipeline
- [ ] Redis Distributed Semantic Query Cache
- [ ] Multi-User Authentication & Role-Based Access Control (RBAC)
- [ ] Asynchronous Celery / Redis Workers for massive batch uploads
- [ ] GraphRAG (Knowledge Graph entity extraction and multi-hop reasoning)
- [ ] Automated RAG Evaluation Suite (Ragas / TruLens)

---

## 🎯 Learning Objectives & Production Skills

This codebase serves as a reference implementation for:
1. **Modern RAG Architecture**: Enterprise-grade retrieval pipelines beyond simple tutorial scripts.
2. **LangGraph State Orchestration**: Controlling multi-step conversational AI workflows.
3. **Local LLM Deployment**: Harnessing quantized open-weights models (Qwen 2.5, Llama 3) for production use.
4. **Vector Database Engineering**: Optimal HNSW indexing, cosine distance, and payload filtering with Qdrant.
5. **Modern Full-Stack Engineering**: Next.js 15 App Router + React 19 + FastAPI AsyncIO + Tailwind CSS v4.

---

## 🤝 Contributing

Contributions are welcomed! Follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## ⭐ Support & Stargazers

If **Local RAG Workstation** saved you engineering time, enhanced your data privacy, or served as a practical reference for your projects, please consider giving the repository a **Star ⭐**! It directly motivates ongoing open-source development and helps the community discover the platform.

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=Mo-Alwosabi/Local-RAG-Workstation&type=Date)](https://star-history.com/#Mo-Alwosabi/Local-RAG-Workstation&Date)

</div>

---

## 👨‍💻 Developer & Author

<div align="center">

**Developed with ❤️ by Mohammed Alwosabi (محمد الوصابي)**

[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=flat-square&logo=github)](https://github.com/Mo-Alwosabi)
[![Email](https://img.shields.io/badge/Email-moammen2004%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:moammen2004@gmail.com)

</div>

---

## 📄 License

Distributed under the **MIT License**. Copyright © 2026 Mohammed Alwosabi. See [LICENSE](LICENSE) for details.
