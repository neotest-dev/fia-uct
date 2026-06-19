import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import HomePage from '../pages/HomePage';
import ProgramsPage from '../pages/ProgramsPage';
import ModalitiesPage from '../pages/ModalitiesPage';
import CyclesPage from '../pages/CyclesPage';
import CoursesPage from '../pages/CoursesPage';
import CourseDetailPage from '../pages/CourseDetailPage';
import LoginPage from '../pages/LoginPage';
import CourseNewPage from '../pages/CourseNewPage';
import CourseEditPage from '../pages/CourseEditPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * Application router with all routes.
 * Admin routes are wrapped with ProtectedRoute for authentication.
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:programId/modalities" element={<ModalitiesPage />} />
        <Route path="/programs/:programId/modalities/:modalityId/cycles" element={<CyclesPage />} />
        <Route path="/programs/:programId/modalities/:modalityId/cycles/:cycleId/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        {/* Auth */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected admin routes */}
        <Route
          path="/admin/courses/new"
          element={
            <ProtectedRoute>
              <CourseNewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses/:courseId/edit"
          element={
            <ProtectedRoute>
              <CourseEditPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
