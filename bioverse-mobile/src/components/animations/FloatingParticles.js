import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { colors } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const Particle = ({ delay = 0, duration = 3000, size = 4, color = colors.primary[400] }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(Math.random() * width)).current;
  const translateY = useRef(new Animated.Value(height + 50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      // Reset position
      translateX.setValue(Math.random() * width);
      translateY.setValue(height + 50);
      opacity.setValue(0);
      scale.setValue(0);

      // Create animation sequence
      Animated.sequence([
        // Fade in and scale up
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: Math.random() * 0.6 + 0.2, // Random opacity between 0.2-0.8
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: Math.random() * 0.8 + 0.5, // Random scale between 0.5-1.3
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        
        // Float upward with slight horizontal drift
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -50,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: translateX._value + (Math.random() - 0.5) * 100, // Slight drift
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
        
        // Fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Restart animation after a random delay
        setTimeout(animate, Math.random() * 2000 + 1000);
      });
    };

    // Start animation with initial delay
    const timer = setTimeout(animate, delay);
    
    return () => clearTimeout(timer);
  }, [delay, duration, translateX, translateY, opacity, scale]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [
          { translateX },
          { translateY },
          { scale },
        ],
        opacity,
      }}
    />
  );
};

const FloatingParticles = ({ 
  particleCount = 20, 
  colors: particleColors = [
    colors.primary[400],
    colors.secondary[400],
    colors.success[400],
    colors.info[400],
  ],
  style,
  ...props 
}) => {
  const particles = Array.from({ length: particleCount }, (_, index) => ({
    id: index,
    delay: Math.random() * 5000,
    duration: Math.random() * 2000 + 3000, // 3-5 seconds
    size: Math.random() * 6 + 2, // 2-8px
    color: particleColors[Math.floor(Math.random() * particleColors.length)],
  }));

  return (
    <View 
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        },
        style,
      ]}
      {...props}
    >
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          delay={particle.delay}
          duration={particle.duration}
          size={particle.size}
          color={particle.color}
        />
      ))}
    </View>
  );
};

export default FloatingParticles;