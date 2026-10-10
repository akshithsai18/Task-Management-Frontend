import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, CircleAlert, CircleCheck, Clock3, ListTodo, Plus, Timer, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';
import { formatDate, daysUntil, getTaskStats, PriorityBadge, StatusBadge, TaskList } from '../components/TaskComponents.jsx';

const weekdayDate = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, loading, loadError, refreshTasks } = useTasks();
  const stats = getTaskStats(tasks);
  const completion = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const recent = [...tasks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
  const dueSoon = tasks.filter((task) => task.status !== 'COMPLETED' && daysUntil(task.dueDate) !== null && daysUntil(task.dueDate) >= 0 && daysUntil(task.dueDate) <= 7).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate))).slice(0, 4);
  const highCount = tasks.filter((task) => task.priority === 'HIGH').length;
  const mediumCount = tasks.filter((task) => task.priority === 'MEDIUM').length;
  const lowCount = tasks.filter((task) => task.priority === 'LOW').length;

  const metrics = [
    { label: 'Total tasks', value: stats.total, hint: 'Across your workspace', icon: ListTodo, tone: 'metric-blue' },
    { label: 'Pending', value: stats.pending, hint: 'Waiting for a first step', icon: Clock3, tone: 'metric-neutral' },
    { label: 'In progress', value: stats.inProgress, hint: 'Work in motion', icon: Timer, tone: 'metric-amber' },
    { label: 'Completed', value: stats.completed, hint: 'Things you finished', icon: CircleCheck, tone: 'metric-green' },
    { label: 'Overdue', value: stats.overdue, hint: 'Needs your attention', icon: CircleAlert, tone: 'metric-coral' },
  ];

  return <div className="page-stack">
    <div className="dashboard-welcome">
      <div><div className="eyebrow"><span className="eyebrow-dot" />YOUR OVERVIEW</div><h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'}<span className="welcome-period">.</span></h1><p>Here’s a little clarity for your day.</p></div>
      <div className="welcome-date"><span className="welcome-date-label">TODAY</span><strong>{weekdayDate.format(new Date())}</strong><Link to="/tasks/new" className="button button-primary"><Plus size={17} />Add new task</Link></div>
    </div>

    {loadError && <div className="page-error" role="alert"><CircleAlert size={18} /><span>{loadError}</span><button className="text-button" onClick={() => refreshTasks().catch(() => {})}>Retry</button></div>}

    <section className="metric-grid" aria-label="Task summary">
      {metrics.map(({ label, value, hint, icon: Icon, tone }) => <article className="metric-card" key={label}><div className={`metric-icon ${tone}`}><Icon size={19} /></div><div className="metric-label">{label}</div><div className="metric-value">{loading ? '—' : value}</div><div className="metric-hint">{hint}</div></article>)}
    </section>

    <div className="dashboard-grid">
      <section className="surface recent-surface">
        <div className="section-heading"><div><span className="section-overline">KEEP THE MOMENTUM</span><h2>Recent tasks</h2></div><Link className="text-link" to="/tasks">View all <ArrowRight size={15} /></Link></div>
        <TaskList tasks={recent} loading={loading} emptyTitle="Your first task starts here" emptyCopy="Capture what’s on your mind and give it a place." onRetry={loadError ? () => refreshTasks().catch(() => {}) : undefined} />
      </section>
      <aside className="dashboard-rail">
        <section className="surface progress-surface">
          <div className="section-heading"><div><span className="section-overline">A STEADY PACE</span><h2>Completion</h2></div><span className="progress-icon"><TrendingUp size={18} /></span></div>
          <div className="progress-ring-wrap"><div className="progress-ring" style={{ '--progress': `${completion}%` }}><div><strong>{loading ? '—' : `${completion}%`}</strong><span>complete</span></div></div></div>
          <div className="progress-copy"><span><Check size={15} />{stats.completed} of {stats.total} tasks done</span><strong>{stats.total - stats.completed} left</strong></div>
        </section>
        <section className="surface priority-surface">
          <div className="section-heading"><div><span className="section-overline">MAKE A CALL</span><h2>Priority mix</h2></div></div>
          <div className="priority-bars">
            {[['High', highCount, 'bar-high'], ['Medium', mediumCount, 'bar-medium'], ['Low', lowCount, 'bar-low']].map(([label, value, tone]) => <div className="priority-bar-row" key={label}><div className="priority-bar-label"><span>{label}</span><strong>{value}</strong></div><div className="priority-track"><span className={tone} style={{ width: `${tasks.length ? Math.max((value / tasks.length) * 100, value ? 7 : 0) : 0}%` }} /></div></div>)}
          </div>
        </section>
      </aside>
    </div>

    <section className="surface due-surface">
      <div className="section-heading"><div><span className="section-overline">COMING UP</span><h2>Due soon <span className="heading-count">{dueSoon.length}</span></h2></div><Link className="text-link" to="/tasks/pending">See pending <ArrowRight size={15} /></Link></div>
      {dueSoon.length ? <div className="due-list">{dueSoon.map((task) => <Link to={`/tasks/${task.id}`} className="due-item" key={task.id}><span className="due-date-block"><strong>{formatDate(task.dueDate, { day: '2-digit' })}</strong><small>{formatDate(task.dueDate, { month: 'short' }).toUpperCase()}</small></span><span className="due-item-copy"><strong>{task.title}</strong><small>{daysUntil(task.dueDate) === 0 ? 'Due today' : daysUntil(task.dueDate) === 1 ? 'Due tomorrow' : `Due ${formatDate(task.dueDate, { weekday: 'short' })}`}</small></span><PriorityBadge priority={task.priority} /><ArrowUpRight className="due-open" size={17} /></Link>)}</div> : <div className="due-empty"><span className="due-empty-check"><Check size={16} /></span><span>{loading ? 'Checking your deadlines...' : 'You’re clear for the week. Nice work.'}</span></div>}
    </section>
  </div>;
}
