import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const CountUp = ({ 
  from = 0, 
  to, 
  duration = 1, 
  separator = '', 
  direction = 'up',
  className = '',
  decimals = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(from);
  const elementRef = useRef(null);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setCount(from);
      startTimeRef.current = null;
      return;
    }

    startTimeRef.current = null;
    setCount(from);

    const animate = (currentTime) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = (currentTime - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = from + (to - from) * easeOut;
      setCount(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, from, to, duration]);

  const formatNumber = (value) => {
    const num = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  };

  const displayValue = direction === 'up' ? count : to - count;

  return (
    <motion.span
      ref={elementRef}
      className={className}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {formatNumber(displayValue)}
    </motion.span>
  );
};

export default CountUp;

