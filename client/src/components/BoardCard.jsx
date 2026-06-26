import { Link } from 'react-router-dom';
import styles from './BoardCard.module.css';

export default function BoardCard({ board, onRename, onDelete }) {
  return (
    <div className={styles.card}>
      <Link to={`/boards/${board.id}`} className={styles.link}>
        <h3 className={styles.title}>{board.title}</h3>
        {board.description && (
          <p className={styles.description}>{board.description}</p>
        )}
        <p className={styles.meta}>
          {board._count?.tasks ?? 0} task{(board._count?.tasks ?? 0) !== 1 ? 's' : ''}
        </p>
      </Link>
      <div className={styles.actions}>
        <button className="btn btn-secondary" onClick={() => onRename(board)}>
          Rename
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(board)}>
          Delete
        </button>
      </div>
    </div>
  );
}
