export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'badge',
    success: 'badge badge-success',
    warning: 'badge badge-warning',
    danger: 'badge badge-danger',
    info: 'badge badge-info',
    live: 'badge badge-live',
  };
  return <span className={`${variants[variant] || variants.default} ${className}`}>{children}</span>;
}
