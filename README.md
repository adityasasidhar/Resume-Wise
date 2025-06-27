# Resume Wish

### ✨ Your wish for the perfect candidate, granted by AI. ✨

## 🚀 About The Project

Resume Wish is a full-stack AI-powered application designed for modern HR professionals. It moves beyond simple keyword matching by performing a sophisticated, **comparative analysis** of a batch of resumes against a single job description. The application then produces a ranked shortlist of candidates, complete with scores, evidence-based strengths, and weaknesses, allowing for faster and more intelligent hiring decisions.

The entire user interface is built to be professional and aesthetically pleasing, featuring a dynamic starry background and a clean, three-column "glassmorphism" layout.

### Key Features

*   **AI-Powered Comparative Ranking:** Upload multiple resumes (PDF or DOCX) at once. The AI analyzes the entire batch together to determine the best fit relative to the other candidates.
*   **Intelligent Analysis:** The system doesn't just look for keywords. It uses a detailed rubric to evaluate technical skills, relevant experience, quantifiable achievements, and potential red flags.
*   **Ranked Shortlist:** The final output is a clean, ranked list from best to worst, complete with a score (0-100), the candidate's name, and a summary of their pros and cons.
*   **Downloadable PDF Reports:** HR professionals can download a beautifully formatted PDF summary of the ranked shortlist to share with their team or for record-keeping.
*   **Dynamic & Professional UI:** Features a sleek, three-column layout with a "glassmorphism" aesthetic and a dynamic, animated starry background for a premium user experience.
*   **File Staging Area:** A clear and intuitive sidebar where users can see and manage all uploaded files before submitting them for analysis.

## 🛠️ Tech Stack

### Frontend Technologies
*   **React** - A popular JavaScript library for building user interfaces, created by Facebook. React makes it easy to create interactive UIs that update efficiently when data changes.
*   **Vite** - A modern, fast frontend build tool that significantly improves the development experience with features like instant server start and hot module replacement.
*   **jsPDF & jspdf-autotable** - JavaScript libraries that enable the application to generate professional PDF reports directly in the browser, without requiring server-side processing.
*   **CSS with Glassmorphism** - Modern styling technique that creates a frosted glass effect, giving the application a premium, contemporary look and feel.

### Backend Technologies
*   **Node.js** - A JavaScript runtime that allows developers to run JavaScript on the server side, enabling a unified JavaScript codebase across the entire application.
*   **Hono** - A fast, lightweight web framework for Node.js that provides essential features for building APIs with minimal overhead.

### AI & Machine Learning Technologies
*   **LangChain.js** - An advanced framework designed to build applications powered by language models. It provides tools for connecting AI models with external data sources and allowing them to interact with their environment.
*   **Google Gemini API** - Google's state-of-the-art large language model that powers the AI analysis in this application. Specifically, we use the `gemini-1.5-flash-latest` model, which offers an excellent balance of speed and accuracy.
*   **Document Processing** - LangChain's document loaders extract and process text from PDF and DOCX resume files, making the content accessible to the AI for analysis.
*   **Structured Output with Zod** - The application uses Zod, a TypeScript-first schema validation library, to ensure the AI generates consistent, structured responses that can be reliably processed by the application.

## 🏗️ Architecture & Technical Implementation

Resume Wish uses a modern, scalable architecture that combines the best of web and AI technologies:

### How It Works

1. **User Interface Layer** - The React frontend provides an intuitive interface where HR professionals can upload job descriptions and multiple resume files. The UI is designed with a focus on user experience, featuring a responsive layout and visual feedback during the analysis process.

2. **API Layer** - The Node.js backend with Hono framework handles HTTP requests, file uploads, and coordinates the resume analysis process. This lightweight API layer ensures fast response times and efficient resource usage.

3. **Document Processing Layer** - When resumes are uploaded, LangChain's document loaders extract text content from PDF and DOCX files, preparing it for analysis by the AI.

4. **AI Analysis Layer** - The core of the application uses Google's Gemini API through LangChain to:
   - Analyze the job description to identify key requirements
   - Process each resume to extract relevant information
   - Compare all candidates against each other using a sophisticated evaluation framework
   - Generate a ranked list with detailed strengths and weaknesses for each candidate

5. **Output Generation Layer** - The results are formatted and displayed in the UI, with the option to generate a professional PDF report using jsPDF.

This architecture ensures that Resume Wish can handle multiple file formats, process large batches of resumes efficiently, and provide consistent, high-quality analysis results.

## ⚙️ Setup and Installation

Follow these steps to get a local copy up and running.

### Prerequisites

*   **Node.js** (v18.0 or newer)
*   **Google Gemini API Key**
    *   You can get a free API key from [Google AI Studio](https://aistudio.google.com/).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    cd [your-project-directory]
    ```

2.  **Backend Setup:**
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   Install the dependencies. Some LangChain packages have conflicting peer dependencies, so using `--legacy-peer-deps` is recommended for a smooth install.
        ```bash
        npm install --legacy-peer-deps
        ```
    *   Create a new file named `.env` in the `backend` directory.
    *   Add your Gemini API Key to the `.env` file:
        ```
        # backend/.env
        GEMINI_API_KEY="Your-New-Gemini-API-Key-Goes-Here"
        ```
    *   Start the backend server:
        ```bash
        npm start
        ```
        The server will be running on `http://localhost:3000`.

3.  **Frontend Setup:**
    *   Open a **new terminal window** and navigate to the frontend directory:
        ```bash
        cd frontend
        ```
    *   Install the dependencies:
        ```bash
        npm install
        ```
    *   Start the frontend development server:
        ```bash
        npm run dev
        ```
        The application will be available at `http://localhost:5173`.

## 🚀 Usage

1.  Open `http://localhost:5173` in your browser.
2.  Paste the full text of a job description into the main text area on the left.
3.  In the middle column, click the "Upload Resumes" button to select multiple PDF or DOCX files.
4.  The selected files will appear in the "Staged Files" column on the right. You can add more files or remove them as needed.
5.  Click the "Analyze & Rank" button.
6.  Once the AI has completed its analysis, a ranked list of candidates will appear.
7.  Click the "Download PDF" button at the top of the results to get a shareable report.

## ☁️ Deployment

### Frontend (Vercel)

1.  Push the code to your GitHub repository.
2.  Go to [Vercel](https://vercel.com/) and create a new project, importing your repository.
3.  Set the **Framework Preset** to "Vite".
4.  Set the **Root Directory** to `frontend`.
5.  Deploy. Vercel will handle the rest.

### Backend (Render)

1.  Push the code to your GitHub repository.
2.  Go to [Render](https://render.com/) and create a new "Web Service".
3.  Connect your GitHub repository.
4.  Configure the service with the following settings:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  Go to the "Environment" tab and add a **New Environment Variable**:
    *   **Key**: `GEMINI_API_KEY`
    *   **Value**: Paste your secret Gemini API key here.
6.  Deploy the service.
7.  **Crucially**, copy your new backend URL from Render (it will look like `https://your-app-name.onrender.com`). Go back into your frontend code (`frontend/src/App.jsx`) and replace the `http://localhost:3000` fetch URL with your new live Render URL, then re-deploy the frontend.
