import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { LayoutDashboard, CheckCircle2, Clock, AlertCircle, Users, ArrowRight } from 'lucide-react';

const COLORS = ['#94A3B8', '#0284C7', '#D97706', '#16A34A', '#64748B'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const statsRes = await API.get('/admin/dashboard/stats');
        setStats(statsRes.data);

        const complaintsRes = await API.get('/admin/complaints?page=0&size=5&sortBy=createdAt&sortDir=desc');
        setRecentComplaints(complaintsRes.data?.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Admin Dashboard...</div>;

  const statusPieData = stats?.statusCounts ? Object.keys(stats.statusCounts).map(key => ({
    name: key,
    value: stats.statusCounts[key]
  })) : [];

  const categoryBarData = stats?.categoryCounts ? Object.keys(stats.categoryCounts).map(key => ({
    category: key,
    count: stats.categoryCounts[key]
  })) : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Admin Operations Dashboard</h1>
          <p style={{ color: '#64748B' }}>Real-time overview of campus complaints and department statistics</p>
        </div>
        <Link to="/admin/complaints" className="btn btn-primary">
          Manage All Complaints
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}><AlertCircle size={24} /></div>
          <div>
            <div className="stat-value">{stats?.totalComplaints || 0}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F1F5F9', color: '#475569' }}><Clock size={24} /></div>
          <div>
            <div className="stat-value">{stats?.submittedCount || 0}</div>
            <div className="stat-label">Submitted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><Clock size={24} /></div>
          <div>
            <div className="stat-value">{(stats?.assignedCount || 0) + (stats?.inProgressCount || 0)}</div>
            <div className="stat-label">Assigned / In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><CheckCircle2 size={24} /></div>
          <div>
            <div className="stat-value">{stats?.resolvedCount || 0}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 className="card-title">Complaints by Status</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Complaints by Category</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={categoryBarData}>
                <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card">
        <div className="card-title">
          <span>Recent Campus Complaints</span>
          <Link to="/admin/complaints" style={{ fontSize: '0.875rem', color: '#4F46E5', textDecoration: 'none', fontWeight: 500 }}>
            View All <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ref Number</th>
                <th>Title</th>
                <th>Category</th>
                <th>Student</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: '#4F46E5' }}>{item.referenceNumber}</td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.createdByName}</td>
                  <td><PriorityBadge priority={item.priority} /></td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    <Link to={`/admin/complaints`} className="btn btn-secondary btn-sm">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
