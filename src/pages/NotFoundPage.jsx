import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-zinc-800/50 p-8 rounded-2xl shadow-xl border border-zinc-700 max-w-lg w-full backdrop-blur-sm animate-in fade-in duration-500">
        <h1 className="text-9xl font-thin text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-400 mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl font-light text-zinc-100 mb-4 tracking-tight">Page Not Found</h2>
        <p className="text-zinc-400 mb-8 text-lg font-light">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-3 px-8 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-zinc-900/50"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
