import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { PlusCircle, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await API.get('/complaints?page=0&size=5&sortBy=createdAt&sortDir=desc');
        setComplaints(res.data?.content || []);
      } catch (err) {
        console.error('Failed to load user dashboard complaints', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const totalCount = complaints.length;
  const activeCount = complaints.filter(c => ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;
  const resolvedCount = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Student Portal</h1>
          <p style={{ color: '#64748B' }}>Welcome back, {user?.fullName}! Track and submit your campus issues.</p>
        </div>
        <Link to="/complaints/new" className="btn btn-primary">
          <PlusCircle size={18} />
          Submit New Complaint
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}><AlertCircle size={24} /></div>
          <div>
            <div className="stat-value">{totalCount}</div>
            <div className="stat-label">Total Submitted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><Clock size={24} /></div>
          <div>
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active / In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><CheckCircle2 size={24} /></div>
          <div>
            <div className="stat-value">{resolvedCount}</div>
            <div className="stat-label">Resolved / Closed</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>Recent Complaints</span>
          <Link to="/my-complaints" style={{ fontSize: '0.875rem', color: '#4F46E5', textDecoration: 'none', fontWeight: 500 }}>
            View All <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#64748B', padding: '1rem 0' }}>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748B' }}>
            <p>You haven't submitted any complaints yet.</p>
            <Link to="/complaints/new" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Submit Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ref Number</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: '#4F46E5' }}>{item.referenceNumber}</td>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/complaints/${item.id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
