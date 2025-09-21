import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Dashboard } from '@/pages/Dashboard'
import { Reports } from '@/pages/Reports'
import { Upload } from '@/pages/Upload'
import { ReportDetail } from '@/pages/ReportDetail'
import { Settings } from '@/pages/Settings'
import { ReportEdit } from './pages/ReportEdit'

function App() {
  return (
    <Router>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Header fijo en la parte superior */}
        <Header />
        
        {/* Contenido principal con sidebar y main */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          {/* Main con scroll */}
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/:id" element={<ReportDetail />} />
              <Route path="/reports/:id/edit" element={<ReportEdit />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
        
        <Toaster />
      </div>
    </Router>
  )
}

export default App
