import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<div className="container"><h1>Welcome to UIU Social Network</h1><p>Connect with your campus.</p></div>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<div className="container"><h1>Login Page (Coming Soon)</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;
