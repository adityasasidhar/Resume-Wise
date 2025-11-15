import React from 'react';

const LoadingSpinner = () => {
    return (
        <section className="card loading-card">
            <div className="loader"></div>
            <h3>Analyzing Candidates...</h3>
            <p>The AI is reading and comparing every resume.</p>
        </section>
    );
};

export default LoadingSpinner;