import { useEffect, useState } from 'react';
import { aiApi } from '../api';
import Spinner from './Spinner';
import styles from './TaskFormModal.module.css';

const emptyForm = {
  title: '',
  description: '',
  priority: 'med',
  dueDate: '',
  estimatedEffort: '',
  status: 'todo',
};

export default function TaskFormModal({ task, onSave, onClose, loading }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'med',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedEffort: task.estimatedEffort || '',
        status: task.status || 'todo',
      });
    } else {
      setForm(emptyForm);
    }
  }, [task]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    onSave({
      ...form,
      dueDate: form.dueDate || null,
      estimatedEffort: form.estimatedEffort || null,
    });
  };

  const handleSuggest = async () => {
    if (!form.title.trim()) {
      setError('Enter a title before requesting an estimate');
      return;
    }
    setAiLoading(true);
    setError('');
    try {
      const res = await aiApi.suggestEstimate({
        title: form.title,
        description: form.description,
      });
      setSuggestion(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const acceptSuggestion = () => {
    if (!suggestion) return;
    setForm((prev) => ({
      ...prev,
      estimatedEffort: suggestion.effort,
      dueDate: suggestion.suggestedDueDate,
    }));
    setSuggestion(null);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Task title"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional details"
            />
          </div>

          <div className={styles.row}>
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {task && (
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
          </div>

          <div className={styles.row}>
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="estimatedEffort">Effort Estimate</label>
              <input
                id="estimatedEffort"
                name="estimatedEffort"
                value={form.estimatedEffort}
                onChange={handleChange}
                placeholder="e.g. M (4-8 hours)"
              />
            </div>
          </div>

          <div className={styles.aiSection}>
            <div className={styles.aiHeader}>
              <span>AI Assist</span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSuggest}
                disabled={aiLoading}
              >
                {aiLoading ? <Spinner small /> : 'Suggest estimate'}
              </button>
            </div>

            {suggestion && (
              <>
                <div className={styles.aiSuggestion}>
                  <p>
                    <strong>Effort:</strong> {suggestion.effort}
                  </p>
                  <p>
                    <strong>Due date:</strong> {suggestion.suggestedDueDate}
                  </p>
                  <p>{suggestion.reasoning}</p>
                  {suggestion.source === 'mock' && (
                    <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>
                      Using fallback estimate (AI unavailable)
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: '0.75rem' }}
                  onClick={acceptSuggestion}
                >
                  Accept suggestion
                </button>
              </>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
