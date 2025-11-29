import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import Login from './pages/Login'
import SignIn from './pages/SignIn'
import App from './App'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Resources from './pages/Resources'
import Documents from './pages/Documents'
import PulseAIPage from './pages/PulseAIPage'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/signin',
        element: <SignIn />,
    },
    {
        element: <App />,
        children: [
            {
                path: '/dashboard',
                element: <Dashboard />,
            },
            {
                path: '/pulse-ai',
                element: <PulseAIPage />,
            },
            {
                path: '/alerts',
                element: <Alerts />,
            },
            {
                path: '/resources',
                element: <Resources />,
            },
            {
                path: '/documents',
                element: <Documents />,
            },
        ],
    },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
