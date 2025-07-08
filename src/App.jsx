import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState('tasks'); // 'tasks' or 'reports'

  useEffect(() => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (loggedInUser) {
        setUser(loggedInUser);
      }
      let savedUsers = JSON.parse(localStorage.getItem('users')) || [];
      if (savedUsers.length === 0) {
        const initialUsers = [
          { username: 'admin', password: 'admin', role: 'admin' },
          { username: 'غيث صلاح مهدي', password: '1', role: 'creator' }
        ];
        savedUsers = initialUsers;
        localStorage.setItem('users', JSON.stringify(initialUsers));
      } else {
        savedUsers = savedUsers.map(u => ({
          ...u,
          role: u.role || (u.username === 'admin' ? 'admin' : 'technician')
        }));
        if (!savedUsers.some(u => u.username === 'غيث صلاح مهدي')) {
            savedUsers.push({ username: 'غيث صلاح مهدي', password: '1', role: 'creator' });
        }
        localStorage.setItem('users', JSON.stringify(savedUsers));
      }
      setUsers(savedUsers);

    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      localStorage.clear();
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
  };

  const handleUpdateUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        const updatedLoggedInUser = updatedUsers.find(u => u.username === loggedInUser.username);
        if (updatedLoggedInUser) {
            setUser(updatedLoggedInUser);
            localStorage.setItem('loggedInUser', JSON.stringify(updatedLoggedInUser));
        } else {
            handleLogout();
        }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-900 text-white">
        {user ? (
          <Dashboard 
            user={user} 
            onLogout={handleLogout} 
            users={users} 
            onUpdateUsers={handleUpdateUsers}
            view={view}
            setView={setView}
          />
        ) : (
          <AuthPage onLogin={handleLogin} onUpdateUsers={handleUpdateUsers} />
        )}
      </div>
      <Toaster />
    </>
  );
}

export default App;