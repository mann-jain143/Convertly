import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

function Footer() {
  return (
    <footer className="mx-auto mt-12 w-full max-w-6xl border-t border-slate-200 px-4 py-6 text-sm dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Convertly · Secure conversions for everyone.</p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Trust badges: ISO-inspired controls · Auto-delete retention · Encrypted transport</p>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
      <Footer />
    </>
  );
}
