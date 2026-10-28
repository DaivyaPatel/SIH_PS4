import { BrowserRouter, MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { RegionProvider } from './context/RegionContext';
import { RoleProvider } from './context/RoleContext';
import { ToastProvider } from './context/ToastContext';
import { DensityProvider } from './context/DensityContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomeRoute } from './routes/HomeRoute';
import { CasesRoute } from './routes/CasesRoute';
import { CaseDetailRoute } from './routes/CaseDetailRoute';
import { DeficienciesRoute } from './routes/DeficienciesRoute';
import { VisitsRoute } from './routes/VisitsRoute';
import { NotificationsRoute } from './routes/NotificationsRoute';
import { IntegrationRoute } from './routes/IntegrationRoute';
import { SettingsRoute } from './routes/SettingsRoute';

export function App() {
  const Router = typeof window === 'undefined' ? MemoryRouter : BrowserRouter;

  return (
    <ThemeProvider>
      <DensityProvider>
        <RegionProvider>
          <RoleProvider>
            <ToastProvider>
              <Router>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<HomeRoute />} />
                    <Route path="/cases" element={<CasesRoute />} />
                    <Route path="/cases/:id" element={<CaseDetailRoute />} />
                    <Route path="/deficiencies" element={<DeficienciesRoute />} />
                    <Route path="/visits" element={<VisitsRoute />} />
                    <Route path="/notifications" element={<NotificationsRoute />} />
                    <Route path="/integration" element={<IntegrationRoute />} />
                    <Route path="/settings" element={<SettingsRoute />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Router>
            </ToastProvider>
          </RoleProvider>
        </RegionProvider>
      </DensityProvider>
    </ThemeProvider>
  );
}
