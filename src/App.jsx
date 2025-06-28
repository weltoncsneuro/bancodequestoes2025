import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Questions from './components/Questions'
import Exams from './components/Exams'
import Performance from './components/Performance'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/performance" element={<Performance />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  )
}

export default App

