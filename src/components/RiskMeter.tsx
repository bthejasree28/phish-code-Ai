import React from 'react';
import { RiskLevel } from '../types';

interface Props {
  score: number;
  level: RiskLevel;
}

export const RiskMeter: React.FC<Props> = ({ score, level }) => {
  const clamped = Math.min(Math.max(score, 0), 100);

  const getMeterColor = () => {
    if (level === 'LOW RISK') return '#315C3B';
    if (level === 'MEDIUM RISK') return '#805B18'; // Warm amber
    return '#8A3028'; // High risk coral
  };

  const getMeterBg = () => {
    if (level === 'LOW RISK') return '#DDEBDD';
    if (level === 'MEDIUM RISK') return '#F5E6C8';
    return '#F3D8D4';
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-[#292F2D]">
            {clamped}
          </span>
          <span className="text-sm font-medium text-[#727873]">/ 100 Risk Score</span>
        </div>
        <span
          className="text-xs font-semibold uppercase px-2.5 py-1 rounded"
          style={{ backgroundColor: getMeterBg(), color: getMeterColor() }}
        >
          {level}
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full h-3 bg-[#E5E3DA] rounded-full overflow-hidden p-0.5">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(clamped, 4)}%`,
            backgroundColor: getMeterColor(),
          }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-medium text-[#727873]">
        <span>0 (Minimal Risk)</span>
        <span>50 (Suspicious)</span>
        <span>100 (Critical Threat)</span>
      </div>
    </div>
  );
};
