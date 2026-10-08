import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Upload, X, ShieldAlert, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  'INFRASTRUCTURE', 'LABORATORY', 'CLASSROOM', 'TRANSPORTATION',
  'SANITATION', 'INTERNET', 'HOSTEL', 'ELECTRICAL', 'OTHER'
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const NewComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'CLASSROOM',
    priority: 'MEDIUM',
    location: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Rule: BEFORE photo is required for non-OTHER categories
    if (formData.category !== 'OTHER' && !file) {
      setError(`A BEFORE photo is required for the ${formData.category} category so maintenance can inspect the issue.`);
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('location', formData.location);
      data.append('description', formData.description);
      if (file) {
        data.append('beforeImage', file);
      }

      const res = await API.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate(`/complaints/${res.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1rem auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card">
        <h2 className="card-title">Submit a New Complaint</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Complaint Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              required
              placeholder="e.g. Projector not working in Lab 3"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level *</label>
              <select name="priority" className="form-select" value={formData.priority} onChange={handleChange}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Specific Location *</label>
            <input
              type="text"
              name="location"
              className="form-control"
              required
              placeholder="e.g. Science Block B, Room 204"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description of Issue *</label>
            <textarea
              name="description"
              className="form-control"
              rows={4}
              required
              placeholder="Provide exact details of the malfunction or issue..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              BEFORE Photo {formData.category !== 'OTHER' ? '(Required)' : '(Optional)'}
            </label>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.5rem' }}>
              Supported formats: JPG, PNG, WEBP (Max 5MB)
            </p>

            {preview ? (
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '0.5rem' }}>
                <img src={preview} alt="Upload preview" style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '0.5rem', border: '1px solid #CBD5E1' }} />
                <button
                  type="button"
                  onClick={removeFile}
                  style={{
                    position: 'absolute', top: '8px', right: '8px', background: '#EF4444',
                    color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-control"
                onChange={handleFileChange}
              />
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            <Upload size={18} />
            {submitting ? 'Submitting Complaint...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewComplaint;
