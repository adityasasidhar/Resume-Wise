import { useState } from 'react';
import './App.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from './components/Header';
import JobDescriptionForm from './components/JobDescriptionForm';
import ControlsSidebar from './components/ControlsSidebar';
import StagingSidebar from './components/StagingSidebar';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
    const [jobDescription, setJobDescription] = useState('');
    const [stagedFiles, setStagedFiles] = useState([]);
    const [analysisResults, setAnalysisResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setStagedFiles((prev) => [...prev, ...newFiles.filter(nf => !prev.some(pf => pf.name === nf.name))]);
        e.target.value = null;
    };

    const handleRemoveFile = (indexToRemove) => {
        setStagedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleReset = () => {
        setJobDescription(''); setStagedFiles([]); setAnalysisResults([]); setError('');
    };

    const handleDownloadReport = () => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text("Resume Wish - Analysis Report", pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(new Date().toLocaleDateString(), pageWidth - 20, 20, { align: 'right' });

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("Job Description Used:", 20, 40);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const jdLines = doc.splitTextToSize(jobDescription, pageWidth - 40);
            doc.text(jdLines, 20, 48);

            const startYForTable = doc.getTextDimensions(jdLines).h + 55;

            const tableHead = [['Rank', 'Candidate', 'Score', 'Strengths', 'Weaknesses']];
            const tableBody = analysisResults
                .filter(res => !res.error)
                .map(res => [
                    `#${res.rank}`, res.candidateName, res.score,
                    res.good_points.map(p => `- ${p}`).join('\n'),
                    res.bad_points.map(p => `- ${p}`).join('\n')
                ]);

            autoTable(doc, {
                head: tableHead, body: tableBody, startY: startYForTable, theme: 'striped',
                headStyles: { fillColor: [109, 91, 151], fontSize: 11, fontStyle: 'bold' },
                bodyStyles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
                columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 35 }, 2: { cellWidth: 15 } }
            });

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i); doc.setFontSize(8);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
            }
            doc.save('resume-wish-report.pdf');
        } catch (e) {
            console.error("Error generating PDF:", e);
            setError("Failed to generate PDF report. Check console for details.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); setError(''); setAnalysisResults([]);
        const formData = new FormData();
        formData.append('jobDescription', jobDescription);
        stagedFiles.forEach(file => formData.append('resumes', file));

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://resume-wise-backend.onrender.com';
            const response = await fetch(`${apiUrl}/api/analyze`, { method: 'POST', body: formData });

            if (!response.ok) {
                const errData = await response.json(); throw new Error(errData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAnalysisResults(data.results);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <Header />

            {error && <div className="card error-message full-width"><p>{error}</p></div>}

            <div className="app-layout">
                <main className="main-content">
                    {analysisResults.length > 0 ? (
                        <ResultsDisplay
                            analysisResults={analysisResults}
                            handleReset={handleReset}
                            handleDownloadReport={handleDownloadReport}
                        />
                    ) : isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <JobDescriptionForm
                            jobDescription={jobDescription}
                            setJobDescription={setJobDescription}
                        />
                    )}
                </main>

                <ControlsSidebar
                    handleReset={handleReset}
                    handleFileChange={handleFileChange}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    stagedFiles={stagedFiles}
                    jobDescription={jobDescription}
                />

                <StagingSidebar
                    stagedFiles={stagedFiles}
                    handleRemoveFile={handleRemoveFile}
                    formatFileSize={formatFileSize}
                />
            </div>
        </div>
    );
}

export default App;