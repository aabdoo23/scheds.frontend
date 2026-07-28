import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { HomePage } from '@/pages/HomePage';
import { FindStudyRoomsPage } from '@/pages/FindStudyRoomsPage';
import { SelfServiceSearchPage } from '@/pages/SelfServiceSearchPage';
import { SeatAlertsPage } from '@/pages/SeatAlertsPage';
import { GenerateSchedulesPage } from '@/pages/GenerateSchedulesPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage';
import { AdminGenerationsPage } from '@/pages/AdminGenerationsPage';
import { AdminGenerationDetailsPage } from '@/pages/AdminGenerationDetailsPage';
import { ContributorsPage } from '@/pages/ContributorsPage';

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <div className="pt-[var(--navbar-height)] min-h-screen">
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generate-schedules" element={<GenerateSchedulesPage />} />
        <Route path="/self-service-search" element={<SelfServiceSearchPage />} />
        <Route path="/seat-alerts" element={<SeatAlertsPage />} />
        {/* Old path: bookmarks and links in already-sent alert emails still use it. */}
        <Route path="/seat-moderation" element={<Navigate to="/seat-alerts" replace />} />
        <Route path="/find-study-rooms" element={<FindStudyRoomsPage />} />
        <Route path="/contributors" element={<ContributorsPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/generations" element={<AdminGenerationsPage />} />
        <Route path="/admin/generations/:id" element={<AdminGenerationDetailsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
