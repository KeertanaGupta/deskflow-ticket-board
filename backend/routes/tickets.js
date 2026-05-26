const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// Valid status transitions
const VALID_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['in_progress', 'closed'],
  closed: []
};

// SLA targets in minutes
const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320
};

// Helper: add computed fields to a ticket object
function addComputedFields(ticket) {
  const obj = ticket.toObject({ virtuals: true });
  return obj;
}

// POST /tickets — Create a new ticket
router.post('/', async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;

    // Validate required fields
    const errors = [];
    if (!subject || !subject.trim()) errors.push('Subject is required');
    if (!description || !description.trim()) errors.push('Description is required');
    if (!customerEmail || !customerEmail.trim()) errors.push('Customer email is required');
    if (!priority) errors.push('Priority is required');

    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errors.push('Please provide a valid email address');
    }

    if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      errors.push('Priority must be one of: low, medium, high, urgent');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('. ') });
    }

    const ticket = new Ticket({ subject, description, customerEmail, priority });
    await ticket.save();
    res.status(201).json(addComputedFields(ticket));
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /tickets — List tickets with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    const filter = {};

    if (status) {
      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status filter' });
      }
      filter.status = status;
    }

    if (priority) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority filter' });
      }
      filter.priority = priority;
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    let results = tickets.map(t => addComputedFields(t));

    // Filter by SLA breached if requested
    if (breached === 'true') {
      results = results.filter(t => t.slaBreached === true);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /tickets/stats — Aggregate stats
router.get('/stats', async (req, res) => {
  try {
    // Counts per status
    const statusCounts = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Counts per priority
    const priorityCounts = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // SLA breached count — compute in memory for tickets that are not closed
    const openTickets = await Ticket.find({ status: { $nin: ['closed'] } });
    let breachedCount = 0;
    openTickets.forEach(t => {
      const obj = addComputedFields(t);
      if (obj.slaBreached) breachedCount++;
    });

    const statusMap = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    statusCounts.forEach(s => { statusMap[s._id] = s.count; });

    const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
    priorityCounts.forEach(p => { priorityMap[p._id] = p.count; });

    res.json({
      byStatus: statusMap,
      byPriority: priorityMap,
      breachedCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /tickets/:id — Update ticket status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: open, in_progress, resolved, closed' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const currentStatus = ticket.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from "${currentStatus}" to "${status}". Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none'}`
      });
    }

    ticket.status = status;

    // Handle resolvedAt
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    } else if (currentStatus === 'resolved' && status === 'in_progress') {
      ticket.resolvedAt = null;
    }

    await ticket.save();
    res.json(addComputedFields(ticket));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /tickets/:id — Delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
