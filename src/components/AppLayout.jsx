import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, Bell, CheckSquare2, ChevronDown, CircleCheck, CircleUserRound, LayoutDashboard, ListTodo, LogOut, Menu, Plus, Search, Settings2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { API_MODE } from '../api/axiosClient.js';
import { useToast } from './ToastProvider.jsx';

const primaryLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'All tasks', icon: ListTodo },
  { to: '/tasks/pending', label: 'My pending', icon: Activity },
  { to: '/tasks/completed', label: 'Completed', icon: CircleCheck },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const notify = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchValue = searchParams.get('q') || '';

  function searchTasks(event) {
    event.preventDefault();
    const query = event.currentTarget.elements.search.value.trim();
    navigate(query ? `/tasks?q=${encodeURIComponent(query)}` : '/tasks');
    setMenuOpen(false);
  }

  function updateSearch(event) {
    const query = event.target.value;
    const next = new URLSearchParams(searchParams);
    if (query) next.set('q', query); else next.delete('q');
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="app-frame">
      {menuOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <Link className="brand" to="/dashboard" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><CheckSquare2 size={20} strokeWidth={2.5} /></span>
          <span>daymark<span className="brand-period">.</span></span>
        </Link>
        <div className="workspace-switcher">
          <span className="workspace-avatar">{(user?.name || 'A').slice(0, 1).toUpperCase()}</span>
          <span className="workspace-copy"><strong>Personal space</strong><small>Free workspace</small></span>
          <ChevronDown size={15} />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          {primaryLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <p className="nav-label nav-label-later">ACCOUNT</p>
        <nav className="side-nav" aria-label="Account navigation">
          <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
            <Settings2 size={18} strokeWidth={1.9} /><span>Profile settings</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="focus-note"><span className="focus-spark">✳</span><strong>A little progress adds up.</strong><small>Keep your day moving, one task at a time.</small></div>
          <div className="mode-indicator"><span className={`mode-dot ${API_MODE === 'mock' ? 'mode-dot-demo' : ''}`} />{API_MODE === 'mock' ? 'Demo workspace' : 'Connected to API'}</div>
          <button className="nav-link logout-link" onClick={logout}><LogOut size={18} /><span>Log out</span></button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <form className="global-search" onSubmit={searchTasks} role="search">
              <Search size={17} />
              <input name="search" aria-label="Search tasks" placeholder="Search your tasks..." value={searchValue} onChange={updateSearch} />
              <kbd>/</kbd>
            </form>
          </div>
          <div className="topbar-actions">
            <button className="icon-button notification-button" type="button" title="Notifications" aria-label="Notifications: you are all caught up" onClick={() => notify('You are all caught up.')}>
              <Bell size={19} /><span className="notification-dot" />
            </button>
            <span className="topbar-divider" />
            <div className="profile-control">
              <button className="profile-trigger" type="button" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}>
                <span className="avatar avatar-small">{(user?.name || 'A').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
                <span className="profile-trigger-copy"><strong>{user?.name || 'Account'}</strong><small>Personal</small></span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && <div className="profile-menu">
                <Link to="/profile" onClick={() => setProfileOpen(false)}><CircleUserRound size={16} />Account settings</Link>
                <button onClick={logout}><LogOut size={16} />Log out</button>
              </div>}
            </div>
            <Link className="button button-primary topbar-create" to="/tasks/new"><Plus size={17} />New task</Link>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
