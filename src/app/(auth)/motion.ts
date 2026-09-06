import { motion } from "framer-motion";
import { motion as motionTokens } from "@/core/design";

export const genvouchAuthMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.decelerate },
} satisfies React.ComponentProps<typeof motion.div>;