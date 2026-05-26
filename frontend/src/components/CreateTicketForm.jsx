import { useState } from 'react';

export default function CreateTicketForm({ onSubmit }) {
  const [form, setForm] = useState({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'low'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  function validate() {
    const errs = {};
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.customerEmail.trim()) {
      errs.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      errs.customerEmail = 'Enter a valid email';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setSuccess('');
    try {
      await onSubmit(form);
      setForm({ subject: '', description: '', customerEmail: '', priority: 'low' });
      setSuccess('Ticket created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setErrors({ form: err.message });
    }
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  return (
    <div className="create-ticket-form">
      <h3>Create New Ticket</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Brief summary of the issue"
          />
          {errors.subject && <span className="field-error">{errors.subject}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Detailed description"
            rows="3"
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="customerEmail">Customer Email</label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={form.customerEmail}
            onChange={handleChange}
            placeholder="customer@example.com"
          />
          {errors.customerEmail && <span className="field-error">{errors.customerEmail}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {errors.form && <p className="form-error">{errors.form}</p>}
        {success && <p className="form-success">{success}</p>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Ticket'}
        </button>
      </form>
    </div>
  );
}
