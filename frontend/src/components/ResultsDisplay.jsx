import React from 'react';

const ResultsDisplay = ({ analysisResults, handleReset, handleDownloadReport }) => {
    return (
        <section id="results-section">
            <div className="results-header">
                <h2>Ranked Shortlist</h2>
                <div className="results-actions">
                    <button className="reset-button" onClick={handleReset}>Start Over</button>
                    <button className="download-button" onClick={handleDownloadReport}>Download PDF</button>
                </div>
            </div>
            <div className="results-grid">
                {analysisResults.map((result, index) => (
                    <div key={index} className={`result-card ${result.error ? 'error-card' : ''}`}>
                        <div className="card-header">
                            <div className="candidate-info">
                                <span className="candidate-rank">#{result.rank || index + 1}</span>
                                <span className="candidate-name">{result.candidateName || result.fileName}</span>
                            </div>
                            {!result.error && <div className="score-badge">Score: {result.score}</div>}
                        </div>
                        {result.error ? (
                            <p className="error-text-small">{result.error}</p>
                        ) : (
                            <div className="points-container">
                                <div className="points-list good-points">
                                    <h4>Strengths</h4>
                                    <ul>{result.good_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                                </div>
                                <div className="points-list bad-points">
                                    <h4>Weaknesses</h4>
                                    <ul>{result.bad_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ResultsDisplay;