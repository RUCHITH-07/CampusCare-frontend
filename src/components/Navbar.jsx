import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { ShieldAlert, Bell, LogOut, User as UserIcon, PlusCircle, ListFilter, LayoutDashboard, Search, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const res = await API.get('/notifications/unread-count');
          setUnreadCount(res.data || 0);
        } catch (err) {
          // ignore error
        }
      };
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <ShieldAlert size={26} color="#4F46E5" />
        <span>CampusCare</span>
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            {user.role === 'ADMIN' ? (
              <>
                <Link to="/admin/dashboard" className="nav-link">
                  <LayoutDashboard size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Dashboard
                </Link>
                <Link to="/admin/complaints" className="nav-link">
                  <ListFilter size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Manage Complaints
                </Link>
                <Link to="/admin/users" className="nav-link">
                  <Users size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Users
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="nav-link">
                  <LayoutDashboard size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Dashboard
                </Link>
                <Link to="/complaints/new" className="nav-link">
                  <PlusCircle size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  New Complaint
                </Link>
                <Link to="/my-complaints" className="nav-link">
                  <ListFilter size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  My Complaints
                </Link>
              </>
            )}

            <Link to="/track" className="nav-link">
              <Search size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Track
            </Link>

            <Link to="/notifications" className="nav-link" style={{ position: 'relative' }}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '2px', right: '2px',
                  background: '#EF4444', color: 'white', fontSize: '10px',
                  fontWeight: 'bold', borderRadius: '50%', padding: '2px 6px'
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', background: '#F1F5F9', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
              <UserIcon size={16} color="#64748B" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                {user.fullName} ({user.role})
              </span>
            </div>

            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/track" className="nav-link">Track Complaint</Link>
            <Link to="/login" className="nav-link">Log In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
