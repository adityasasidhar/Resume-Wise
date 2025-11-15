import React from 'react';

const JobDescriptionForm = ({ jobDescription, setJobDescription }) => {
    return (
        <section className="card">
            <div className="form-group">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    required
                    rows="15"
                />
            </div>
        </section>
    );
};

export default JobDescriptionForm;