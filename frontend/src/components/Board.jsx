import Column from './Column';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

export default function Board({ tickets, onStatusChange, onDelete }) {
  const grouped = {};
  STATUSES.forEach(s => { grouped[s] = []; });
  tickets.forEach(t => {
    if (grouped[t.status]) {
      grouped[t.status].push(t);
    }
  });

  return (
    <div className="board">
      {STATUSES.map(status => (
        <Column
          key={status}
          status={status}
          tickets={grouped[status]}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
