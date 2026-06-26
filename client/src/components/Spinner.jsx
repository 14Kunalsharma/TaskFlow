import styles from './Spinner.module.css';

export default function Spinner({ small, center }) {
  const className = `${styles.spinner} ${small ? styles.spinnerSm : ''}`;
  if (center) {
    return (
      <div className={styles.center}>
        <div className={className} />
      </div>
    );
  }
  return <div className={className} />;
}
