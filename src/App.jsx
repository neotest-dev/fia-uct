import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import SplashScreen from './components/SplashScreen';
import './index.css';

/**
 * Root application component.
 * Wraps the app with AuthProvider and BrowserRouter.
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
    <AuthProvider>
      <BrowserRouter>
        <SplashScreen loading={initialLoading} />
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
