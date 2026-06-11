import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock courseService
vi.mock('../services/courseService', () => ({
  getCourses: vi.fn(),
}));

// Mock firebase
vi.mock('../services/firebase', () => ({
  db: {},
  auth: {},
  isFirebaseConfigured: false,
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({ user: null, loading: false }),
  AuthProvider: ({ children }) => children,
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CoursesPage from '../pages/CoursesPage';
import { getCourses } from '../services/courseService';

const mockCourses = [
  {
    programa: 'Arquitectura',
    modalidad: 'Presencial',
    ciclo: 'I',
    codigo: 'PRARNOP240101',
    curso: 'Introducción a la arquitectura modular',
    docente: 'Wilmz Diego Mostacero Zarate',
    'mod-curso': 'Presencial',
    horas: 3,
    creditos: 2,
    tipoEstudio: 'Estudios Específicos',
  },
  {
    programa: 'Arquitectura',
    modalidad: 'Presencial',
    ciclo: 'I',
    codigo: 'PRARNOP240102',
    curso: 'Dibujo arquitectónico I',
    docente: 'Wilmz Diego Mostacero Zarate',
    'mod-curso': 'Presencial',
    horas: 4,
    creditos: 3,
    tipoEstudio: 'Estudios Generales',
  },
];

function renderWithRouter(component, route = '/programs/Arquitectura/modalities/Presencial/cycles/I/courses') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        {component}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CoursesPage', () => {
  it('renders course cards when data is loaded', async () => {
    getCourses.mockResolvedValue(mockCourses);

    renderWithRouter(<CoursesPage />);

    // Should show loading initially
    expect(screen.getByText('Cargando...')).toBeInTheDocument();

    // Wait for courses to load
    const courseTitle = await screen.findByText('Introducción a la arquitectura modular');
    expect(courseTitle).toBeInTheDocument();

    const courseTitle2 = await screen.findByText('Dibujo arquitectónico I');
    expect(courseTitle2).toBeInTheDocument();
  });

  it('shows empty state when no courses are available', async () => {
    getCourses.mockResolvedValue([]);

    renderWithRouter(<CoursesPage />);

    const emptyText = await screen.findByText('No hay cursos disponibles');
    expect(emptyText).toBeInTheDocument();
  });
});
