import styles from './TaskCard.module.css';

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const NEXT_STATUS = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isOverdue(task) {
  if (!task.dueDate || task.status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
}

export default function TaskCard({ task, onEdit, onDelete, onMove }) {
  const overdue = isOverdue(task);
  const nextStatus = NEXT_STATUS[task.status];

  return (
    <div className={`${styles.card} ${overdue ? styles.overdue : ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>{task.title}</span>
        <span className={`${styles.badge} ${styles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className={styles.meta}>{task.description}</p>
      )}

      <div className={styles.meta}>
        {task.dueDate && (
          <span className={overdue ? styles.overdueText : ''}>
            Due: {formatDate(task.dueDate)}
            {overdue && ' (Overdue)'}
          </span>
        )}
        {task.estimatedEffort && (
          <span>{task.dueDate ? ' · ' : ''}Effort: {task.estimatedEffort}</span>
        )}
      </div>

      <div className={styles.actions}>
        {nextStatus && (
          <button
            className="btn btn-secondary"
            onClick={() => onMove(task, nextStatus)}
          >
            → {STATUS_LABELS[nextStatus]}
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="btn btn-ghost" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </div>
  );
}
