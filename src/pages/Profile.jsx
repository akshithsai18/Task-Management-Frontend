import { Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { API_MODE } from '../api/axiosClient.js';

export default function Profile() {
  const { user, logout } = useAuth();
  const initials = (user?.name || 'A').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return <div className="page-stack profile-page">
    <div className="page-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" />YOUR ACCOUNT</div><h1>Profile settings<span className="welcome-period">.</span></h1><p>Your personal details and workspace access.</p></div></div>
    <section className="surface profile-card">
      <div className="profile-card-banner"><span className="profile-banner-mark">D.</span><div className="avatar profile-large-avatar">{initials}</div></div>
      <div className="profile-card-body"><div className="profile-name-block"><span className="section-overline">PERSONAL PROFILE</span><h2>{user?.name || 'Account holder'}</h2><p>{user?.email}</p></div>
        <div className="profile-info-grid"><div className="profile-info"><span className="profile-info-icon"><UserRound size={18} /></span><div><small>FULL NAME</small><strong>{user?.name || 'Not provided'}</strong></div></div><div className="profile-info"><span className="profile-info-icon"><Mail size={18} /></span><div><small>EMAIL ADDRESS</small><strong>{user?.email || 'Not provided'}</strong></div></div><div className="profile-info"><span className="profile-info-icon"><ShieldCheck size={18} /></span><div><small>CONNECTION</small><strong>{API_MODE === 'mock' ? 'Local demo account' : 'Spring Boot API'}</strong></div></div></div>
        <div className="profile-note"><ShieldCheck size={18} /><span><strong>Account details are managed securely.</strong><small>Profile updates aren’t enabled because the current API contract does not include an update endpoint.</small></span></div>
        <div className="profile-actions"><span>Signed in as <strong>{user?.email}</strong></span><button className="button button-secondary" onClick={logout}>Sign out</button></div>
      </div>
    </section>
  </div>;
}
