import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import SubmitIssue from './pages/SubmitIssue/SubmitIssue';
import IssueDetail from './pages/IssueDetail/IssueDetail';
import Forum from './pages/Forum/Forum';
import Profile from './pages/Profile/Profile';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import AIChat from './components/AIChat/AIChat';

import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit-issue" element={<SubmitIssue />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>

      {user && <AIChat />}

      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
      />
    </div>
  );
}

export default App;