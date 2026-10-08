import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import BeforeAfterImages from '../components/BeforeAfterImages';
import StatusTimeline from '../components/StatusTimeline';
import { Search, Filter, UserCheck, RefreshCw, CheckCircle, XCircle, X } from 'lucide-react';

const CATEGORIES = ['', 'INFRASTRUCTURE', 'LABORATORY', 'CLASSROOM', 'TRANSPORTATION', 'SANITATION', 'INTERNET', 'HOSTEL', 'ELECTRICAL', 'OTHER'];
const STATUSES = ['', 'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Filters
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');

  // Selected complaint for modal actions
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'assign', 'status', 'resolve', 'details'
  const [history, setHistory] = useState([]);

  // Form states for modals
  const [assignedUserId, setAssignedUserId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [statusRemarks, setStatusRemarks] = useState('');

  const [resolutionNote, setResolutionNote] = useState('');
  const [afterImage, setAfterImage] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, status, category, priority, search]);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let query = `/admin/complaints?page=${page}&size=10&sortBy=createdAt&sortDir=desc`;
      if (status) query += `&status=${status}`;
      if (category) query += `&category=${category}`;
      if (priority) query += `&priority=${priority}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await API.get(query);
      setComplaints(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (type, complaint) => {
    setSelectedComplaint(complaint);
    setActiveModal(type);
    setModalError('');

    if (type === 'assign') {
      setAssignedUserId(complaint.assignedToId || (users[0]?.id || ''));
      setAssignRemarks('');
    } else if (type === 'status') {
      setNewStatus(complaint.status);
      setStatusRemarks('');
    } else if (type === 'resolve') {
      setResolutionNote('');
      setAfterImage(null);
      setAfterPreview(null);
    } else if (type === 'details') {
      try {
        const histRes = await API.get(`/admin/complaints/${complaint.id}/history`);
        setHistory(histRes.data || []);
      } catch (e) {
        setHistory([]);
      }
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedComplaint(null);
    setModalError('');
  };

  // Action: Assign
  const handleAssign = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    setModalError('');
    try {
      await API.put(`/admin/complaints/${selectedComplaint.id}/assign`, {
        assignedToUserId: assignedUserId,
        remarks: assignRemarks
      });
      closeModal();
      fetchComplaints();
    } catch (err) {
      setModalError(err.message || 'Failed to assign complaint.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Change Status
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    setModalError('');
    try {
      await API.put(`/admin/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        remarks: statusRemarks
      });
      closeModal();
      fetchComplaints();
    } catch (err) {
      setModalError(err.message || 'Failed to update status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Resolve (MANDATORY AFTER image + resolutionNote)
  const handleResolve = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!afterImage) {
      setModalError('An AFTER (fixed) photo is mandatory to resolve a complaint.');
      return;
    }
    if (!resolutionNote.trim()) {
      setModalError('Please write a resolution note explaining the fix.');
      return;
    }

    setSubmittingAction(true);
    try {
      const data = new FormData();
      data.append('resolutionNote', resolutionNote);
      data.append('afterImage', afterImage);

      await API.post(`/admin/complaints/${selectedComplaint.id}/resolve`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      closeModal();
      fetchComplaints();
    } catch (err) {
      setModalError(err.message || 'Failed to resolve complaint.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Close
  const handleClose = async (complaintId) => {
    if (!window.confirm('Are you sure you want to close this complaint?')) return;
    try {
      await API.put(`/admin/complaints/${complaintId}/close`);
      fetchComplaints();
    } catch (err) {
      alert(err.message || 'Failed to close complaint.');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>All Campus Complaints</h1>

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ref or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Priority</label>
            <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">All Priorities</option>
              {PRIORITIES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="card">
        {loading ? (
          <p style={{ padding: '2rem 0', textAlign: 'center', color: '#64748B' }}>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p style={{ padding: '2rem 0', textAlign: 'center', color: '#64748B' }}>No complaints found matching filters.</p>
        ) : (
          <>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref Number</th>
                    <th>Title & Location</th>
                    <th>Category</th>
                    <th>Student</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: '#4F46E5' }}>{item.referenceNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{item.location}</div>
                      </td>
                      <td>{item.category}</td>
                      <td>{item.createdByName}</td>
                      <td><PriorityBadge priority={item.priority} /></td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>{item.assignedToName || <span style={{ color: '#94A3B8' }}>Unassigned</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          <button onClick={() => openModal('details', item)} className="btn btn-secondary btn-sm">
                            View
                          </button>
                          <button onClick={() => openModal('assign', item)} className="btn btn-secondary btn-sm">
                            Assign
                          </button>
                          <button onClick={() => openModal('status', item)} className="btn btn-secondary btn-sm">
                            Status
                          </button>
                          {item.status !== 'RESOLVED' && item.status !== 'CLOSED' && (
                            <button onClick={() => openModal('resolve', item)} className="btn btn-success btn-sm">
                              Resolve
                            </button>
                          )}
                          {item.status !== 'CLOSED' && (
                            <button onClick={() => handleClose(item.id)} className="btn btn-danger btn-sm">
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.9rem', color: '#64748B' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Modals */}
      {activeModal && selectedComplaint && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '0.75rem', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#64748B" />
            </button>

            {modalError && <div className="alert alert-error">{modalError}</div>}

            {/* Assign Modal */}
            {activeModal === 'assign' && (
              <form onSubmit={handleAssign}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Assign Complaint #{selectedComplaint.referenceNumber}
                </h2>

                <div className="form-group">
                  <label className="form-label">Assign To Staff / Admin *</label>
                  <select className="form-select" required value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)}>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role}) - {u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assignment Note / Instructions</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Inspect the wiring in Lab 3 before end of day..."
                    value={assignRemarks}
                    onChange={(e) => setAssignRemarks(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submittingAction}>Confirm Assignment</button>
                </div>
              </form>
            )}

            {/* Status Modal */}
            {activeModal === 'status' && (
              <form onSubmit={handleStatusUpdate}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Update Status for #{selectedComplaint.referenceNumber}
                </h2>

                <div className="form-group">
                  <label className="form-label">New Status *</label>
                  <select className="form-select" required value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status Change Remarks</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Reason or notes for status update..."
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submittingAction}>Update Status</button>
                </div>
              </form>
            )}

            {/* Resolve Modal with MANDATORY AFTER photo */}
            {activeModal === 'resolve' && (
              <form onSubmit={handleResolve}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16A34A', marginBottom: '0.5rem' }}>
                  Resolve Complaint #{selectedComplaint.referenceNumber}
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
                  An <strong>AFTER (fixed) photo</strong> and <strong>resolution note</strong> are mandatory to complete resolution.
                </p>

                <div className="form-group">
                  <label className="form-label">Resolution Note *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    required
                    placeholder="e.g. Replaced bulb and fixed loose wiring."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">AFTER (Fixed) Photo *</label>
                  {afterPreview ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={afterPreview} alt="After preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '0.5rem' }} />
                      <button type="button" onClick={() => { setAfterImage(null); setAfterPreview(null); }} style={{ position: 'absolute', top: 4, right: 4, background: 'red', color: 'white', border: 'none', borderRadius: '50%', padding: '4px' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      required
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAfterImage(file);
                          setAfterPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-success" disabled={submittingAction}>
                    <CheckCircle size={16} /> Mark as RESOLVED
                  </button>
                </div>
              </form>
            )}

            {/* Details & History Modal */}
            {activeModal === 'details' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Complaint Details - #{selectedComplaint.referenceNumber}
                </h2>
                <p style={{ color: '#475569', marginBottom: '1rem' }}>{selectedComplaint.description}</p>
                <BeforeAfterImages beforeImage={selectedComplaint.beforeImagePath} afterImage={selectedComplaint.afterImagePath} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '1rem 0 0.5rem' }}>Status History Audit</h3>
                <StatusTimeline history={history} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
