import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface Props {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ level, size = 'md', showIcon = true }) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3.5 py-1 gap-1.5 font-medium',
    lg: 'text-base px-4 py-1.5 gap-2 font-semibold',
  }[size];

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;

  if (level === 'LOW RISK') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-[#DDEBDD] text-[#315C3B] border border-[#CAD8C5] ${sizeClasses}`}
      >
        {showIcon && <ShieldCheck size={iconSize} className="text-[#315C3B]" />}
        LOW RISK
      </span>
    );
  }

  if (level === 'MEDIUM RISK') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-[#F5E6C8] text-[#805B18] border border-[#E6C77A] ${sizeClasses}`}
      >
        {showIcon && <AlertTriangle size={iconSize} className="text-[#805B18]" />}
        MEDIUM RISK (SUSPICIOUS)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#F3D8D4] text-[#8A3028] border border-[#E8B4B0] ${sizeClasses}`}
    >
      {showIcon && <AlertOctagon size={iconSize} className="text-[#8A3028]" />}
      HIGH RISK (DANGEROUS)
    </span>
  );
};
