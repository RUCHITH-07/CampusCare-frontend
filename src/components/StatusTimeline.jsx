import React from 'react';

const StatusTimeline = ({ history }) => {
  if (!history || history.length === 0) {
    return <p style={{ color: '#64748B' }}>No status changes recorded yet.</p>;
  }

  return (
    <div className="timeline">
      {history.map((item) => (
        <div key={item.id} className="timeline-item">
          <div className="timeline-dot" />
          <div className="timeline-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: '600', color: '#0F172A' }}>
                {item.oldStatus ? `${item.oldStatus} ➔ ${item.newStatus}` : item.newStatus}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                {new Date(item.changedAt).toLocaleString()}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0.25rem 0' }}>{item.remarks}</p>
            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>By: {item.changedBy}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusTimeline;
