import styles from './DashboardStats.module.css';

export default function DashboardStats({ boards }) {
  const totalTasks = boards.reduce((sum, b) => sum + (b._count?.tasks ?? 0), 0);

  return (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <div className={styles.value}>{boards.length}</div>
        <div className={styles.label}>Boards</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.value}>{totalTasks}</div>
        <div className={styles.label}>Total Tasks</div>
      </div>
    </div>
  );
}
