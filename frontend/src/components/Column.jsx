import TicketCard from './TicketCard';

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

const STATUS_COLORS = {
  open: '#3498db',
  in_progress: '#f39c12',
  resolved: '#27ae60',
  closed: '#95a5a6'
};

export default function Column({ status, tickets, onStatusChange, onDelete }) {
  return (
    <div className="column">
      <div className="column-header" style={{ borderTopColor: STATUS_COLORS[status] }}>
        <h3>{STATUS_LABELS[status]}</h3>
        <span className="column-count">{tickets.length}</span>
      </div>
      <div className="column-body">
        {tickets.length === 0 && (
          <p className="column-empty">No tickets</p>
        )}
        {tickets.map(ticket => (
          <TicketCard
            key={ticket._id}
            ticket={ticket}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
