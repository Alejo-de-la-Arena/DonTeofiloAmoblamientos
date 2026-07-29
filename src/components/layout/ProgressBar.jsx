import './ProgressBar.css';

export default function ProgressBar({ progress }) {
  return <div className="progress-bar" style={{ width: `${progress}%` }} />;
}
