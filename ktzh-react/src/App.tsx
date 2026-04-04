import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoutesPage from './pages/RoutesPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoutesPage />} />
        <Route path="/dashboard/:id" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
