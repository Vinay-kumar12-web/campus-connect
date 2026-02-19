import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login      from './pages/Login';
import Register   from './pages/Register';
import Home       from './pages/Home';
import Listings   from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Events     from './pages/Events';
import Bookings   from './pages/Bookings';
import Messages   from './pages/Messages';
import Profile    from './pages/Profile';
import Admin      from './pages/Admin';
import Navbar     from './components/Navbar';

// Guard: redirect to login if not authenticated
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-loader"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
};

// Guard: redirect to home if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-loader"><div className="spinner" /></div>;
  return !user ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/"         element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/listings" element={<PrivateRoute><Listings /></PrivateRoute>} />
        <Route path="/listings/:id"    element={<PrivateRoute><ListingDetail /></PrivateRoute>} />
        <Route path="/listings/create" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
        <Route path="/events"   element={<PrivateRoute><Events /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/messages/:userId" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/profile"  element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin"    element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="*"         element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
