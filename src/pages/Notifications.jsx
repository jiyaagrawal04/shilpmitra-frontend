import { motion } from 'framer-motion';
import { notifications } from '../data/demoData';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const typeColors = { funding: 'bg-primary-fixed text-primary', payment: 'bg-secondary-fixed text-secondary', document: 'bg-tertiary-fixed text-tertiary', milestone: 'bg-[#e8f5e9] text-[#2e7d32]' };

export default function Notifications() {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} className="page-container space-y-lg pb-8">
      <motion.div variants={fadeUp}>
        <h2 className="font-h1-display text-h1-display text-on-surface">Notifications</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">सूचनाएं</p>
      </motion.div>
      <div className="space-y-sm">
        {notifications.map((n) => (
          <motion.div key={n.id} variants={fadeUp}
            className={`card p-md flex items-start gap-md ${!n.read ? 'bg-primary-fixed/10 border-primary/20' : 'bg-surface-container-lowest'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[n.type] || typeColors.payment}`}>
              <span className="material-symbols-outlined filled">{n.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-body-md text-body-md font-semibold text-on-surface">{n.title}</h3>
                {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 flex-shrink-0" />}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-xs">{n.body}</p>
              <p className="font-label-caps text-label-caps text-outline mt-sm">{n.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
