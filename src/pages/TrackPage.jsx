import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import BeforeAfterImages from '../components/BeforeAfterImages';
import StatusTimeline from '../components/StatusTimeline';
import { Search, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

const TrackPage = () => {
  const { referenceNumber: paramRef } = useParams();
  const navigate = useNavigate();
  const [refInput, setRefInput] = useState(paramRef || '');
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrackData = async (ref) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError('');
    setComplaint(null);
    try {
      const res = await API.get(`/complaints/track/${ref.trim()}`);
      setComplaint(res.data);

      // Fetch history if public track endpoint works
      try {
        const histRes = await API.get(`/complaints/${res.data.id}/history`);
        setHistory(histRes.data || []);
      } catch (e) {
        setHistory([]);
      }
    } catch (err) {
      setError(err.message || 'Complaint not found with this reference number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramRef) {
      fetchTrackData(paramRef);
    }
  }, [paramRef]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (refInput.trim()) {
      navigate(`/track/${refInput.trim()}`);
      fetchTrackData(refInput.trim());
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="card-title">Track Complaint Progress</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter reference number (e.g. CC-2026-000001)"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={18} />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {complaint && (
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4F46E5' }}>{complaint.referenceNumber}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0' }}>{complaint.title}</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
            </div>

            <p style={{ color: '#475569', marginBottom: '1.25rem' }}>{complaint.description}</p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
              <div><MapPin size={16} style={{ verticalAlign: 'middle' }} /> {complaint.location}</div>
              <div>Category: <strong>{complaint.category}</strong></div>
              <div><Calendar size={16} style={{ verticalAlign: 'middle' }} /> Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</div>
              {complaint.assignedToName && <div>Assigned To: <strong>{complaint.assignedToName}</strong></div>}
            </div>
          </div>

          {/* Resolution Note if present */}
          {complaint.resolutionNote && (
            <div className="card" style={{ borderLeft: '4px solid #16A34A' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#166534', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> Resolution Details
              </h3>
              <p style={{ color: '#1E293B' }}>{complaint.resolutionNote}</p>
            </div>
          )}

          {/* Before & After Photos */}
          <div className="card">
            <h3 className="card-title">Verification Photos</h3>
            <BeforeAfterImages beforeImage={complaint.beforeImagePath} afterImage={complaint.afterImagePath} />
          </div>

          {/* Status Timeline */}
          {history.length > 0 && (
            <div className="card">
              <h3 className="card-title">Status Change Timeline</h3>
              <StatusTimeline history={history} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackPage;
