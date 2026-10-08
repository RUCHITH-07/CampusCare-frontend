import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Bell, CheckCheck, Circle } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '1rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={24} color="#4F46E5" /> Notifications
        </h1>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllAsRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: '2rem 0', textAlign: 'center', color: '#64748B' }}>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: '#64748B' }}>
            <p>No notifications found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #E2E8F0',
                  background: n.read ? '#FFFFFF' : '#EEF2FF',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  {!n.read && <Circle size={10} fill="#4F46E5" color="#4F46E5" style={{ marginTop: '6px' }} />}
                  <div>
                    <p style={{ fontWeight: n.read ? 400 : 600, color: '#0F172A', marginBottom: '0.25rem' }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {n.complaintId && (
                    <Link to={`/complaints/${n.complaintId}`} className="btn btn-secondary btn-sm">
                      View
                    </Link>
                  )}
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="btn btn-secondary btn-sm">
                      Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
