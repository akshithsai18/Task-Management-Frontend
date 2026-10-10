import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Clock3, Pencil, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';
import { useToast } from './ToastProvider.jsx';

export function StatusBadge({ status }) {
  const labels = { PENDING: 'Pending', IN_PROGRESS: 'In progress', COMPLETED: 'Completed' };
  return <span className={`status-badge status-${status?.toLowerCase() || 'pending'}`}><span />{labels[status] || status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`priority-label priority-${priority?.toLowerCase() || 'medium'}`}><span className="priority-dash" />{priority?.charAt(0) + priority?.slice(1).toLowerCase()}</span>;
}

export function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return 'No due date';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return new Intl.DateTimeFormat('en', options).format(date);
}

export function daysUntil(value) {
  if (!value) return null;
  const due = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / 86400000);
}

export function TaskList({ tasks, loading = false, emptyTitle = 'Nothing on your list yet', emptyCopy = 'Add a task to make a little room for progress.', onRetry }) {
  const { updateTask, deleteTask } = useTasks();
  const notify = useToast();

  async function complete(task) {
    try {
      const status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await updateTask(task.id, { ...task, status });
      notify(status === 'COMPLETED' ? 'Task marked complete.' : 'Task reopened.');
    } catch (error) { notify(error.userMessage || error.message, 'error'); }
  }

  async function remove(task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try {
      await deleteTask(task.id);
      notify('Task deleted.');
    } catch (error) { notify(error.userMessage || error.message, 'error'); }
  }

  if (loading) return <div className="loading-panel"><span className="spinner" />Loading tasks...</div>;
  if (!tasks.length) return <div className="empty-state">
    <div className="empty-icon"><Clock3 size={22} /></div><h3>{emptyTitle}</h3><p>{emptyCopy}</p>
    {onRetry && <button className="button button-secondary" onClick={onRetry}>Try again</button>}
    {!onRetry && <Link to="/tasks/new" className="button button-primary"><span>+</span>Create a task</Link>}
  </div>;

  return <div className="task-list">
    {tasks.map((task) => {
      const dueIn = daysUntil(task.dueDate);
      return <article className="task-row" key={task.id}>
        <div className="task-main">
          <Link to={`/tasks/${task.id}`} className="task-title-link">{task.title}</Link>
          <p className="task-description">{task.description || 'No description added.'}</p>
          <div className="task-mobile-meta"><StatusBadge status={task.status} /><PriorityBadge priority={task.priority} /></div>
        </div>
        <div className="task-status-cell"><StatusBadge status={task.status} /></div>
        <div className="task-priority-cell"><PriorityBadge priority={task.priority} /></div>
        <div className={`task-due ${dueIn !== null && dueIn < 0 && task.status !== 'COMPLETED' ? 'due-overdue' : ''}`}>
          <span>{formatDate(task.dueDate, { month: 'short', day: 'numeric' })}</span>
          {task.status !== 'COMPLETED' && dueIn !== null && dueIn >= 0 && dueIn <= 1 && <small>{dueIn === 0 ? 'Due today' : 'Due tomorrow'}</small>}
          {task.status !== 'COMPLETED' && dueIn !== null && dueIn < 0 && <small>Overdue</small>}
        </div>
        <div className="task-actions">
          <button className="icon-button task-action-complete" type="button" title={task.status === 'COMPLETED' ? 'Reopen task' : 'Mark complete'} aria-label={task.status === 'COMPLETED' ? 'Reopen task' : 'Mark complete'} onClick={() => complete(task)}><Check size={17} /></button>
          <Link className="icon-button" title="Edit task" aria-label="Edit task" to={`/tasks/${task.id}/edit`}><Pencil size={16} /></Link>
          <button className="icon-button task-action-delete" title="Delete task" aria-label="Delete task" onClick={() => remove(task)}><Trash2 size={16} /></button>
          <Link className="task-open-link" to={`/tasks/${task.id}`} aria-label={`View ${task.title}`}><ArrowUpRight size={17} /></Link>
        </div>
      </article>;
    })}
  </div>;
}

export function getTaskStats(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = (task) => task.status !== 'COMPLETED' && task.dueDate && new Date(`${String(task.dueDate).slice(0, 10)}T00:00:00`) < today;
  return {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === 'PENDING').length,
    inProgress: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    completed: tasks.filter((task) => task.status === 'COMPLETED').length,
    overdue: tasks.filter(isOverdue).length,
  };
}
