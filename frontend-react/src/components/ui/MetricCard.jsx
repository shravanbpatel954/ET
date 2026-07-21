import { Card } from './Card';
import { StatusBadge } from './StatusBadge';

export function MetricCard({ label, value, icon: Icon, trend, trendLabel, variant = 'default' }) {
  const iconBg = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
  }[variant];

  return (
    <Card padding="p-5" className="bg-surface min-w-0">
      <div className="flex items-start justify-between gap-3 mb-4">
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
        {trendLabel && (
          <StatusBadge tone={trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'neutral'}>
            {trendLabel}
          </StatusBadge>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-white tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
  );
}
