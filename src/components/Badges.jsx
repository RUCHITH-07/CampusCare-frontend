import React from 'react';

export const StatusBadge = ({ status }) => {
  const displayStatus = status ? status.replace('_', ' ') : 'UNKNOWN';
  return <span className={`badge badge-${status}`}>{displayStatus}</span>;
};

export const PriorityBadge = ({ priority }) => {
  return <span className={`badge priority-${priority}`}>{priority}</span>;
};
