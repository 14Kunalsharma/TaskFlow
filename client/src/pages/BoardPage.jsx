import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { boardsApi, tasksApi } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import KanbanColumn from '../components/KanbanColumn';
import Spinner from '../components/Spinner';
import TaskFormModal from '../components/TaskFormModal';
import styles from './BoardPage.module.css';

const COLUMNS = [
  { title: 'To Do', status: 'todo' },
  { title: 'In Progress', status: 'in_progress' },
  { title: 'Done', status: 'done' },
];

export default function BoardPage() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskModal, setTaskModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('none');

  const fetchBoard = async () => {
    try {
      const res = await boardsApi.get(id);
      setBoard(res.data.data.board);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [id]);

  const filteredTasks = useMemo(() => {
    if (!board?.tasks) return [];

    let tasks = [...board.tasks];

    if (priorityFilter !== 'all') {
      tasks = tasks.filter((t) => t.priority === priorityFilter);
    }

    if (sortBy === 'dueDate') {
      tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortBy === 'priority') {
      const order = { high: 0, med: 1, low: 2 };
      tasks.sort((a, b) => order[a.priority] - order[b.priority]);
    }

    return tasks;
  }, [board?.tasks, priorityFilter, sortBy]);

  const handleSaveTask = async (data) => {
    setSubmitting(true);
    try {
      if (taskModal?.id) {
        await tasksApi.update(taskModal.id, data);
      } else {
        await tasksApi.create(id, data);
      }
      setTaskModal(null);
      await fetchBoard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMove = async (task, status) => {
    try {
      await tasksApi.update(task.id, { status });
      await fetchBoard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await tasksApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchBoard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner center />;

  if (error && !board) {
    return (
      <div className="page container">
        <div className="alert alert-error">{error}</div>
        <Link to="/" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <Link to="/" className={styles.back}>
            ← Back to Dashboard
          </Link>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>{board.title}</h1>
            <button className="btn btn-primary" onClick={() => setTaskModal({})}>
              + Add Task
            </button>
          </div>

          {board.description && (
            <p className={styles.description}>{board.description}</p>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className={styles.toolbar}>
          <label>
            Priority:{' '}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="med">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>

          <label>
            Sort:{' '}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="none">Default</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </label>
        </div>

        <div className={styles.board}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              title={col.title}
              status={col.status}
              tasks={filteredTasks}
              onEdit={setTaskModal}
              onDelete={setDeleteTarget}
              onMove={handleMove}
            />
          ))}
        </div>

        {taskModal && (
          <TaskFormModal
            task={taskModal.id ? taskModal : null}
            onSave={handleSaveTask}
            onClose={() => setTaskModal(null)}
            loading={submitting}
          />
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="Delete Task"
            message={`Delete "${deleteTarget.title}"?`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={submitting}
          />
        )}
      </div>
    </div>
  );
}
