import React from 'react';

const ControlsSidebar = ({ handleReset, handleFileChange, handleSubmit, isLoading, stagedFiles, jobDescription }) => {
    return (
        <aside className="actions-sidebar">
            <div className="sidebar-sticky-content">
                <div className="sidebar-section">
                    <h4>Controls</h4>
                    <button className="reset-button" onClick={handleReset}>Reset All</button>
                </div>
                <div className="sidebar-section">
                    <h4>Upload Resumes</h4>
                    <div className="form-group">
                        <input
                            type="file"
                            id="resumes-input"
                            className="file-input"
                            onChange={handleFileChange}
                            multiple
                            accept=".pdf,.docx"
                        />
                    </div>
                </div>
                <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={isLoading || stagedFiles.length === 0 || !jobDescription}
                >
                    {isLoading ? 'Analyzing...' : 'Analyze & Rank'}
                </button>
            </div>
        </aside>
    );
};

export default ControlsSidebar;