import { useState } from 'react';

const VALID_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['in_progress', 'closed'],
  closed: []
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

const PRIORITY_COLORS = {
  urgent: '#c0392b',
  high: '#e67e22',
  medium: '#2980b9',
  low: '#7f8c8d'
};

function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

export default function TicketCard({ ticket, onStatusChange, onDelete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const transitions = VALID_TRANSITIONS[ticket.status] || [];

  async function handleTransition(newStatus) {
    setLoading(true);
    setError('');
    try {
      await onStatusChange(ticket._id, newStatus);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this ticket?')) return;
    setLoading(true);
    try {
      await onDelete(ticket._id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className={`ticket-card ${ticket.slaBreached ? 'sla-breached' : ''}`}>
      <div className="ticket-header">
        <span
          className="priority-badge"
          style={{ backgroundColor: PRIORITY_COLORS[ticket.priority] }}
        >
          {ticket.priority}
        </span>
        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={loading}
          title="Delete ticket"
        >
          ×
        </button>
      </div>

      <h4 className="ticket-subject">{ticket.subject}</h4>
      <p className="ticket-description">{ticket.description}</p>
      <p className="ticket-email">{ticket.customerEmail}</p>

      <div className="ticket-meta">
        <span className="ticket-age" title="Time since creation">
          ⏱ {formatAge(ticket.ageMinutes)}
        </span>
        {ticket.slaBreached && (
          <span className="sla-badge">SLA Breached</span>
        )}
      </div>

      {error && <p className="ticket-error">{error}</p>}

      {transitions.length > 0 && (
        <div className="ticket-actions">
          {transitions.map(status => (
            <button
              key={status}
              className="transition-btn"
              onClick={() => handleTransition(status)}
              disabled={loading}
            >
              → {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
