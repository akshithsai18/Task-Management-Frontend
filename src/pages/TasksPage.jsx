import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDownUp, CircleAlert, FilterX, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';
import { TaskList } from '../components/TaskComponents.jsx';

const titles = { all: ['All tasks', 'Everything you’re working on, in one place.'], pending: ['My pending tasks', 'Keep an eye on what still needs a first step.'], completed: ['Completed tasks', 'A record of what you’ve moved forward.'] };

export default function TasksPage({ view }) {
  const { tasks, loading, loadError, refreshTasks } = useTasks();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const query = searchParams.get('q') || '';
  const [title, subtitle] = titles[view];

  const visibleTasks = useMemo(() => {
    let result = [...tasks];
    if (view === 'pending') result = result.filter((task) => task.status === 'PENDING');
    if (view === 'completed') result = result.filter((task) => task.status === 'COMPLETED');
    if (status) result = result.filter((task) => task.status === status);
    if (priority) result = result.filter((task) => task.priority === priority);
    if (query.trim()) {
      const normalized = query.trim().toLowerCase();
      result = result.filter((task) => `${task.title} ${task.description || ''}`.toLowerCase().includes(normalized));
    }
    result.sort((a, b) => {
      if (sortBy === 'priority') return ['HIGH', 'MEDIUM', 'LOW'].indexOf(a.priority) - ['HIGH', 'MEDIUM', 'LOW'].indexOf(b.priority);
      if (sortBy === 'createdAt') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999'));
    });
    return result;
  }, [tasks, view, status, priority, query, sortBy]);

  function clearFilters() {
    setStatus('');
    setPriority('');
    setSortBy('dueDate');
    setSearchParams({}, { replace: true });
  }
  const hasFilters = Boolean(query || status || priority || sortBy !== 'dueDate');

  return <div className="page-stack">
    <div className="page-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" />YOUR WORKSPACE</div><h1>{title}<span className="welcome-period">.</span></h1><p>{subtitle}</p></div><Link className="button button-primary" to="/tasks/new"><Plus size={17} />Create task</Link></div>
    {loadError && <div className="page-error" role="alert"><CircleAlert size={18} /><span>{loadError}</span><button className="text-button" onClick={() => refreshTasks().catch(() => {})}>Retry</button></div>}
    <section className="surface tasks-surface">
      <div className="list-toolbar">
        <div className="list-results"><strong>{visibleTasks.length}</strong> {visibleTasks.length === 1 ? 'task' : 'tasks'}<span className="toolbar-divider" />{loading ? 'Syncing...' : `${tasks.length} total`}</div>
        <div className="filter-controls">
          <label className="filter-search"><Search size={16} /><input aria-label="Search tasks" placeholder="Find a task" value={query} onChange={(event) => { const next = new URLSearchParams(searchParams); if (event.target.value) next.set('q', event.target.value); else next.delete('q'); setSearchParams(next, { replace: true }); }} /></label>
          <label className="select-wrap"><span className="sr-only">Filter by status</span><SlidersHorizontal size={15} /><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Any status</option><option value="PENDING">Pending</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></label>
          <label className="select-wrap"><span className="sr-only">Filter by priority</span><select aria-label="Filter by priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="">Any priority</option><option value="HIGH">High priority</option><option value="MEDIUM">Medium priority</option><option value="LOW">Low priority</option></select></label>
          <label className="select-wrap sort-select"><ArrowDownUp size={15} /><select aria-label="Sort tasks" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="dueDate">Due date</option><option value="createdAt">Recently created</option><option value="priority">Priority</option></select></label>
          {hasFilters && <button className="clear-filter" type="button" onClick={clearFilters}><FilterX size={15} />Clear</button>}
        </div>
      </div>
      <div className="task-table-head"><span>Task</span><span>Status</span><span>Priority</span><span>Due date</span><span className="sr-only">Actions</span></div>
      <TaskList tasks={visibleTasks} loading={loading} emptyTitle={hasFilters ? 'No tasks match those filters' : 'Nothing to show here yet'} emptyCopy={hasFilters ? 'Try adjusting your search or clearing a filter.' : view === 'completed' ? 'Completed tasks will appear here.' : 'Create a task to get your list started.'} onRetry={loadError ? () => refreshTasks().catch(() => {}) : undefined} />
    </section>
  </div>;
}
