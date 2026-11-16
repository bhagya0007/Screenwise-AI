import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'success' | 'warning' | 'danger' | 'navy' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    teal: 'bg-[#edf7f5] text-[#2c726a] border-[#bfe3de]',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    navy: 'bg-[#e8edf2] text-[#173A56] border-[#cbd5e1]',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-white text-slate-600 border-slate-300',
  }[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-sans tracking-tight ${variantStyles} ${sizeStyles} ${className}`}
    >
      {children}
    </span>
  );
};
