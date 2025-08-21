import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (token && userRole) {
      // If already logged in, redirect to dashboard
      navigate('/dashboard');
    } else {
      // If not logged in, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text p-4">
      <h2 className="text-4xl font-sans font-bold mb-8 text-primary dark:text-primary-300">
        Redirecting...
      </h2>
    </div>
  );
};

export default RoleSelection;