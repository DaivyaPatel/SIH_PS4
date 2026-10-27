import React from 'react';
import {
  Building2,
  Users,
  Flame,
  Coins,
  BookOpen,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface DeficiencyCategoryChipProps {
  category: string;
}

export function DeficiencyCategoryChip({ category }: DeficiencyCategoryChipProps) {
  const normCategory = category.toUpperCase().trim();

  let label = category.replace(/_/g, ' ');
  let icon: React.ReactNode = <AlertCircle size={12} />;

  if (normCategory.includes('LAND') || normCategory.includes('BUILDING')) {
    label = 'Land & Building Norms';
    icon = <Building2 size={12} />;
  } else if (normCategory.includes('FACULTY') || normCategory.includes('CADRE')) {
    label = 'Faculty Cadre & Ratio';
    icon = <Users size={12} />;
  } else if (normCategory.includes('FIRE') || normCategory.includes('SAFETY')) {
    label = 'Fire Safety & NOC';
    icon = <Flame size={12} />;
  } else if (normCategory.includes('FINANCIAL') || normCategory.includes('DEPOSIT') || normCategory.includes('FDR')) {
    label = 'Financial Deposit / FDR';
    icon = <Coins size={12} />;
  } else if (normCategory.includes('ACADEMIC') || normCategory.includes('INFRASTRUCTURE')) {
    label = 'Academic Infrastructure';
    icon = <BookOpen size={12} />;
  } else if (normCategory.includes('DOCUMENT') || normCategory.includes('AFFILIATION')) {
    label = 'Statutory Documents';
    icon = <FileText size={12} />;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 4,
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        lineHeight: 1.2,
      }}
    >
      <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
