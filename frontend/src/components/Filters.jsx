export default function Filters({ filters, onChange }) {
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    onChange({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  }

  return (
    <div className="filters">
      <div className="filter-group">
        <label htmlFor="filter-priority">Priority</label>
        <select
          id="filter-priority"
          name="priority"
          value={filters.priority}
          onChange={handleChange}
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="filter-group filter-checkbox">
        <label htmlFor="filter-breached">
          <input
            type="checkbox"
            id="filter-breached"
            name="breached"
            checked={filters.breached}
            onChange={handleChange}
          />
          SLA Breached Only
        </label>
      </div>
    </div>
  );
}
