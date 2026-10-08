import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Zap, Image, CheckCircle, Search, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const [refNum, setRefNum] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (refNum.trim()) {
      navigate(`/track/${refNum.trim()}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
        padding: '4rem 2rem',
        borderRadius: '1rem',
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '1rem' }}>
          CampusCare – Smart Complaint Management System
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#4338CA', maxWidth: '750px', margin: '0 auto 2rem' }}>
          Streamlining campus maintenance, infrastructure, and laboratory complaints with photo verification, real-time tracking, and administrative accountability.
        </p>

        {/* Quick Reference Tracker */}
        <form onSubmit={handleTrack} style={{
          maxWidth: '550px', margin: '0 auto', display: 'flex', gap: '0.5rem',
          background: '#FFFFFF', padding: '0.5rem', borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)'
        }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Complaint Ref (e.g. CC-2026-000001)"
            value={refNum}
            onChange={(e) => setRefNum(e.target.value)}
            style={{ border: 'none' }}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={18} />
            Track Status
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1.05rem' }}>
            Get Started as Student <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '1.05rem' }}>
            Admin Portal
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
        Why CampusCare?
      </h2>

      <div className="grid-2" style={{ marginBottom: '3rem' }}>
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ background: '#EEF2FF', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <Image size={28} color="#4F46E5" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Visual Verification (Before / After)</h3>
            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
              Students submit issues with BEFORE photos. Admins must upload an AFTER photo of the fixed issue before marking it RESOLVED.
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ background: '#EEF2FF', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <Zap size={28} color="#4F46E5" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Automated Workflow Audit</h3>
            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
              Every status step (SUBMITTED ➔ ASSIGNED ➔ IN PROGRESS ➔ RESOLVED ➔ CLOSED) is timestamped and recorded in audit history.
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ background: '#EEF2FF', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <ShieldCheck size={28} color="#4F46E5" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Student Rating & Reopen Protection</h3>
            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
              Students can grade resolutions (1-5 stars) or reopen unresolved complaints back to IN_PROGRESS if unsatisfactory.
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ background: '#EEF2FF', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <CheckCircle size={28} color="#4F46E5" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>In-App Notifications</h3>
            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
              Receive instant updates when staff gets assigned, starts work, or posts resolution photos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
