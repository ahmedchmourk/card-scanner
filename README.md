# Card Scanner & Gitex Batch OCR

An automated tool to upload, scan, and process batches of business cards. It extracts key contact entities (Name, Company, Phone Number, Email, and Address) using OCR and downloads them directly as an Excel spreadsheet (`.xlsx`).

This repository is split into a Next.js frontend and a FastAPI backend.

---

## 🚀 Features

- **Batch Processing**: Upload multiple business cards at once.
- **Multilingual OCR**: Supports Arabic and English texts via EasyOCR.
- **Entity Extraction**: Automatically parses name, email, phone number, address, and company name using regex and heuristic parsing.
- **Export to Excel**: Outputs all processed contacts directly to a formatted Excel file (`contact_details_batch.xlsx`).
- **Validation**: Checks for corrupted images, unsupported files, and valid card structures.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js
- **Styling**: TailwindCSS & PostCSS
- **Language**: TypeScript / JavaScript

### Backend
- **Framework**: FastAPI
- **OCR Engine**: EasyOCR
- **Computer Vision**: OpenCV
- **Data Structuring**: Pandas & OpenPyXL

---

## 📦 Getting Started

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows
   .\venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI server**:
   ```bash
   python main.py
   ```
   The backend will run on `http://localhost:8080`.

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to view the application.

---

## 🐳 Docker Deployment

To build and run the backend using Docker:

```bash
cd backend
docker build -t card-scanner-backend .
docker run -p 8080:8080 card-scanner-backend
```
