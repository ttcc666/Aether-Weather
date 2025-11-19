import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`backdrop-blur-2xl bg-white/10 border border-white/20 shadow-xl rounded-3xl p-6 ${className}`}>
      {children}
    </div>
  );
};