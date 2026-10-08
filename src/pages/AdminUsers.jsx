import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Users, CheckCircle, XCircle, Shield } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId, currentEnabled) => {
    const action = currentEnabled ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await API.put(`/admin/users/${userId}/status?enabled=${!currentEnabled}`);
      fetchUsers();
    } catch (err) {
      alert(err.message || `Failed to ${action} user.`);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '1rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={26} color="#4F46E5" /> System User Management
        </h1>
        <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Total Registered: {users.length}</span>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: '2rem 0', textAlign: 'center', color: '#64748B' }}>Loading users...</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>ID / Roll No</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'priority-HIGH' : 'priority-LOW'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.rollNumberOrEmployeeId || '-'}</td>
                    <td>{u.department || '-'}</td>
                    <td>
                      {u.enabled ? (
                        <span style={{ color: '#16A34A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <span style={{ color: '#DC2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <XCircle size={14} /> Disabled
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleUserStatus(u.id, u.enabled)}
                        className={`btn ${u.enabled ? 'btn-danger' : 'btn-success'} btn-sm`}
                      >
                        {u.enabled ? 'Disable' : 'Enable'}
                      </button>
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

export default AdminUsers;
