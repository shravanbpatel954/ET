import { motion } from 'framer-motion';

export function StatCard({ icon: Icon, iconTone = 'blue', label, value, badge, delay = 0, href }) {
  const Wrapper = href ? 'a' : motion.div;
  const props = href
    ? { href, className: `stat-card stat-card--${iconTone} stat-card--link` }
    : {
        initial: { y: 16, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { delay, duration: 0.35 },
        className: `stat-card stat-card--${iconTone}`,
      };

  return (
    <Wrapper {...props}>
      <div className="stat-card-top">
        <div className="stat-card-icon">
          <Icon size={22} />
        </div>
        {badge && <span className="stat-card-badge">{badge}</span>}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </Wrapper>
  );
}
