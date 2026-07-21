import { motion } from 'framer-motion';

export function Panel({ title, subtitle, icon: Icon, badge, children, className = '', delay = 0, span }) {
  const spanClass = span ? `panel-span-${span}` : '';
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`panel ${spanClass} ${className}`}
    >
      {(title || badge) && (
        <div className="panel-header">
          <div className="panel-header-left">
            {Icon && (
              <div className="panel-header-icon">
                <Icon size={18} />
              </div>
            )}
            <div>
              {title && <h3 className="panel-title">{title}</h3>}
              {subtitle && <p className="panel-subtitle">{subtitle}</p>}
            </div>
          </div>
          {badge}
        </div>
      )}
      <div className="panel-body">{children}</div>
    </motion.section>
  );
}

export function SectionTitle({ icon: Icon, title, tone = 'default' }) {
  return (
    <h3 className={`section-title section-title--${tone}`}>
      {Icon && <Icon size={16} />}
      {title}
    </h3>
  );
}
