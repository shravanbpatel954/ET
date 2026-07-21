import { motion } from 'framer-motion';

export function Card({ children, className = '', padding = 'p-6', hover = false, ...props }) {
  const base =
    'rounded-[16px] border border-[var(--color-border)] bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.24)]';
  const hoverCls = hover ? 'transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.32)]' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`${base} ${padding} ${hoverCls} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
