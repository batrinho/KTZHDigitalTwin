import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoutesPage from './pages/RoutesPage';
import DashboardPage from './pages/DashboardPage';
import ReplayPage from './pages/ReplayPage';
import { ThemeProvider } from './context/ThemeContext';
import { LocaleProvider } from './context/LocaleContext';

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoutesPage />} />
            <Route path="/dashboard/:id" element={<DashboardPage />} />
            <Route path="/replay/:id" element={<ReplayPage />} />
          </Routes>
        </BrowserRouter>
      </LocaleProvider>
    </ThemeProvider>
  );
}
