import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import AuthPages from './pages/AuthPages.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import TaskForm from './pages/TaskForm.jsx';
import TaskDetails from './pages/TaskDetails.jsx';
import Profile from './pages/Profile.jsx';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="full-screen-loading"><span className="spinner" />Preparing your workspace...</div>;
  return user ? <AppLayout /> : <Navigate to="/login" replace state={{ from: location }} />;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-screen-loading"><span className="spinner" />Preparing your workspace...</div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><AuthPages mode="login" /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><AuthPages mode="register" /></PublicOnly>} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TasksPage view="all" />} />
        <Route path="/tasks/pending" element={<TasksPage view="pending" />} />
        <Route path="/tasks/completed" element={<TasksPage view="completed" />} />
        <Route path="/tasks/new" element={<TaskForm />} />
        <Route path="/tasks/:id/edit" element={<TaskForm edit />} />
        <Route path="/tasks/:id" element={<TaskDetails />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
