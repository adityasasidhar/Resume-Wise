// frontend/src/App.jsx
import { useState } from 'react';
import './App.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
            const response = await fetch('http://localhost:3000/api/analyze', { method: 'POST', body: formData });
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
            {/* These divs create the animated starry background */}
            <div className="stars stars-sm"></div>
            <div className="stars stars-md"></div>
            <div className="stars stars-lg"></div>

            {/* This div wraps all content to place it on top of the background */}
            <div className="app-content">
                <header className="app-header">
                    <h1>Resume Wish</h1>
                    <p>Your wish for the perfect candidate, granted by AI.</p>
                </header>

                {error && <div className="card error-message full-width"><p>{error}</p></div>}

                <div className="app-layout">
                    <main className="main-content">
                        {analysisResults.length > 0 ? (
                            <section id="results-section">
                                <div className="results-header">
                                    <h2>Ranked Shortlist</h2>
                                    <div className="results-actions">
                                        <button className="reset-button" onClick={handleReset}>Start Over</button>
                                        <button className="download-button" onClick={handleDownloadReport}>Download PDF</button>
                                    </div>
                                </div>
                                <div className="results-grid">{analysisResults.map((result, index) => (
                                    <div key={index} className={`result-card ${result.error ? 'error-card' : ''}`}>
                                        <div className="card-header">
                                            <div className="candidate-info">
                                                <span className="candidate-rank">#{result.rank || index + 1}</span>
                                                <span className="candidate-name">{result.candidateName || result.fileName}</span>
                                            </div>
                                            {!result.error && <div className="score-badge">Score: {result.score}</div>}
                                        </div>
                                        {result.error ? <p className="error-text-small">{result.error}</p> : (
                                            <div className="points-container">
                                                <div className="points-list good-points"><h4>Strengths</h4><ul>{result.good_points.map((p,i)=><li key={i}>{p}</li>)}</ul></div>
                                                <div className="points-list bad-points"><h4>Weaknesses</h4><ul>{result.bad_points.map((p,i)=><li key={i}>{p}</li>)}</ul></div>
                                            </div>
                                        )}
                                    </div>
                                ))}</div>
                            </section>
                        ) : isLoading ? (
                            <section className="card loading-card">
                                <div className="loader"></div>
                                <h3>Analyzing Candidates...</h3>
                                <p>The AI is reading and comparing every resume.</p>
                            </section>
                        ) : (
                            <section className="card">
                                <div className="form-group">
                                    <label htmlFor="job-description">Job Description</label>
                                    <textarea id="job-description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." required rows="15" />
                                </div>
                            </section>
                        )}
                    </main>

                    <aside className="actions-sidebar">
                        <div className="sidebar-sticky-content">
                            <div className="sidebar-section">
                                <h4>Controls</h4>
                                <button className="reset-button" onClick={handleReset}>Reset All</button>
                            </div>
                            <div className="sidebar-section">
                                <h4>Upload Resumes</h4>
                                <div className="form-group">
                                    <input type="file" id="resumes-input" className="file-input" onChange={handleFileChange} multiple accept=".pdf,.docx"/>
                                </div>
                            </div>
                            <button className="submit-button" onClick={handleSubmit} disabled={isLoading || stagedFiles.length === 0 || !jobDescription}>
                                {isLoading ? 'Analyzing...' : `Analyze & Rank`}
                            </button>
                        </div>
                    </aside>

                    <aside className="staging-sidebar">
                        <div className="sidebar-sticky-content">
                            <div className="sidebar-section file-staging-area">
                                <h4>Staged Files ({stagedFiles.length})</h4>
                                <div className="staged-files-container">
                                    {stagedFiles.length > 0 ? stagedFiles.map((file, index) => (
                                        <div key={file.name} className="file-preview-card">
                                            <div className="file-icon">📄</div>
                                            <div className="file-details">
                                                <div className="file-name">{file.name}</div>
                                                <div className="file-meta">{formatFileSize(file.size)}</div>
                                            </div>
                                            <button type="button" className="remove-btn" onClick={() => handleRemoveFile(index)}>×</button>
                                        </div>
                                    )) : (<p className='no-files-text'>Upload one or more resumes to begin.</p>)}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default App;