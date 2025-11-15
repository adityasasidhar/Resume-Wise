import React from 'react';

const StagingSidebar = ({ stagedFiles, handleRemoveFile, formatFileSize }) => {
    return (
        <aside className="staging-sidebar">
            <div className="sidebar-sticky-content">
                <div className="sidebar-section file-staging-area">
                    <h4>Staged Files ({stagedFiles.length})</h4>
                    <div className="staged-files-container">
                        {stagedFiles.length > 0 ? (
                            stagedFiles.map((file, index) => (
                                <div key={file.name} className="file-preview-card">
                                    <div className="file-icon">📄</div>
                                    <div className="file-details">
                                        <div className="file-name">{file.name}</div>
                                        <div className="file-meta">{formatFileSize(file.size)}</div>
                                    </div>
                                    <button type="button" className="remove-btn" onClick={() => handleRemoveFile(index)}>×</button>
                                </div>
                            ))
                        ) : (
                            <p className="no-files-text">Upload one or more resumes to begin.</p>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default StagingSidebar;