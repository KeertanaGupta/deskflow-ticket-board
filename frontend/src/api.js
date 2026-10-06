const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Shared request helper.
// - Turns network failures (server down, CORS, offline) into a readable message.
// - Copes with error responses that are not JSON (e.g. an HTML 502 page from the host).
async function request(path, options = {}, fallbackMessage = 'Request failed') {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error('Cannot reach the DeskFlow server. Please check your connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Response body was empty or not JSON
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `${fallbackMessage} (HTTP ${res.status})`);
  }
  return data;
}

export function fetchTickets(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.breached) params.append('breached', 'true');

  const query = params.toString();
  return request(`/tickets${query ? '?' + query : ''}`, {}, 'Failed to fetch tickets');
}

export function fetchStats() {
  return request('/tickets/stats', {}, 'Failed to fetch stats');
}

export function createTicket(ticketData) {
  return request('/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  }, 'Failed to create ticket');
}

export function updateTicketStatus(id, status) {
  return request(`/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }, 'Failed to update ticket');
}

export function deleteTicket(id) {
  return request(`/tickets/${id}`, { method: 'DELETE' }, 'Failed to delete ticket');
}
