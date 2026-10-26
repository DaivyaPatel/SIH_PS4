import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (pathnames.length === 0) {
    return null;
  }

  const formatSegment = (seg: string) => {
    if (seg === 'cases') return 'Cases';
    if (seg === 'deficiencies') return 'Deficiencies';
    if (seg === 'visits') return 'Expert visits';
    if (seg === 'notifications') return 'Notifications';
    if (seg === 'integration') return 'Integration status';
    if (seg === 'settings') return 'Settings';
    return seg;
  };

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'var(--text-muted)',
        marginBottom: 16,
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
        }}
      >
        <Home size={14} />
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={to} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChevronRight size={12} color="var(--border-strong)" />
            {isLast ? (
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {formatSegment(value)}
              </span>
            ) : (
              <Link
                to={to}
                style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                {formatSegment(value)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
