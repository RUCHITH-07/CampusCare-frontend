import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import BeforeAfterImages from '../components/BeforeAfterImages';
import StatusTimeline from '../components/StatusTimeline';
import { ArrowLeft, Star, RotateCcw, CheckCircle2, AlertTriangle, MapPin, Calendar, UserCheck } from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Reopen form state
  const [showReopen, setShowReopen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/complaints/${id}`);
      setComplaint(res.data);

      const histRes = await API.get(`/complaints/${id}/history`);
      setHistory(histRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await API.post(`/complaints/${id}/feedback`, { rating, feedback });
      fetchDetails();
    } catch (err) {
      alert(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    setSubmittingReopen(true);
    try {
      await API.post(`/complaints/${id}/reopen`, { reopenReason });
      setShowReopen(false);
      setReopenReason('');
      fetchDetails();
    } catch (err) {
      alert(err.message || 'Failed to reopen complaint.');
    } finally {
      setSubmittingReopen(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading complaint details...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!complaint) return null;

  const isOwner = user && user.id === complaint.createdById;
  const isResolvedOrClosed = ['RESOLVED', 'CLOSED'].includes(complaint.status);

  return (
    <div style={{ maxWidth: '860px', margin: '1rem auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main Header Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4F46E5' }}>{complaint.referenceNumber}</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>{complaint.title}</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        <p style={{ color: '#334155', fontSize: '1rem', marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
          {complaint.description}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
          <div><MapPin size={16} style={{ verticalAlign: 'middle', color: '#64748B' }} /> Location: <strong>{complaint.location}</strong></div>
          <div>Category: <strong>{complaint.category}</strong></div>
          <div><Calendar size={16} style={{ verticalAlign: 'middle', color: '#64748B' }} /> Created: <strong>{new Date(complaint.createdAt).toLocaleString()}</strong></div>
          <div><UserCheck size={16} style={{ verticalAlign: 'middle', color: '#64748B' }} /> Assigned: <strong>{complaint.assignedToName || 'Unassigned'}</strong></div>
        </div>
      </div>

      {/* Resolution Note if present */}
      {complaint.resolutionNote && (
        <div className="card" style={{ borderLeft: '4px solid #16A34A', background: '#F0FDF4' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} /> Resolution Note from Admin
          </h3>
          <p style={{ color: '#15803D', fontSize: '0.95rem' }}>{complaint.resolutionNote}</p>
          {complaint.resolvedAt && (
            <p style={{ fontSize: '0.8rem', color: '#166534', marginTop: '0.5rem' }}>
              Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Before / After Verification Photos */}
      <div className="card">
        <h3 className="card-title">Verification Photos (Before & After)</h3>
        <BeforeAfterImages beforeImage={complaint.beforeImagePath} afterImage={complaint.afterImagePath} />
      </div>

      {/* Rating & Feedback / Reopen Section for Student Owner */}
      {isOwner && isResolvedOrClosed && (
        <div className="card" style={{ border: '2px solid #E0E7FF' }}>
          <h3 className="card-title">Student Feedback & Rating</h3>

          {complaint.rating ? (
            <div>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={22} fill={star <= complaint.rating ? '#F59E0B' : 'none'} color={star <= complaint.rating ? '#F59E0B' : '#CBD5E1'} />
                ))}
              </div>
              <p style={{ color: '#334155', fontStyle: 'italic' }}>"{complaint.feedback || 'No written feedback provided.'}"</p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '0.75rem' }}>
                How satisfied are you with the resolution of this complaint?
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Star size={28} fill={star <= rating ? '#F59E0B' : 'none'} color={star <= rating ? '#F59E0B' : '#CBD5E1'} />
                  </button>
                ))}
              </div>

              <div className="form-group">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Write your feedback comments..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-success" disabled={submittingFeedback}>
                Submit Feedback & Close Complaint
              </button>
            </form>
          )}

          {/* Reopen Action Button */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>
              Issue not actually resolved? You can reopen this complaint back to IN_PROGRESS.
            </p>
            {!showReopen ? (
              <button onClick={() => setShowReopen(true)} className="btn btn-warning btn-sm">
                <RotateCcw size={16} /> Reopen Complaint
              </button>
            ) : (
              <form onSubmit={handleReopenSubmit} style={{ marginTop: '0.75rem', background: '#FFFBEB', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FDE68A' }}>
                <h4 style={{ color: '#92400E', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Reason for Reopening:</h4>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  placeholder="Explain why the fix is incomplete..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button type="submit" className="btn btn-warning btn-sm" disabled={submittingReopen}>
                    Confirm Reopen
                  </button>
                  <button type="button" onClick={() => setShowReopen(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Status History Timeline */}
      <div className="card">
        <h3 className="card-title">Status Audit Trail</h3>
        <StatusTimeline history={history} />
      </div>
    </div>
  );
};

export default ComplaintDetails;
