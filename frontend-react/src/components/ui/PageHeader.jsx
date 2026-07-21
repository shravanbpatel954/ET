export function PageHeader({ eyebrow, title, description, icon: Icon, action, badge }) {
  return (
    <header className="page-header">
      <div className="page-header-content">
        {eyebrow && (
          <div className="eyebrow">
            {Icon && <Icon size={14} />}
            {eyebrow}
          </div>
        )}
        <div className="page-header-title-row">
          <h1 className="page-title">{title}</h1>
          {badge}
        </div>
        {description && <p className="page-copy">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  );
}
