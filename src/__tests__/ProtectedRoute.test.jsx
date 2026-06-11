import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock firebase
vi.mock('../services/firebase', () => ({
  db: {},
  auth: {},
  isFirebaseConfigured: false,
}));

// Mock authService
vi.mock('../services/authService', () => ({
  onAuthStateChanged: vi.fn((callback) => {
    // Will be controlled per test
    return () => {};
  }),
  loginWithEmail: vi.fn(),
  logout: vi.fn(),
}));

import ProtectedRoute from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { onAuthStateChanged } from '../services/authService';

function renderProtectedRoute(initialEntries = ['/admin/courses/new']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route
            path="/admin/courses/new"
            element={
              <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('redirects to login when user is not authenticated', async () => {
    // Simulate no user
    onAuthStateChanged.mockImplementation((callback) => {
      setTimeout(() => callback(null), 0);
      return () => {};
    });

    renderProtectedRoute();

    const loginPage = await screen.findByTestId('login-page');
    expect(loginPage).toBeInTheDocument();
  });

  it('renders protected content when user is authenticated', async () => {
    // Simulate authenticated user
    onAuthStateChanged.mockImplementation((callback) => {
      setTimeout(() => callback({ uid: '123', email: 'admin@uct.edu.pe' }), 0);
      return () => {};
    });

    renderProtectedRoute();

    const content = await screen.findByTestId('protected-content');
    expect(content).toBeInTheDocument();
  });
});
