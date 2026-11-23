import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext.jsx';
import TopNav from './components/layout/TopNav.jsx';
import Footer from './components/layout/Footer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <HashRouter>
      <BookingProvider>
        <div className="flex min-h-screen flex-col bg-sand-50 font-sans text-ink-950 antialiased">
          <TopNav />
          <main className="min-w-0 flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BookingProvider>
    </HashRouter>
  );
}
