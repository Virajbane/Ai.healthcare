// app/doctor/page.tsx
"use client";
import { motion } from 'framer-motion';
import DoctorChat from "@/components/DoctorChat";
import DoctorDashboard from "@/components/DoctorDash";

export default function DoctorPage() {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        y: 20
      }}
      animate={{ 
        opacity: 1,
        y: 0
      }}
      exit={{ 
        opacity: 0,
        y: -20
      }}
      transition={{ 
        duration: 1.2,
        ease: "easeInOut"
      }}
    >
      <DoctorDashboard />
    </motion.div>
  );
}