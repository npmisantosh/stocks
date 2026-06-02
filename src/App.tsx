import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import MobileNav from './components/layout/MobileNav'
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
        <MobileNav />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="p-4 sm:p-6">
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