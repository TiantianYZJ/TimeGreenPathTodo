import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
  className?: string;
}

export function Skeleton({ width, height = 16, borderRadius, style, className }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${className || ''}`}
      style={{
        width,
        height,
        borderRadius: borderRadius ?? 'var(--radius-md)',
        ...style,
      }}
    />
  );
}

export function SkeletonCircle({ size = 40, style }: { size?: number; style?: CSSProperties }) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="50%"
      style={style}
    />
  );
}

export function SkeletonCard({ lines = 3, style }: { lines?: number; style?: CSSProperties }) {
  return (
    <div style={{ padding: '16px 20px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <SkeletonCircle size={36} />
        <div style={{ flex: 1 }}>
          <Skeleton width="40%" height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="25%" height={12} />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
          style={{ marginBottom: i < lines - 1 ? 10 : 0 }}
        />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5, style }: { count?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {Array.from({ count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Skeleton width={20} height={20} borderRadius={4} />
            <div style={{ flex: 1 }}>
              <Skeleton width={`${60 + Math.random() * 30}%`} height={15} style={{ marginBottom: 8 }} />
              <Skeleton width={`${30 + Math.random() * 20}%`} height={12} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-card)', ...style }}>
      <Skeleton width="50%" height={12} style={{ marginBottom: 12 }} />
      <Skeleton width="30%" height={28} />
    </div>
  );
}

export function SkeletonStatsGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
    </div>
  );
}
