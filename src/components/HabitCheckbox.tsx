import { motion } from 'framer-motion';

interface Props {
  checked: boolean;
  color: string;
}

export function HabitCheckbox({ checked, color }: Props) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Spring-bouncing checkbox */}
      <motion.div
        whileTap={{ scale: 0.85 }}
        animate={{
          scale: checked ? [1, 1.15, 1] : 1,
          backgroundColor: checked ? color : 'rgba(255,255,255,0.03)',
          borderColor: checked ? color : 'rgba(255,255,255,0.2)',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border-2"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-black" fill="none">
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{
              pathLength: checked ? 1 : 0,
              opacity: checked ? 1 : 0,
            }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>
    </div>
  );
}