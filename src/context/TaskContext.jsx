import { createContext, useContext, useEffect, useState } from 'react';
import { taskApi } from '../api/taskApi.js';
import { useAuth } from './AuthContext.jsx';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  async function refreshTasks() {
    if (!user) { setTasks([]); return []; }
    setLoading(true);
    setLoadError('');
    try {
      const result = await taskApi.getTasks();
      setTasks(result);
      return result;
    } catch (error) {
      setLoadError(error.userMessage || error.message || 'Could not load your tasks.');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    if (!user) {
      setTasks([]);
      setLoading(false);
      setLoadError('');
      return undefined;
    }
    setLoading(true);
    setLoadError('');
    taskApi.getTasks()
      .then((result) => { if (active) setTasks(result); })
      .catch((error) => { if (active) setLoadError(error.userMessage || error.message || 'Could not load your tasks.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, user?.email]);

  async function getTask(id) {
    const localTask = tasks.find((task) => String(task.id) === String(id));
    if (localTask) return localTask;
    return taskApi.getTask(id);
  }

  async function createTask(payload) {
    const created = await taskApi.createTask(payload);
    setTasks((current) => [created, ...current]);
    return created;
  }

  async function updateTask(id, payload) {
    const updated = await taskApi.updateTask(id, payload);
    setTasks((current) => current.map((task) => String(task.id) === String(id) ? updated : task));
    return updated;
  }

  async function deleteTask(id) {
    await taskApi.deleteTask(id);
    setTasks((current) => current.filter((task) => String(task.id) !== String(id)));
  }

  return (
    <TaskContext.Provider value={{ tasks, loading, loadError, refreshTasks, getTask, createTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const value = useContext(TaskContext);
  if (!value) throw new Error('useTasks must be used inside TaskProvider.');
  return value;
}
