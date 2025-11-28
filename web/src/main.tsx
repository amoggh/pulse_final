import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import Home from './pages/Home'
import Login from './pages/Login'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Resources from './pages/Resources'
import Documents from './pages/Documents'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />
        <Route element={<App />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/documents" element={<Documents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)


