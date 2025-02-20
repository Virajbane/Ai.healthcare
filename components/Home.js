"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Brain, Shield, Users, ArrowRight } from "lucide-react";
import Image from "next/image";

const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: <Brain className="w-12 h-12 text-blue-500" />,
      title: "AI-Powered Diagnosis",
      description: "Our advanced AI analyzes symptoms and medical history to suggest potential diagnoses with remarkable accuracy."
    },
    {
      icon: <Activity className="w-12 h-12 text-teal-500" />,
      title: "Real-time Monitoring",
      description: "Track vital signs and health metrics in real-time with intuitive visualizations and personalized insights."
    },
    {
      icon: <Shield className="w-12 h-12 text-purple-500" />,
      title: "Secure Health Records",
      description: "Your medical data is encrypted and protected with state-of-the-art security protocols."
    },
    {
      icon: <Users className="w-12 h-12 text-green-500" />,
      title: "Connect with Specialists",
      description: "Instantly connect with healthcare professionals specialized in your specific needs."
    }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen text-white pt-32">
      {/* Hero Section */}
      <motion.section 
        className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        transition={{ staggerChildren: 0.2 }}
      >
        <motion.div 
          className="lg:w-1/2"
          variants={fadeIn}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            variants={fadeIn}
          >
            Healthcare Transformed by{" "}
            <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-300 mb-8"
            variants={fadeIn}
          >
            Experience the future of healthcare with personalized AI diagnosis, 
            real-time monitoring, and instant access to medical professionals.
          </motion.p>
          <motion.div 
            className="flex flex-wrap gap-4"
            variants={fadeIn}
          >
            <button className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3 border border-gray-600 rounded-full font-medium hover:bg-white/10 transition-all">
              Learn More
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="lg:w-1/2 relative"
          variants={fadeIn}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative h-80 w-full md:h-96 md:w-96 mx-auto">
            {/* This is a placeholder for an image - in production, use your actual image */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-teal-500/30 animate-pulse"></div>
              <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-teal-500/10 to-blue-500/10 flex items-center justify-center">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-r from-teal-500/30 to-blue-500/30 flex items-center justify-center">
                  <Brain className="w-24 h-24 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* AI Features Section */}
      <motion.section
        className="container mx-auto px-4 py-24"
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <motion.h2 
          className="text-3xl font-bold text-center mb-4"
          variants={fadeIn}
        >
          Advanced AI Healthcare Features
        </motion.h2>
        <motion.p 
          className="text-gray-400 text-center mb-16 max-w-2xl mx-auto"
          variants={fadeIn}
        >
          Our platform combines cutting-edge artificial intelligence with medical expertise to provide you with the best possible healthcare experience.
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/10 transition-all border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.7 + (index * 0.1), duration: 0.6 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="bg-gradient-to-r from-blue-900/20 to-teal-900/20 rounded-2xl p-8 border border-blue-900/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">99%</h3>
              <p className="text-gray-400">Diagnostic Accuracy</p>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-3xl md:text-4xl font-bold text-teal-400 mb-2">24/7</h3>
              <p className="text-gray-400">Monitoring Support</p>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">10M+</h3>
              <p className="text-gray-400">Users Worldwide</p>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-3xl md:text-4xl font-bold text-green-400 mb-2">1,000+</h3>
              <p className="text-gray-400">Specialist Doctors</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="container mx-auto px-4 py-20"
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            whileInView={{ scale: [0.9, 1] }}
            transition={{ duration: 0.5 }}
          >
            Ready to experience healthcare powered by AI?
          </motion.h2>
          <motion.p 
            className="text-gray-300 mb-8 text-lg"
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join thousands of people who have transformed their healthcare experience with our AI-powered platform.
          </motion.p>
          <motion.button 
            className="px-10 py-4 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full font-medium text-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Free Trial Today
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;