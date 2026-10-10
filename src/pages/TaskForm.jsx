import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CircleAlert, Save } from 'lucide-react';
import { useTasks } from '../context/TaskContext.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { errorMessage } from '../api/axiosClient.js';

const blankTask = { title: '', description: '', priority: 'MEDIUM', status: 'PENDING', dueDate: '' };
const today = new Date().toISOString().slice(0, 10);

export default function TaskForm({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTask, createTask, updateTask } = useTasks();
  const notify = useToast();
  const [values, setValues] = useState(blankTask);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(edit);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (!edit) return undefined;
    getTask(id)
      .then((task) => { if (active) setValues({ title: task.title || '', description: task.description || '', priority: task.priority || 'MEDIUM', status: task.status || 'PENDING', dueDate: task.dueDate?.slice(0, 10) || '' }); })
      .catch((error) => { if (active) setLoadError(errorMessage(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [edit, id]);

  function change(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [event.target.name]: '' }));
  }

  function validate() {
    const errors = {};
    if (!values.title.trim()) errors.title = 'Add a title for this task.';
    if (values.title.trim().length > 120) errors.title = 'Keep the title under 120 characters.';
    if (values.dueDate && Number.isNaN(new Date(`${values.dueDate}T00:00:00`).getTime())) errors.dueDate = 'Enter a valid due date.';
    if (!edit && values.dueDate && values.dueDate < today) errors.dueDate = 'Choose today or a future date.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    const payload = { ...values, title: values.title.trim(), description: values.description.trim(), dueDate: values.dueDate || null };
    try {
      const task = edit ? await updateTask(id, payload) : await createTask(payload);
      notify(edit ? 'Your changes have been saved.' : 'Task created.');
      navigate(edit ? `/tasks/${task.id}` : '/tasks', { replace: true });
    } catch (error) {
      notify(errorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading-panel form-loading"><span className="spinner" />Loading task...</div>;
  if (loadError) return <div className="page-stack"><div className="page-error" role="alert"><CircleAlert size={18} /><span>{loadError}</span></div><Link className="button button-secondary back-button" to="/tasks"><ArrowLeft size={16} />Back to tasks</Link></div>;

  return <div className="page-stack form-page">
    <Link className="back-link" to={edit ? `/tasks/${id}` : '/tasks'}><ArrowLeft size={16} />Back to {edit ? 'task' : 'all tasks'}</Link>
    <div className="page-heading-row form-heading"><div><div className="eyebrow"><span className="eyebrow-dot" />TASK WORKSPACE</div><h1>{edit ? 'Edit task' : 'Create a task'}<span className="welcome-period">.</span></h1><p>{edit ? 'Make an adjustment and keep things moving.' : 'Get it out of your head and into your plan.'}</p></div></div>
    <form className="surface task-form-surface" onSubmit={submit} noValidate>
      <div className="form-section-intro"><span className="form-section-mark">01</span><div><h2>Task details</h2><p>A clear title makes the next step easier.</p></div></div>
      <div className="task-form-fields">
        <label className="field-wrap field-full"><span>Task title <i>*</i></span><input className={`text-input ${fieldErrors.title ? 'input-error' : ''}`} type="text" name="title" maxLength={120} placeholder="e.g. Share the project update" value={values.title} onChange={change} aria-invalid={Boolean(fieldErrors.title)} autoFocus />{fieldErrors.title && <small className="field-error">{fieldErrors.title}</small>}</label>
        <label className="field-wrap field-full"><span>Description <small>OPTIONAL</small></span><textarea className="text-input description-input" name="description" rows={4} maxLength={1000} placeholder="Add a little context, notes, or the first step..." value={values.description} onChange={change} /><span className="character-count">{values.description.length}/1000</span></label>
        <label className="field-wrap"><span>Priority</span><select className="text-input" name="priority" value={values.priority} onChange={change}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
        <label className="field-wrap"><span>Status</span><select className="text-input" name="status" value={values.status} onChange={change}><option value="PENDING">Pending</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></label>
        <label className="field-wrap"><span>Due date <small>OPTIONAL</small></span><div className={`date-input-wrap ${fieldErrors.dueDate ? 'input-error' : ''}`}><CalendarDays size={17} /><input type="date" name="dueDate" min={edit ? undefined : today} value={values.dueDate} onChange={change} aria-invalid={Boolean(fieldErrors.dueDate)} /></div>{fieldErrors.dueDate && <small className="field-error">{fieldErrors.dueDate}</small>}</label>
      </div>
      <div className="form-footer"><span><i>*</i> Required field</span><div><Link className="button button-secondary" to={edit ? `/tasks/${id}` : '/tasks'}>Cancel</Link><button className="button button-primary" type="submit" disabled={saving}>{saving ? <><span className="button-spinner" />Saving...</> : <><Save size={16} />{edit ? 'Save changes' : 'Save task'}</>}</button></div></div>
    </form>
  </div>;
}
