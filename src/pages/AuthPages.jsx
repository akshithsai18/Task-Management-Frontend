import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckSquare2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { API_MODE, errorMessage } from '../api/axiosClient.js';

export default function AuthPages({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  function change(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [event.target.name]: '' }));
  }

  function validate() {
    const next = {};
    if (isRegister && !values.name.trim()) next.name = 'Enter your full name.';
    if (!values.email.trim()) next.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.';
    if (!values.password) next.password = 'Enter your password.';
    else if (isRegister && (values.password.length < 12 || values.password.length > 72 || !/(?=.*[A-Za-z])(?=.*\d)/.test(values.password))) next.password = 'Use 12–72 characters and include a letter and a number.';
    if (isRegister && values.password !== values.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;
    setBusy(true);
    try {
      if (isRegister) {
        await register({ name: values.name.trim(), email: values.email.trim(), password: values.password });
        setSuccess('Your account is ready. Sign in to continue.');
        window.setTimeout(() => navigate('/login', { replace: true, state: { message: 'Account created. You can sign in now.' } }), 650);
      } else {
        await login({ email: values.email.trim(), password: values.password });
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <div className="auth-brand"><Link className="brand" to="/login"><span className="brand-mark"><CheckSquare2 size={20} strokeWidth={2.5} /></span><span>daymark<span className="brand-period">.</span></span></Link><span className="auth-brand-note">Make space for what matters.</span></div>
    <div className="auth-layout">
      <section className="auth-aside">
        <div className="auth-aside-top"><span className="eyebrow"><span className="eyebrow-dot" />YOUR WORK, IN RHYTHM</span>
          <h1>Clear your mind.<br /><em>Move things forward.</em></h1>
          <p>A calmer way to see what needs doing, what’s already moving, and what you can let go of.</p>
        </div>
        <div className="auth-art" aria-hidden="true">
          <div className="art-orbit art-orbit-one" /><div className="art-orbit art-orbit-two" />
          <div className="art-note art-note-main"><span className="art-check"><CheckSquare2 size={17} /></span><span><strong>Design review</strong><small>Moving forward</small></span><span className="art-note-time">10:30</span></div>
          <div className="art-note art-note-small"><span className="art-check art-check-green">✓</span><span><strong>Weekly planning</strong><small>Completed</small></span></div>
          <div className="art-date"><strong>12</strong><span>THU</span></div>
          <span className="art-stamp">DAY<br />MARK</span>
        </div>
        <div className="auth-aside-bottom"><span>01 — PLAN WITH INTENTION</span><span>02 — FINISH WITH CLARITY</span></div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form-heading"><span className="form-kicker">{isRegister ? 'A FRESH START' : 'WELCOME BACK'}</span><h2>{isRegister ? 'Create your account' : 'Good to see you again'}</h2><p>{isRegister ? 'Set up your workspace in just a moment.' : 'Sign in to pick up where you left off.'}</p></div>
        {location.state?.message && !success && <div className="inline-message success-message" role="status">{location.state.message}</div>}
        {error && <div className="inline-message error-message" role="alert">{error}</div>}
        {success && <div className="inline-message success-message" role="status">{success}</div>}
        <form className="auth-form" onSubmit={submit} noValidate>
          {isRegister && <label className="field-wrap"><span>Full name</span><div className={`input-shell ${fieldErrors.name ? 'input-error' : ''}`}><UserRound size={17} /><input name="name" type="text" autoComplete="name" placeholder="Alex Morgan" value={values.name} onChange={change} aria-invalid={Boolean(fieldErrors.name)} /></div>{fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}</label>}
          <label className="field-wrap"><span>Email address</span><div className={`input-shell ${fieldErrors.email ? 'input-error' : ''}`}><Mail size={17} /><input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={change} aria-invalid={Boolean(fieldErrors.email)} /></div>{fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}</label>
          <label className="field-wrap"><span>Password</span><div className={`input-shell ${fieldErrors.password ? 'input-error' : ''}`}><LockKeyhole size={17} /><input name="password" type={visible ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? '12+ characters, letter and number' : 'Enter your password'} value={values.password} onChange={change} aria-invalid={Boolean(fieldErrors.password)} /><button className="input-icon-button" type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible((current) => !current)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}</label>
          {isRegister && <label className="field-wrap"><span>Confirm password</span><div className={`input-shell ${fieldErrors.confirmPassword ? 'input-error' : ''}`}><LockKeyhole size={17} /><input name="confirmPassword" type={visible ? 'text' : 'password'} autoComplete="new-password" placeholder="Enter your password again" value={values.confirmPassword} onChange={change} aria-invalid={Boolean(fieldErrors.confirmPassword)} /></div>{fieldErrors.confirmPassword && <small className="field-error">{fieldErrors.confirmPassword}</small>}</label>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? <><span className="button-spinner" />{isRegister ? 'Creating account...' : 'Signing in...'}</> : <>{isRegister ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></>}</button>
        </form>
        {!isRegister && API_MODE === 'mock' && <div className="demo-hint"><strong>Demo account</strong><span>alex.morgan@example.com</span><span>Taskflow123!</span></div>}
        <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to Daymark?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
        <p className="auth-legal">By continuing, you agree to keep your work thoughtful and your account secure.</p>
      </section>
    </div>
    <footer className="auth-footer"><span>© 2026 Daymark</span><span>Designed for focused days</span><span>Privacy&nbsp; · &nbsp;Terms</span></footer>
  </main>;
}
