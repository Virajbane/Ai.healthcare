"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Heart, Droplet, Thermometer, Clock, BrainCircuit, ChevronRight, ChevronLeft, AlertTriangle } from "lucide-react";

const VitalsMonitoring = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [vitalsData, setVitalsData] = useState({
    heartRate: { current: 72, min: 60, max: 100, unit: "bpm" },
    bloodPressure: { systolic: 120, diastolic: 80, unit: "mmHg" },
    bloodOxygen: { current: 98, min: 95, max: 100, unit: "%" },
    temperature: { current: 98.6, min: 97, max: 99, unit: "°F" },
    respirationRate: { current: 16, min: 12, max: 20, unit: "br/min" }
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVitalsData(prev => ({
        ...prev,
        heartRate: { 
          ...prev.heartRate, 
          current: Math.floor(prev.heartRate.current + (Math.random() * 3 - 1.5))
        },
        bloodOxygen: {
          ...prev.bloodOxygen,
          current: Math.min(100, Math.max(94, prev.bloodOxygen.current + (Math.random() * 0.6 - 0.3)))
        }
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const vitalCards = [
    {
      title: "Heart Rate",
      icon: <Heart className="w-6 h-6 text-red-500" />,
      color: "from-red-500/20 to-red-600/10",
      textColor: "text-red-400",
      value: vitalsData.heartRate.current,
      unit: vitalsData.heartRate.unit,
      normalRange: `${vitalsData.heartRate.min}-${vitalsData.heartRate.max}`,
      isNormal: vitalsData.heartRate.current >= vitalsData.heartRate.min && 
                vitalsData.heartRate.current <= vitalsData.heartRate.max,
      history: [68, 70, 71, 73, 75, 74, 72]
    },
    {
      title: "Blood Pressure",
      icon: <Activity className="w-6 h-6 text-blue-500" />,
      color: "from-blue-500/20 to-blue-600/10",
      textColor: "text-blue-400",
      value: `${vitalsData.bloodPressure.systolic}/${vitalsData.bloodPressure.diastolic}`,
      unit: vitalsData.bloodPressure.unit,
      normalRange: "90-120/60-80",
      isNormal: vitalsData.bloodPressure.systolic >= 90 && 
                vitalsData.bloodPressure.systolic <= 120 &&
                vitalsData.bloodPressure.diastolic >= 60 &&
                vitalsData.bloodPressure.diastolic <= 80
    },
    {
      title: "Blood Oxygen",
      icon: <Droplet className="w-6 h-6 text-blue-400" />,
      color: "from-blue-400/20 to-blue-500/10",
      textColor: "text-blue-300",
      value: vitalsData.bloodOxygen.current.toFixed(1),
      unit: vitalsData.bloodOxygen.unit,
      normalRange: `${vitalsData.bloodOxygen.min}+`,
      isNormal: vitalsData.bloodOxygen.current >= vitalsData.bloodOxygen.min,
      history: [97.8, 98.1, 98.4, 98.2, 97.9, 98.0, 98.1]
    },
    {
      title: "Temperature",
      icon: <Thermometer className="w-6 h-6 text-orange-500" />,
      color: "from-orange-500/20 to-orange-600/10",
      textColor: "text-orange-400",
      value: vitalsData.temperature.current,
      unit: vitalsData.temperature.unit,
      normalRange: `${vitalsData.temperature.min}-${vitalsData.temperature.max}`,
      isNormal: vitalsData.temperature.current >= vitalsData.temperature.min && 
                vitalsData.temperature.current <= vitalsData.temperature.max
    },
    {
      title: "Respiration Rate",
      icon: <BrainCircuit className="w-6 h-6 text-green-500" />,
      color: "from-green-500/20 to-green-600/10",
      textColor: "text-green-400",
      value: vitalsData.respirationRate.current,
      unit: vitalsData.respirationRate.unit,
      normalRange: `${vitalsData.respirationRate.min}-${vitalsData.respirationRate.max}`,
      isNormal: vitalsData.respirationRate.current >= vitalsData.respirationRate.min && 
                vitalsData.respirationRate.current <= vitalsData.respirationRate.max
    }
  ];

  const nextCard = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % vitalCards.length);
      setIsVisible(true);
    }, 300);
  };

  const prevCard = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + vitalCards.length) % vitalCards.length);
      setIsVisible(true);
    }, 300);
  };

  // Chart animation variants
  const chartVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const pointVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col h-full pt-24 pb-6 bg-gradient-to-b from-gray-900 to-black text-white overflow-auto">
      <div className="container mx-auto px-4">
        {/* Header & Summary */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Vitals Monitoring
          </h1>
          <p className="text-gray-400">
            Real-time monitoring of your vital signs and health metrics
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 bg-gray-800 rounded-xl p-5 border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Overall Status</h3>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Healthy</span>
              </div>
              <p className="text-gray-400">
                All vitals are within normal range. Last sync: 2 minutes ago.
              </p>
            </div>
            
            <motion.div 
              className="flex-initial bg-gradient-to-br from-teal-500/20 to-blue-600/20 rounded-xl p-5 border border-blue-500/30"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">Next Check-up</h3>
                  <p className="text-blue-300">Mar 15, 2025</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Vitals Card Carousel */}
        <div className="mb-12 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Key Vital Signs</h2>
            <div className="flex gap-2">
              <button 
                onClick={prevCard}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextCard}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <motion.div
            className="w-full bg-gradient-to-br border border-gray-700 rounded-xl p-6"
            style={{ background: `linear-gradient(135deg, ${vitalCards[currentIndex].color})` }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              scale: isVisible ? 1 : 0.95,
              y: isVisible ? 0 : 10
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  {vitalCards[currentIndex].icon}
                </div>
                <div>
                  <h3 className="text-xl font-medium">{vitalCards[currentIndex].title}</h3>
                  <p className={`${vitalCards[currentIndex].textColor}`}>
                    Normal range: {vitalCards[currentIndex].normalRange} {vitalCards[currentIndex].unit}
                  </p>
                </div>
              </div>
              
              {!vitalCards[currentIndex].isNormal && (
                <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 rounded-full">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300">Attention needed</span>
                </div>
              )}
            </div>
            
            <div className="flex items-end gap-3 mb-6">
              <div className="flex items-end">
                <motion.span 
                  className="text-4xl font-bold"
                  key={`value-${currentIndex}-${vitalCards[currentIndex].value}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {vitalCards[currentIndex].value}
                </motion.span>
                <span className="text-xl text-gray-400 ml-1">
                  {vitalCards[currentIndex].unit}
                </span>
              </div>
            </div>
            
            {vitalCards[currentIndex].history && (
              <div className="mt-6 h-20 flex items-end">
                <motion.div 
                  className="w-full flex items-end justify-between gap-2"
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {vitalCards[currentIndex].history.map((point, i) => {
                    const height = Math.max(20, Math.min(80, (point / 100) * 60 + 20));
                    return (
                      <motion.div
                        key={i}
                        className="relative flex flex-col items-center"
                        variants={pointVariants}
                      >
                        <div 
                          className={`w-8 ${vitalCards[currentIndex].textColor} rounded-t-sm bg-gradient-to-t from-transparent`}
                          style={{ 
                            height: `${height}px`,
                            opacity: 0.5 + ((i / vitalCards[currentIndex].history.length) * 0.5)
                          }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1">
                          {i === 0 ? '24h' : i === vitalCards[currentIndex].history.length - 1 ? 'Now' : ''}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            )}
          </motion.div>
          
          {/* Indicator Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {vitalCards.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-teal-500' : 'bg-gray-600'}`}
                animate={{
                  scale: index === currentIndex ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: index === currentIndex ? Infinity : 0,
                  repeatDelay: 2
                }}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-medium mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              {
                time: "Today, 9:15 AM",
                event: "Heart rate increased to 85 bpm during your morning run",
                icon: <Heart className="w-5 h-5 text-red-400" />,
                color: "bg-red-500/10"
              },
              {
                time: "Yesterday, 11:30 PM",
                event: "Blood oxygen dropped to 95% briefly during sleep",
                icon: <Droplet className="w-5 h-5 text-blue-400" />,
                color: "bg-blue-500/10"
              },
              {
                time: "Feb 20, 3:45 PM",
                event: "Weekly vitals report generated - Overall status: Excellent",
                icon: <Activity className="w-5 h-5 text-green-400" />,
                color: "bg-green-500/10"
              }
            ].map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (index * 0.1) }}
                whileHover={{ x: 3 }}
              >
                <div className={`p-2 ${activity.color} rounded-lg flex-shrink-0 mt-1`}>
                  {activity.icon}
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">{activity.time}</span>
                  <p className="text-gray-300">{activity.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VitalsMonitoring;