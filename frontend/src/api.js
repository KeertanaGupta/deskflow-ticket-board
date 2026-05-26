const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.breached) params.append('breached', 'true');

  const query = params.toString();
  const url = `${API_BASE}/tickets${query ? '?' + query : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch tickets');
  }
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/tickets/stats`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch stats');
  }
  return res.json();
}

export async function createTicket(ticketData) {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create ticket');
  }
  return data;
}

export async function updateTicketStatus(id, status) {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update ticket');
  }
  return data;
}

export async function deleteTicket(id) {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete ticket');
  }
  return data;
}
