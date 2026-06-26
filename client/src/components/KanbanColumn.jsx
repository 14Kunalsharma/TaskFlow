import TaskCard from './TaskCard';
import styles from './KanbanColumn.module.css';

export default function KanbanColumn({ title, status, tasks, onEdit, onDelete, onMove }) {
  const columnTasks = tasks.filter((t) => t.status === status);

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.count}>{columnTasks.length}</span>
      </div>

      {columnTasks.length === 0 ? (
        <p className={styles.empty}>No tasks</p>
      ) : (
        columnTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))
      )}
    </div>
  );
}
