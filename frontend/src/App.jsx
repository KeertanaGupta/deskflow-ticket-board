import { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import CreateTicketForm from './components/CreateTicketForm';
import Filters from './components/Filters';
import StatsStrip from './components/StatsStrip';
import { fetchTickets, fetchStats, createTicket, updateTicketStatus, deleteTicket } from './api';
import './App.css';

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ priority: '', breached: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const filterParams = {};
      if (filters.priority) filterParams.priority = filters.priority;
      if (filters.breached) filterParams.breached = true;

      const [ticketData, statsData] = await Promise.all([
        fetchTickets(filterParams),
        fetchStats()
      ]);
      setTickets(ticketData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreateTicket(ticketData) {
    await createTicket(ticketData);
    await loadData();
  }

  async function handleStatusChange(id, newStatus) {
    await updateTicketStatus(id, newStatus);
    await loadData();
  }

  async function handleDelete(id) {
    await deleteTicket(id);
    await loadData();
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>DeskFlow</h1>
          <p className="header-subtitle">Support Ticket Triage Board</p>
        </div>
        <button
          className="new-ticket-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Close Form' : '+ New Ticket'}
        </button>
      </header>

      <StatsStrip stats={stats} />
      <Filters filters={filters} onChange={setFilters} />

      {error && <div className="app-error">{error}</div>}

      <div className="main-content">
        <div className={`board-container ${showForm ? 'with-sidebar' : ''}`}>
          {loading ? (
            <div className="loading">Loading tickets...</div>
          ) : (
            <Board
              tickets={tickets}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          )}
        </div>

        {showForm && (
          <div className="sidebar">
            <CreateTicketForm onSubmit={handleCreateTicket} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
