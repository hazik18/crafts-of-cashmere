import React from 'react';
import { CraftCategory, MotifType } from '../../types';

export const PALETTES: Record<CraftCategory, { a: string; b: string; c: string; d: string }> = {
  pashmina: { a: '#EFE6D8', b: '#D9C7A9', c: '#A67C3D', d: '#6E5A3E' },
  kaani: { a: '#E8DFD2', b: '#B85C48', c: '#A67C3D', d: '#3E4A5A' },
  walnut: { a: '#EDE4D6', b: '#8A6A4F', c: '#5C4433', d: '#3A2C22' },
  papier: { a: '#F0E7DA', b: '#2E4A62', c: '#B85C48', d: '#A67C3D' },
  carpet: { a: '#EAE0D0', b: '#8A3B3B', c: '#3E4A5A', d: '#A67C3D' },
  crewel: { a: '#EFE8DC', b: '#5A6E4E', c: '#B85C48', d: '#A67C3D' },
};

interface MotifProps {
  motif: MotifType;
  paletteKey: CraftCategory;
  uid?: string;
  className?: string;
}

export const CraftMotif: React.FC<MotifProps> = ({
  motif,
  paletteKey,
  uid = 'motif',
  className = '',
}) => {
  const p = PALETTES[paletteKey] || PALETTES.pashmina;
  const gradId = `g-${uid}`;

  const renderMotifPaths = () => {
    switch (motif) {
      case 'paisley':
        return (
          <>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={p.a} />
                <stop offset="1" stopColor={p.b} stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <rect width="300" height="400" fill={`url(#${gradId})`} />
            <g fill="none" stroke={p.d} strokeWidth="2">
              <path d="M150 70 C215 105 225 195 178 255 C150 290 105 285 92 250 C80 216 102 182 135 188 C158 192 168 216 152 232" />
              <path
                d="M150 95 C198 122 206 190 170 238"
                stroke={p.c}
                strokeWidth="1.2"
                strokeDasharray="1 6"
                strokeLinecap="round"
              />
            </g>
            <g fill={p.c}>
              <circle cx="150" cy="70" r="3.5" />
              <circle cx="92" cy="250" r="2.5" />
              <circle cx="152" cy="232" r="3" />
            </g>
            <g fill="none" stroke={p.c} strokeWidth="1">
              <path d="M60 330 q20 -18 40 0 q20 18 40 0 q20 -18 40 0 q20 18 40 0" />
            </g>
          </>
        );

      case 'chinarLeaf':
        return (
          <>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={p.a} />
                <stop offset="1" stopColor={p.b} stopOpacity="0.45" />
              </linearGradient>
            </defs>
            <rect width="300" height="400" fill={`url(#${gradId})`} />
            <g fill="none" stroke={p.c} strokeWidth="2" strokeLinejoin="round">
              <path d="M150 90 L163 150 L215 128 L178 175 L235 195 L175 200 L195 260 L150 215 L105 260 L125 200 L65 195 L122 175 L85 128 L137 150 Z" />
              <path d="M150 215 L150 320" strokeWidth="1.5" />
              <path d="M150 250 q-16 10 -28 4 M150 280 q16 10 28 4" strokeWidth="1" />
            </g>
            <circle cx="150" cy="90" r="3" fill={p.d} />
          </>
        );

      case 'latticeJali': {
        const cells: React.ReactNode[] = [];
        for (let y = 0; y < 5; y++) {
          for (let x = 0; x < 4; x++) {
            const cx = 60 + x * 60;
            const cy = 80 + y * 60;
            cells.push(
              <React.Fragment key={`${x}-${y}`}>
                <path
                  d={`M${cx} ${cy - 22} L${cx + 18} ${cy} L${cx} ${cy + 22} L${cx - 18} ${cy} Z`}
                  fill="none"
                  stroke={p.c}
                  strokeWidth="1.4"
                />
                <circle cx={cx} cy={cy} r="3.5" fill={p.b} />
              </React.Fragment>
            );
          }
        }
        return (
          <>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={p.a} />
                <stop offset="1" stopColor={p.b} stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <rect width="300" height="400" fill={`url(#${gradId})`} />
            {cells}
          </>
        );
      }

      case 'medallion': {
        const angles = [0, 45, 90, 135, 180, 225, 270, 315];
        return (
          <>
            <defs>
              <radialGradient id={gradId} cx="0.5" cy="0.45" r="0.8">
                <stop offset="0" stopColor={p.a} />
                <stop offset="1" stopColor={p.b} stopOpacity="0.4" />
              </radialGradient>
            </defs>
            <rect width="300" height="400" fill={`url(#${gradId})`} />
            <g fill="none" stroke={p.b} strokeWidth="1.6">
              <circle cx="150" cy="190" r="85" />
              <circle
                cx="150"
                cy="190"
                r="62"
                stroke={p.c}
                strokeDasharray="2 7"
                strokeLinecap="round"
              />
              <circle cx="150" cy="190" r="30" stroke={p.d} />
            </g>
            <g fill={p.c}>
              {angles.map((a) => {
                const r = (a * Math.PI) / 180;
                return (
                  <circle
                    key={a}
                    cx={150 + Math.cos(r) * 85}
                    cy={190 + Math.sin(r) * 85}
                    r="3"
                  />
                );
              })}
            </g>
            <path d="M150 160 q22 30 0 60 q-22 -30 0 -60 Z" fill={p.b} />
            <rect x="40" y="330" width="220" height="1.5" fill={p.d} />
            <rect x="60" y="340" width="180" height="1" fill={p.c} />
          </>
        );
      }

      case 'vineBloom':
        return (
          <>
            <defs>
              <linearGradient id={gradId} x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor={p.a} />
                <stop offset="1" stopColor={p.b} stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <rect width="300" height="400" fill={`url(#${gradId})`} />
            <g fill="none" stroke={p.b} strokeWidth="1.8" strokeLinecap="round">
              <path d="M150 340 C120 280 185 245 155 190 C130 145 175 110 150 70" />
              <path d="M150 265 q-38 -8 -48 -42 M152 200 q38 -8 48 -42 M150 130 q-34 -6 -44 -38" />
            </g>
            <g fill={p.c}>
              <circle cx="102" cy="223" r="8" />
              <circle cx="200" cy="158" r="8" />
              <circle cx="106" cy="92" r="8" />
              <circle cx="150" cy="70" r="10" fill={p.b} />
            </g>
            <g fill={p.a}>
              <circle cx="102" cy="223" r="3" />
              <circle cx="200" cy="158" r="3" />
              <circle cx="106" cy="92" r="3" />
            </g>
          </>
        );

      case 'boxRosette': {
        const angles = [0, 60, 120, 180, 240, 300];
        return (
          <>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={p.a} />
                <stop offset="1" stopColor={p.b} stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <rect width="300" height="400" fill={`url(#${gradId})`} />
            <rect
              x="70"
              y="110"
              width="160"
              height="160"
              rx="6"
              fill="none"
              stroke={p.b}
              strokeWidth="2"
            />
            <rect
              x="84"
              y="124"
              width="132"
              height="132"
              rx="4"
              fill="none"
              stroke={p.c}
              strokeWidth="1"
              strokeDasharray="2 6"
              strokeLinecap="round"
            />
            <g fill="none" stroke={p.d} strokeWidth="1.6">
              {angles.map((a) => {
                const r = (a * Math.PI) / 180;
                const cx = 150 + Math.cos(r) * 26;
                const cy = 190 + Math.sin(r) * 26;
                return (
                  <ellipse
                    key={a}
                    cx={cx}
                    cy={cy}
                    rx="13"
                    ry="7"
                    transform={`rotate(${a} ${cx} ${cy})`}
                  />
                );
              })}
            </g>
            <circle cx="150" cy="190" r="7" fill={p.c} />
            <path d="M110 310 q40 -20 80 0" fill="none" stroke={p.c} strokeWidth="1.2" />
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      className={className}
    >
      {renderMotifPaths()}
    </svg>
  );
};
