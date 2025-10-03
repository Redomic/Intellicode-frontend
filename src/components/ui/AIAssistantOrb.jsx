import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * AIAssistantOrb - Professional 3D AI Assistant Interface
 * Siri/Cortana-inspired living assistant with organic animations and sophisticated design
 * Now supports different colors for hint levels!
 * 
 * Usage:
 * <AIAssistantOrb size="lg" isActive={true} color="blue" />
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' (default: 'lg')
 * - isActive: boolean - controls animation state (default: true)
 * - className: string - additional CSS classes
 * - color: 'blue' | 'fuchsia' | 'cyan' | 'emerald' | 'amber' | 'rose' (default: 'blue')
 */
const AIAssistantOrb = ({ 
  size = 'lg', 
  isActive = true,
  className = '',
  color = 'blue',
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24',
    '3xl': 'w-32 h-32',
    '4xl': 'w-40 h-40'
  };

  // Scale factors for proportional sizing
  const scaleFactors = {
    sm: 0.5,
    md: 0.75,
    lg: 1,
    xl: 1.25,
    '2xl': 1.5,
    '3xl': 2,
    '4xl': 2.5
  };

  // Color palettes for different hint levels
  const colorPalettes = {
    blue: {
      primary: [59, 130, 246],      // blue-500
      light: [147, 197, 253],        // blue-300
      accent: [99, 102, 241]         // indigo-500
    },
    fuchsia: {
      primary: [217, 70, 239],       // fuchsia-500
      light: [240, 171, 252],        // fuchsia-300
      accent: [168, 85, 247]         // purple-500
    },
    cyan: {
      primary: [6, 182, 212],        // cyan-500
      light: [103, 232, 249],        // cyan-300
      accent: [59, 130, 246]         // blue-500
    },
    emerald: {
      primary: [16, 185, 129],       // emerald-500
      light: [110, 231, 183],        // emerald-300
      accent: [34, 197, 94]          // green-500
    },
    amber: {
      primary: [245, 158, 11],       // amber-500
      light: [252, 211, 77],         // amber-300
      accent: [249, 115, 22]         // orange-500
    },
    rose: {
      primary: [244, 63, 94],        // rose-500
      light: [253, 164, 175],        // rose-300
      accent: [239, 68, 68]          // red-500
    }
  };

  const currentPalette = colorPalettes[color] || colorPalettes.blue;
  const [r, g, b] = currentPalette.primary;
  const [lr, lg, lb] = currentPalette.light;
  const [ar, ag, ab] = currentPalette.accent;

  const containerSize = sizeClasses[size] || sizeClasses.lg;
  const scaleFactor = scaleFactors[size] || scaleFactors.lg;

  // Generate voice wave layers
  const waveLayers = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
    duration: 3 + (i * 0.1),
    amplitude: 0.8 + (i * 0.05),
  }));

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    if (onClick) onClick();
  };

  return (
    <motion.div 
      className={`relative ${containerSize} ${className} cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      // Floating animation
      animate={{
        y: isActive ? [0, -8 * scaleFactor, 0] : 0,
        rotate: isActive ? [0, 2, -2, 0] : 0,
      }}
      transition={{
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: `${-6 * scaleFactor}px`,
          background: isHovered 
            ? `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.25) 0%, rgba(161, 161, 170, 0.1) 50%, transparent 70%)`
            : `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.15) 0%, rgba(161, 161, 170, 0.05) 50%, transparent 70%)`,
          filter: `blur(${8 * scaleFactor}px)`,
        }}
        animate={isActive ? {
          scale: isHovered ? [1, 1.4, 1] : [1, 1.2, 1],
          opacity: isClicked ? [0.6, 1, 0.6] : [0.3, 0.6, 0.3],
        } : { opacity: 0.1 }}
        transition={{
          duration: isHovered ? 2 : 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Voice wave layers - Siri-style */}
      {isActive && waveLayers.map((layer) => (
        <motion.div
          key={`wave-${layer.id}`}
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              conic-gradient(from ${layer.id * 72}deg,
                transparent 0deg,
                rgba(${r}, ${g}, ${b}, ${isHovered ? 0.3 - layer.id * 0.04 : 0.2 - layer.id * 0.03}) 60deg,
                rgba(${lr}, ${lg}, ${lb}, ${isHovered ? 0.25 - layer.id * 0.03 : 0.15 - layer.id * 0.02}) 120deg,
                rgba(161, 161, 170, ${isHovered ? 0.2 : 0.1}) 150deg,
                transparent 180deg,
                rgba(${r}, ${g}, ${b}, ${isHovered ? 0.3 - layer.id * 0.04 : 0.2 - layer.id * 0.03}) 240deg,
                rgba(${lr}, ${lg}, ${lb}, ${isHovered ? 0.25 - layer.id * 0.03 : 0.15 - layer.id * 0.02}) 300deg,
                transparent 360deg
              )
            `,
            transform: `scale(${1 + layer.id * 0.1})`,
          }}
          animate={{
            rotate: layer.id % 2 === 0 ? 360 : -360,
            opacity: isClicked ? [0.8, 1, 0.8] : [0.4, 0.8, 0.4],
          }}
          transition={{
            rotate: { 
              duration: isHovered ? layer.duration * 0.7 : layer.duration, 
              repeat: Infinity, 
              ease: "linear" 
            },
            opacity: { 
              duration: isHovered ? 1.5 : 2, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: layer.delay 
            },
          }}
        />
      ))}

      {/* Breathing ring layers */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={`ring-${ring}`}
          className="absolute rounded-full border"
          style={{
            inset: `${(ring * 4 + 4) * scaleFactor}px`,
            borderColor: `rgba(${r}, ${g}, ${b}, ${0.3 - ring * 0.08})`,
            borderWidth: `${scaleFactor}px`,
          }}
          animate={isActive ? {
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.7, 0.4],
            borderColor: [
              `rgba(${r}, ${g}, ${b}, ${0.3 - ring * 0.08})`,
              `rgba(${lr}, ${lg}, ${lb}, ${0.5 - ring * 0.1})`,
              `rgba(${r}, ${g}, ${b}, ${0.3 - ring * 0.08})`
            ]
          } : { opacity: 0.2 }}
          transition={{
            duration: 3 + ring * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: ring * 0.3,
          }}
        />
      ))}

      {/* Core sphere with sophisticated gradient */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: `${12 * scaleFactor}px`,
          background: isHovered 
            ? `
              radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 1) 0%, transparent 40%),
              radial-gradient(circle at 70% 70%, rgba(${lr}, ${lg}, ${lb}, 0.8) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(161, 161, 170, 0.3) 20%, transparent 60%),
              linear-gradient(45deg, 
                rgba(${r}, ${g}, ${b}, 0.9) 0%,
                rgba(${ar}, ${ag}, ${ab}, 1) 50%,
                rgba(${r}, ${g}, ${b}, 0.9) 100%
              )
            `
            : `
              radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(${lr}, ${lg}, ${lb}, 0.6) 0%, transparent 60%),
              radial-gradient(circle at 50% 50%, rgba(161, 161, 170, 0.15) 30%, transparent 70%),
              linear-gradient(45deg, 
                rgba(${r}, ${g}, ${b}, 0.8) 0%,
                rgba(${ar}, ${ag}, ${ab}, 0.9) 50%,
                rgba(${r}, ${g}, ${b}, 0.8) 100%
              )
            `,
          boxShadow: isHovered 
            ? `
              inset 0 0 ${20 * scaleFactor}px rgba(255, 255, 255, 0.5),
              inset 0 0 ${30 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.6),
              0 0 ${35 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.5),
              0 0 ${50 * scaleFactor}px rgba(${ar}, ${ag}, ${ab}, 0.3)
            `
            : `
              inset 0 0 ${15 * scaleFactor}px rgba(255, 255, 255, 0.3),
              inset 0 0 ${25 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.4),
              0 0 ${25 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.3),
              0 0 ${40 * scaleFactor}px rgba(${ar}, ${ag}, ${ab}, 0.2)
            `
        }}
        animate={isActive ? {
          scale: isHovered ? [1, 1.12, 1] : [1, 1.08, 1],
          boxShadow: isClicked ? [
            `inset 0 0 ${25 * scaleFactor}px rgba(255, 255, 255, 0.7), 0 0 ${45 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.7)`,
            `inset 0 0 ${30 * scaleFactor}px rgba(255, 255, 255, 0.9), 0 0 ${55 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.9)`,
            `inset 0 0 ${25 * scaleFactor}px rgba(255, 255, 255, 0.7), 0 0 ${45 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.7)`
          ] : isHovered ? [
            `inset 0 0 ${20 * scaleFactor}px rgba(255, 255, 255, 0.5), 0 0 ${35 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.5)`,
            `inset 0 0 ${25 * scaleFactor}px rgba(255, 255, 255, 0.7), 0 0 ${45 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.7)`,
            `inset 0 0 ${20 * scaleFactor}px rgba(255, 255, 255, 0.5), 0 0 ${35 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.5)`
          ] : [
            `inset 0 0 ${15 * scaleFactor}px rgba(255, 255, 255, 0.3), 0 0 ${25 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.3)`,
            `inset 0 0 ${20 * scaleFactor}px rgba(255, 255, 255, 0.5), 0 0 ${35 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.5)`,
            `inset 0 0 ${15 * scaleFactor}px rgba(255, 255, 255, 0.3), 0 0 ${25 * scaleFactor}px rgba(${r}, ${g}, ${b}, 0.3)`
          ],
        } : { 
          scale: 0.9,
          opacity: 0.5 
        }}
        transition={{
          scale: { duration: isHovered ? 2 : 2.5, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: isHovered ? 2 : 2.5, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 0.5 }
        }}
      />

      {/* Inner light core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: `${12 * scaleFactor}px`,
          background: `
            radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 1) 0%, transparent 60%),
            radial-gradient(circle, 
              rgba(${lr}, ${lg}, ${lb}, 0.9) 0%,
              rgba(${r}, ${g}, ${b}, 0.6) 60%,
              transparent 80%
            )
          `,
        }}
        animate={isActive ? {
          opacity: [0.7, 1, 0.7],
          scale: [0.95, 1.1, 0.95],
        } : { opacity: 0.3 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Subtle pulse indicators */}
      {isActive && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`pulse-${i}`}
              className="absolute inset-0 rounded-full border"
              style={{
                borderColor: `rgba(${r}, ${g}, ${b}, 0.2)`
              }}
              animate={{
                scale: [1, 2],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}

      {/* Flowing data streams */}
      {isActive && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                conic-gradient(from 0deg,
                  transparent 0deg,
                  rgba(${r}, ${g}, ${b}, 0.2) 30deg,
                  transparent 90deg,
                  rgba(${lr}, ${lg}, ${lb}, 0.15) 150deg,
                  transparent 210deg,
                  rgba(${r}, ${g}, ${b}, 0.2) 270deg,
                  transparent 360deg
                )
              `,
              mask: 'radial-gradient(circle, transparent 60%, black 70%, transparent 85%)',
              filter: `blur(${0.5 * scaleFactor}px)`
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      )}

      {/* Thinking particles */}
      {isActive && (
        <>
          {[...Array(isHovered ? 10 : 6)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{ 
                width: `${2 * scaleFactor}px`,
                height: `${2 * scaleFactor}px`,
                top: `${30 + Math.random() * 40}%`, 
                left: `${30 + Math.random() * 40}%`,
                backgroundColor: `rgba(${lr}, ${lg}, ${lb}, 1)`
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: isHovered ? [0.5, 2, 0.5] : [0.5, 1.5, 0.5],
                y: [0, isHovered ? -15 * scaleFactor : -10 * scaleFactor, 0],
              }}
              transition={{
                duration: isHovered ? 1.5 + Math.random() : 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

export default AIAssistantOrb;
