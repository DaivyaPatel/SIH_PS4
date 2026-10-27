import { useState, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { ExpertCard } from './ExpertCard';
import { ExpertProfileDrawer } from './ExpertProfileDrawer';
import { EmptyState } from '../common/EmptyState';
import { Skeleton } from '../common/Skeleton';
import type { ExpertDetail, Region } from '../../types/domain';

interface ExpertPoolViewProps {
  experts: ExpertDetail[];
  loading: boolean;
  selectedRegion: Region | 'ALL';
}

export function ExpertPoolView({
  experts,
  loading,
  selectedRegion,
}: ExpertPoolViewProps) {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedExpert, setSelectedExpert] = useState<ExpertDetail | null>(null);

  const domains = [
    { key: 'ALL', label: 'All Specializations' },
    { key: 'COMPUTER_SCIENCE', label: 'Computer Science & IT' },
    { key: 'MECHANICAL_ENGINEERING', label: 'Mechanical Engineering' },
    { key: 'ELECTRICAL_ENGINEERING', label: 'Electrical Engineering' },
    { key: 'CIVIL_ENGINEERING', label: 'Civil & Structural Engineering' },
    { key: 'PHARMACY', label: 'Pharmaceutical Sciences' },
    { key: 'MANAGEMENT', label: 'Management & Business Studies' },
    { key: 'ELECTRONICS_AND_COMMUNICATION', label: 'Electronics & Communication' },
  ];

  const filteredExperts = useMemo(() => {
    return experts.filter(exp => {
      // Region check
      if (selectedRegion !== 'ALL' && exp.region !== selectedRegion) {
        return false;
      }

      // Domain check
      if (domainFilter !== 'ALL' && exp.domain !== domainFilter) {
        return false;
      }

      // Status check
      if (statusFilter === 'ACTIVE' && !exp.active) return false;
      if (statusFilter === 'INACTIVE' && exp.active) return false;

      // Search query check
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = exp.name.toLowerCase().includes(q);
        const matchesInst = exp.affiliatedInstitution.toLowerCase().includes(q);
        const matchesDomain = exp.domain.toLowerCase().includes(q);
        if (!matchesName && !matchesInst && !matchesDomain) return false;
      }

      return true;
    });
  }, [experts, selectedRegion, domainFilter, statusFilter, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter and View Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: 220, flex: 1, maxWidth: 300 }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search expert or institution..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 30px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                fontSize: 12,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Domain Dropdown */}
          <select
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {domains.map(d => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            style={{
              padding: '7px 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontSize: 12,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Experts</option>
            <option value="INACTIVE">Inactive Experts</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>
            {filteredExperts.length} expert{filteredExperts.length === 1 ? '' : 's'}
          </span>

          <div
            style={{
              display: 'flex',
              background: 'var(--bg-subtle)',
              borderRadius: 6,
              padding: 2,
              border: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--accent)' : 'var(--text-muted)',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <LayoutGrid size={14} />
            </button>

            <button
              type="button"
              aria-label="Table view"
              onClick={() => setViewMode('table')}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'table' ? 'var(--accent)' : 'var(--text-muted)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={180} />
          ))}
        </div>
      ) : filteredExperts.length === 0 ? (
        <EmptyState
          icon={<AlertCircle size={28} style={{ color: 'var(--text-muted)' }} />}
          title="No experts match the selected criteria"
          description="Try broadening your specialization filter or changing the regional selection to view available committee members."
        />
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filteredExperts.map(expert => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onSelect={setSelectedExpert}
            />
          ))}
        </div>
      ) : (
        /* Dense Table View */
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Expert Name</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Domain</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Affiliated Institution</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Region</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Next Available</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExperts.map(exp => (
                <tr
                  key={exp.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {exp.name}
                    <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>
                      {exp.designation}
                    </div>
                  </td>

                  <td style={{ padding: '10px 14px', color: 'var(--accent)', fontWeight: 500 }}>
                    {exp.domain.replace(/_/g, ' ')}
                  </td>

                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                    {exp.affiliatedInstitution}
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {exp.region}
                    </span>
                  </td>

                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                    {exp.availableDates[0] || 'None'}
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: exp.active ? 'var(--status-ok-tint)' : 'var(--bg-hover)',
                        color: exp.active ? 'var(--status-ok-text)' : 'var(--text-muted)',
                      }}
                    >
                      {exp.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>

                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedExpert(exp)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--accent)',
                        fontWeight: 600,
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Eye size={13} />
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Profile Drawer */}
      <ExpertProfileDrawer
        isOpen={Boolean(selectedExpert)}
        onClose={() => setSelectedExpert(null)}
        expert={selectedExpert}
      />
    </div>
  );
}
