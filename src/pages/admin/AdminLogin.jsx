import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import './AdminLogin.css';

const MAX_ATTEMPTS = 5;
const LOCK_MS = 30000;

export default function AdminLogin() {
  const { signIn, session } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (session) navigate('/admin/productos', { replace: true });
  }, [session, navigate]);

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setSecondsLeft(0);
        setFailCount(0);
      } else {
        setSecondsLeft(remaining);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const locked = !!lockedUntil && secondsLeft > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (locked || submitting) return;
    setSubmitting(true);
    setError('');
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (signInError) {
      const nextCount = failCount + 1;
      setFailCount(nextCount);
      setError('Email o contraseña incorrectos.');
      if (nextCount >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCK_MS);
      }
      return;
    }
    navigate('/admin/productos', { replace: true });
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-brand">
          <span className="admin-login-name">DON TEÓFILO</span>
          <span className="admin-login-tag">Panel de administración</span>
        </div>

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            disabled={locked}
          />
        </label>

        <label className="admin-field">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={locked}
          />
        </label>

        {error && !locked && <p className="admin-login-error">{error}</p>}
        {locked && (
          <p className="admin-login-error">
            Demasiados intentos. Esperá {secondsLeft}s antes de volver a intentar.
          </p>
        )}

        <button type="submit" className="admin-login-submit" disabled={submitting || locked}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
