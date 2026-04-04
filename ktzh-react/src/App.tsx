import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoutesPage from './pages/RoutesPage';
import DashboardPage from './pages/DashboardPage';
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
          </Routes>
        </BrowserRouter>
      </LocaleProvider>
    </ThemeProvider>
  );
}
