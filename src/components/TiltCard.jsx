import React, { useRef, useState } from 'react';

/**
 * TiltCard
 * A reusable React component that applies interactive 3D perspective tilts
 * and cursor-linked radial specular reflections on cards.
 */
export default function TiltCard({ 
  children, 
  className = '', 
  style = {}, 
  glowColor = 'rgba(245, 165, 36, 0.12)', 
  ...props 
}) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;

    // Disable 3D tilt on mobile/tablets for performance and touch friendliness
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;  
    
    const width = rect.width;
    const height = rect.height;
    
    const px = x / width;
    const py = y / height;
    
    // Max tilt angle (degrees)
    const maxRotate = 6;
    const rotateX = ((0.5 - py) * maxRotate).toFixed(2);
    const rotateY = ((px - 0.5) * maxRotate).toFixed(2);
    
    // Specular shine coordinates based on cursor percentage
    const glowX = (px * 100).toFixed(1);
    const glowY = (py * 100).toFixed(1);

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`,
      backgroundImage: `radial-gradient(circle 300px at ${glowX}% ${glowY}%, ${glowColor}, transparent 80%)`,
      boxShadow: `0 20px 40px rgba(0, 0, 0, 0.65), 0 0 25px ${glowColor.replace('0.12', '0.06')}`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      backgroundImage: '',
      boxShadow: '',
    });
  };

  return (
    <div
      ref={cardRef}
      className={`dashboard-card tilt-card ${className}`}
      style={{ ...style, ...tiltStyle }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Specular glass reflection layer */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
