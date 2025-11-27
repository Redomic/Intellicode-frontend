import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectIsAuthenticated, selectIsOnboarded } from '../../store/userSlice';
import Navigation from '../../components/Navigation';
import AIAssistantOrb from '../../components/ui/AIAssistantOrb';
import DemoRestrictionModal from '../../components/ui/DemoRestrictionModal';

const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOnboarded = useSelector(selectIsOnboarded);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentQuote, setCurrentQuote] = useState(0);
  const [activeSide, setActiveSide] = useState('left');
  const [showBubble, setShowBubble] = useState(false);

  // AI Assistant Quotes
  const aiQuotes = [
    "I can help you solve coding questions!",
    "Ready to master algorithms together?",
    "Let's tackle some data structures!", 
    "I'm here to guide your learning journey ✨",
    "Want to practice some coding problems?",
    "I can provide hints when you're stuck!",
    "Let's build your programming confidence!",
    "Ready for your next coding challenge?",
    "I'm your AI coding companion!",
    "Let's explore algorithms step by step!",
    "Need help debugging your code?",
    "I'll explain complex concepts simply!",
    "Time to level up your coding skills!",
    "Let's solve problems efficiently together! ⚡",
    "I can break down any algorithm for you!"
  ];

  // Cycle through quotes one at a time, alternating sides
  useEffect(() => {
    const showFirstBubble = setTimeout(() => {
      setShowBubble(true);
    }, 1500);

    const cycleQuotes = () => {
      setShowBubble(false);
      
      setTimeout(() => {
        // Switch to next quote
        setCurrentQuote((prev) => (prev + 1) % aiQuotes.length);
        // Alternate sides
        setActiveSide(prev => prev === 'left' ? 'right' : 'left');
        setShowBubble(true);
      }, 300);
    };

    const interval = setInterval(cycleQuotes, 4000 + Math.random() * 2000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(showFirstBubble);
    };
  }, [aiQuotes.length]);

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 10,
    duration: Math.random() * 20 + 20,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/30 relative overflow-hidden">
      <DemoRestrictionModal />
      {/* Animated Background */}

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <motion.div 
        className="relative flex items-center justify-center px-6 py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl w-full text-center">
          {/* Centered AI Orb with Speech Bubbles */}
          <motion.div 
            className="flex justify-center mb-12 relative"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative">
              <AIAssistantOrb size="3xl" isActive={true} className="" />
              
              {/* Single Speech Bubble - Alternates Sides */}
              <motion.div
                className={`absolute top-4 hidden lg:block ${
                  activeSide === 'left' ? '-left-80' : '-right-80'
                }`}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ 
                  opacity: showBubble ? 1 : 0, 
                  scale: showBubble ? 1 : 0.9,
                  y: showBubble ? 0 : 10,
                  x: showBubble ? 0 : (activeSide === 'left' ? 15 : -15)
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="relative bg-zinc-800/95 backdrop-blur-lg rounded-xl px-4 py-3 border-2 border-zinc-600 max-w-72">
                  {/* Speech bubble tail */}
                  <div className={`absolute top-4 w-3 h-3 bg-zinc-800/95 border-zinc-600 rotate-45 ${
                    activeSide === 'left' 
                      ? '-right-1.5 border-r-2 border-t-2' 
                      : '-left-1.5 border-l-2 border-b-2'
                  }`}></div>
                  
                  <motion.p 
                    className="text-sm font-medium text-zinc-200 leading-relaxed"
                    key={`quote-${currentQuote}-${activeSide}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {aiQuotes[currentQuote]}
                  </motion.p>
                </div>
              </motion.div>

              {/* Mobile Speech Bubble - Positioned below orb */}
              <motion.div
                className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 block lg:hidden"
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ 
                  opacity: showBubble ? 1 : 0, 
                  scale: showBubble ? 1 : 0.9,
                  y: showBubble ? 0 : -10 
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="relative bg-zinc-800/95 backdrop-blur-lg rounded-xl px-4 py-3 border-2 border-zinc-600 max-w-80">
                  {/* Speech bubble tail pointing up */}
                  <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-zinc-800/95 rotate-45 border-l-2 border-t-2 border-zinc-600"></div>
                  
                  <motion.p 
                    className="text-sm font-medium text-zinc-200 text-center leading-relaxed"
                    key={`mobile-${currentQuote}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {aiQuotes[currentQuote]}
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-6xl font-thin tracking-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span className="bg-gradient-to-r from-zinc-100 via-blue-100 to-zinc-200 bg-clip-text text-transparent font-medium">
              Master Data Structures
            </span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-zinc-400 via-blue-400 to-zinc-500 bg-clip-text text-transparent font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              & Algorithms
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-zinc-400 font-light leading-relaxed mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            An intelligent tutoring system that adapts to your learning pace. 
            Practice problems, track progress, and build confidence through personalized challenges.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {isAuthenticated ? (
              isOnboarded ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="inline-block px-8 py-4 bg-gradient-to-r from-zinc-100 to-blue-50 text-zinc-900 font-medium rounded-lg hover:from-blue-50 hover:to-white hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 border border-blue-100/50"
                  >
                    Continue Learning
                  </Link>
                  <a 
                    href="#publication" 
                    className="inline-block px-8 py-4 bg-transparent text-zinc-300 font-medium rounded-lg border-2 border-zinc-600 hover:border-blue-500 hover:text-blue-300 hover:bg-blue-950/20 transition-all duration-200"
                  >
                    Publication
                  </a>
                </>
              ) : (
                <>
                  <Link 
                    to="/onboarding" 
                    className="inline-block px-8 py-4 bg-gradient-to-r from-zinc-100 to-blue-50 text-zinc-900 font-medium rounded-lg hover:from-blue-50 hover:to-white hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 border border-blue-100/50"
                  >
                    Complete Your Setup
                  </Link>
                  <a 
                    href="#publication" 
                    className="inline-block px-8 py-4 bg-transparent text-zinc-300 font-medium rounded-lg border-2 border-zinc-600 hover:border-blue-500 hover:text-blue-300 hover:bg-blue-950/20 transition-all duration-200"
                  >
                    Publication
                  </a>
                </>
              )
            ) : (
              <>
                <Link 
                  to="/onboarding" 
                  className="inline-block px-8 py-4 bg-gradient-to-r from-zinc-100 to-blue-50 text-zinc-900 font-medium rounded-lg hover:from-blue-50 hover:to-white hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 border border-blue-100/50"
                >
                  Start Learning
                </Link>
                <a 
                  href="#publication" 
                  className="inline-block px-8 py-4 bg-transparent text-zinc-300 font-medium rounded-lg border-2 border-zinc-600 hover:border-blue-500 hover:text-blue-300 hover:bg-blue-950/20 transition-all duration-200"
                >
                  Publication
                </a>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div 
        className="relative px-6 py-16 border-t border-blue-900/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Features Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-blue-900/15 to-blue-950/10" />
        
        <div className="max-w-6xl mx-auto relative">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ y: 40 }}
            whileInView={{ y: 0 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                title: "Adaptive Learning",
                description: "Problems adjust to your skill level and learning pace for optimal growth.",
                gradient: "from-blue-500/25 to-cyan-500/25"
              },
              {
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                title: "Progress Tracking",
                description: "Monitor your improvement with detailed analytics and insights.",
                gradient: "from-blue-600/25 to-blue-400/25"
              },
              {
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                title: "Daily Challenges",
                description: "Build consistent habits with curated problems every day.",
                gradient: "from-indigo-500/25 to-blue-500/25"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group relative text-center p-6 rounded-xl bg-zinc-800/30 backdrop-blur-sm border border-blue-900/30 hover:border-blue-600/50 hover:bg-blue-950/20 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                viewport={{ once: true }}
              >
                {/* Card Glow Effect */}
                <motion.div
                  className={`absolute -inset-px bg-gradient-to-r ${feature.gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10`}
                  initial={false}
                />
                
                {/* Icon Container */}
                <motion.div
                  className="relative w-16 h-16 bg-gradient-to-br from-zinc-700 via-blue-900/20 to-zinc-800 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:from-blue-700/30 group-hover:to-blue-800/30 transition-all duration-300 border border-blue-900/20 group-hover:border-blue-600/30"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.svg 
                    className="w-8 h-8 text-zinc-300 group-hover:text-blue-200 transition-colors duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </motion.svg>
                  
                  {/* Icon Glow */}
                  <div className="absolute inset-0 bg-blue-500/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-semibold text-zinc-100 mb-3 group-hover:text-white transition-colors duration-300"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  {feature.title}
                </motion.h3>
                
                <motion.p 
                  className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors duration-300"
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                >
                  {feature.description}
                </motion.p>
                
                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-300/80 rounded-full shadow-sm shadow-blue-400/50"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${20 + i * 20}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        className="relative px-6 py-8 border-t border-blue-900/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <motion.p 
              className="text-sm text-zinc-500"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              © {new Date().getFullYear()} Redomic Labs Private Limited. All rights reserved.
            </motion.p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default HomePage;
