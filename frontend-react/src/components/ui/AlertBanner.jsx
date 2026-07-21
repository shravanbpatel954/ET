import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const variants = {
  info: { icon: Info, wrap: 'border-primary/30 bg-primary/10 text-slate-200' },
  success: { icon: CheckCircle2, wrap: 'border-success/30 bg-success/10 text-slate-200' },
  warning: { icon: AlertTriangle, wrap: 'border-warning/30 bg-warning/10 text-slate-200' },
  danger: { icon: AlertTriangle, wrap: 'border-danger/30 bg-danger/10 text-slate-200' },
};

export function AlertBanner({ variant = 'info', title, children, onDismiss }) {
  const { icon: Icon, wrap } = variants[variant];
  return (
    <div className={`flex gap-3 rounded-[16px] border px-4 py-3 ${wrap}`} role="alert">
      <Icon size={18} className="mt-0.5 shrink-0 opacity-90" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-medium text-white">{title}</p>}
        {children && <p className="mt-0.5 text-sm text-muted">{children}</p>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 text-muted hover:text-white" aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
