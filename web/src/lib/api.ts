import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('pulse_token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('pulse_token')
  }
}

export function loadAuthFromStorage() {
  const t = localStorage.getItem('pulse_token')
  if (t) setAuthToken(t)
}


