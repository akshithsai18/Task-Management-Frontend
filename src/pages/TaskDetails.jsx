import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, CircleAlert, Clock3, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { errorMessage } from '../api/axiosClient.js';
import { formatDate, PriorityBadge, StatusBadge } from '../components/TaskComponents.jsx';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTask, updateTask, deleteTask } = useTasks();
  const notify = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getTask(id).then((value) => { if (active) setTask(value); }).catch((requestError) => { if (active) setError(errorMessage(requestError)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function toggleStatus() {
    setBusy(true);
    try {
      const status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      setTask(await updateTask(task.id, { ...task, status }));
      notify(status === 'COMPLETED' ? 'Task marked complete.' : 'Task reopened.');
    } catch (requestError) { notify(errorMessage(requestError), 'error'); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteTask(task.id);
      notify('Task deleted.');
      navigate('/tasks', { replace: true });
    } catch (requestError) { notify(errorMessage(requestError), 'error'); setBusy(false); }
  }

  if (loading) return <div className="loading-panel form-loading"><span className="spinner" />Loading task...</div>;
  if (error || !task) return <div className="page-stack"><div className="page-error" role="alert"><CircleAlert size={18} /><span>{error || 'This task could not be found.'}</span></div><Link className="button button-secondary back-button" to="/tasks"><ArrowLeft size={16} />Back to tasks</Link></div>;

  return <div className="page-stack detail-page">
    <Link className="back-link" to="/tasks"><ArrowLeft size={16} />Back to all tasks</Link>
    <article className="surface task-detail-surface">
      <div className="detail-topline"><span className="section-overline">TASK DETAILS</span><div className="detail-actions"><Link className="button button-secondary" to={`/tasks/${task.id}/edit`}><Pencil size={16} />Edit task</Link><button className="icon-button detail-delete" type="button" aria-label="Delete task" title="Delete task" onClick={remove} disabled={busy}><Trash2 size={17} /></button></div></div>
      <h1>{task.title}</h1>
      <div className="detail-badges"><StatusBadge status={task.status} /><PriorityBadge priority={task.priority} /></div>
      <div className="detail-description"><span className="detail-label">DESCRIPTION</span><p>{task.description || 'No description was added for this task.'}</p></div>
      <div className="detail-metadata">
        <div><CalendarDays size={17} /><span><small>DUE DATE</small><strong>{formatDate(task.dueDate)}</strong></span></div>
        <div><Clock3 size={17} /><span><small>CREATED</small><strong>{formatDate(task.createdAt)}</strong></span></div>
        <div><RotateCcw size={17} /><span><small>LAST UPDATED</small><strong>{formatDate(task.updatedAt || task.createdAt)}</strong></span></div>
      </div>
      <div className="detail-footer"><span>{task.status === 'COMPLETED' ? 'This task is wrapped up.' : 'Ready to move this one along?'}</span><button className={`button ${task.status === 'COMPLETED' ? 'button-secondary' : 'button-primary'}`} onClick={toggleStatus} disabled={busy}>{task.status === 'COMPLETED' ? <><RotateCcw size={16} />Reopen task</> : <><Check size={16} />Mark as completed</>}</button></div>
    </article>
  </div>;
}
