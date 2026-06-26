import styles from './EmptyState.module.css';

export default function EmptyState({ icon = '📋', title, text, action }) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{text}</p>
      {action}
    </div>
  );
}
