# AI Resume Shortlisting Bot

This is a full-stack AI-powered application that allows an HR professional to upload multiple resumes and automatically shortlists the best candidates based on a job description.

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js with Hono
- **AI Agent**: LangChain.js with OpenAI
- **File Parsing**: `pdf-parse`, `mammoth`

## Setup & Installation

### Prerequisites

- Node.js (v18+)
- An OpenAI API Key

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file from the `.env.example` and add your OpenAI API key.
    ```
    OPENAI_API_KEY="sk-..."
    ```
4.  Start the backend server:
    ```bash
    npm start 
    # (You'll need to add a "start" script to package.json: "start": "node src/index.js")
    ```
    The server will run on `http://localhost:3000`.

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm start.sh dev
    ```
    The app will be available at `http://localhost:5173`.

## Deployment

### Frontend (Vercel)

1.  Push the code to a GitHub repository.
2.  Import the project into Vercel.
3.  Set the Framework Preset to "Vite".
4.  Set the Root Directory to `frontend`.
5.  Deploy.

### Backend (Render)

1.  Push the code to a GitHub repository.
2.  On Render, create a new "Web Service".
3.  Connect your repository.
4.  Set the Root Directory to `backend`.
5.  Set the Build Command to `npm install`.
6.  Set the Start Command to `node src/index.js`.
7.  Add your `OPENAI_API_KEY` as an Environment Variable.
8.  Deploy. Remember to update the frontend's `fetch` URL to your new Render backend URL.