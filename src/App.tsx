import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import DashboardPage from './pages/DashboardPage'
import OpenPositionsPage from './pages/OpenPositionsPage'
import ClosedTradesPage from './pages/ClosedTradesPage'
import PerformancePage from './pages/PerformancePage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/positions" element={<OpenPositionsPage />} />
              <Route path="/history" element={<ClosedTradesPage />} />
              <Route path="/performance" element={<PerformancePage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}