import { Search, RotateCcw, Filter } from 'lucide-react';
import { Button } from '../common/Button';

interface NotificationFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: string;
  onTypeChange: (t: string) => void;
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  selectedReadState: string;
  onReadStateChange: (r: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  onReset: () => void;
  totalFiltered: number;
}

export function NotificationFilterBar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedPriority,
  onPriorityChange,
  selectedReadState,
  onReadStateChange,
  selectedRole,
  onRoleChange,
  onReset,
  totalFiltered,
}: NotificationFilterBarProps) {
  const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedType !== 'ALL' ||
    selectedPriority !== 'ALL' ||
    selectedReadState !== 'ALL' ||
    selectedRole !== 'ALL';

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
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
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search notices, application numbers, or institutions…"
            style={{
              width: '100%',
              padding: '6px 10px 6px 32px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg-subtle)',
              fontSize: 12,
              color: 'var(--text-primary)',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        {/* Count Indicator */}
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Showing <strong>{totalFiltered}</strong> notification{totalFiltered === 1 ? '' : 's'}
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12, marginRight: 4 }}>
          <Filter size={13} />
          <span>Filter:</span>
        </div>

        {/* Type Select */}
        <select
          value={selectedType}
          onChange={e => onTypeChange(e.target.value)}
          style={selectStyle}
          aria-label="Filter by notification type"
        >
          <option value="ALL">All Notice Types</option>
          <option value="ESCALATION">Escalation Notices</option>
          <option value="DEFICIENCY_NOTICE">Deficiency Flags</option>
          <option value="INSPECTION_APPOINTMENT">Committee Visits</option>
          <option value="DEADLINE_REMINDER">Deadline Reminders</option>
        </select>

        {/* Priority Select */}
        <select
          value={selectedPriority}
          onChange={e => onPriorityChange(e.target.value)}
          style={selectStyle}
          aria-label="Filter by priority"
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical Priority</option>
          <option value="HIGH">High Priority</option>
          <option value="NORMAL">Normal Priority</option>
        </select>

        {/* Read State Select */}
        <select
          value={selectedReadState}
          onChange={e => onReadStateChange(e.target.value)}
          style={selectStyle}
          aria-label="Filter by read state"
        >
          <option value="ALL">All Read States</option>
          <option value="UNREAD">Unread Only</option>
          <option value="READ">Read Only</option>
        </select>

        {/* Recipient Role Select */}
        <select
          value={selectedRole}
          onChange={e => onRoleChange(e.target.value)}
          style={selectStyle}
          aria-label="Filter by recipient role"
        >
          <option value="ALL">All Recipient Roles</option>
          <option value="REGIONAL_OFFICER">Regional Officer</option>
          <option value="SCRUTINY_OFFICER">Scrutiny Officer</option>
          <option value="INSTITUTION_ADMIN">Institution Admin</option>
          <option value="EVC_EXPERT">EVC Expert</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<RotateCcw size={12} />}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
