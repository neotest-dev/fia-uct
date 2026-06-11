import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import SplashScreen from './components/SplashScreen';
import './index.css';

// Initialize the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Avoid excessive refetching when switching browser tabs
      staleTime: 12 * 60 * 60 * 1000, // 12 hours
      gcTime: 24 * 60 * 60 * 1000, // 24 hours (previously cacheTime)
    },
  },
});

/**
 * Root application component.
 * Wraps the app with QueryClientProvider, AuthProvider and BrowserRouter.
 * Shows a splash screen during initial load.
 */
function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate minimum loading time for splash
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SplashScreen loading={initialLoading} />
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
