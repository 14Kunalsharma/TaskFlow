import { useEffect, useState } from 'react';
import { boardsApi } from '../api';
import BoardCard from '../components/BoardCard';
import ConfirmDialog from '../components/ConfirmDialog';
import DashboardStats from '../components/DashboardStats';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchBoards = async () => {
    try {
      const res = await boardsApi.list();
      setBoards(res.data.data.boards);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const openCreate = () => {
    setForm({ title: '', description: '' });
    setModal('create');
  };

  const openRename = (board) => {
    setForm({ title: board.title, description: board.description || '' });
    setModal({ type: 'rename', board });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    try {
      if (modal === 'create') {
        await boardsApi.create(form);
      } else {
        await boardsApi.update(modal.board.id, form);
      }
      setModal(null);
      await fetchBoards();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await boardsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchBoards();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner center />;

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>My Boards</h1>
          <button className="btn btn-primary" onClick={openCreate}>
            + New Board
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {boards.length > 0 && <DashboardStats boards={boards} />}

        {boards.length === 0 ? (
          <EmptyState
            title="No boards yet"
            text="Create your first board to start organizing tasks."
            action={
              <button className="btn btn-primary" onClick={openCreate}>
                Create Board
              </button>
            }
          />
        ) : (
          <div className={styles.grid}>
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onRename={openRename}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

        {modal && (
          <div className={styles.modalOverlay} onClick={() => setModal(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>
                {modal === 'create' ? 'Create Board' : 'Rename Board'}
              </h2>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label htmlFor="board-title">Title</label>
                  <input
                    id="board-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="board-desc">Description</label>
                  <textarea
                    id="board-desc"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="Delete Board"
            message={`Delete "${deleteTarget.title}" and all its tasks? This cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={submitting}
          />
        )}
      </div>
    </div>
  );
}
