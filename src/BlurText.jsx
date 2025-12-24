import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const BlurText = ({ 
  text, 
  delay = 0, 
  animateBy = 'words', 
  direction = 'top',
  onAnimationComplete,
  className = '',
  immediate = false
}) => {
  const [isVisible, setIsVisible] = useState(immediate);
  const elementRef = useRef(null);

  useEffect(() => {
    if (immediate) {
      setIsVisible(true);
      return;
    }

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
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [immediate]);

  const getInitialPosition = () => {
    switch (direction) {
      case 'top':
        return { y: -20, opacity: 0 };
      case 'bottom':
        return { y: 20, opacity: 0 };
      case 'left':
        return { x: -20, opacity: 0 };
      case 'right':
        return { x: 20, opacity: 0 };
      default:
        return { y: -20, opacity: 0 };
    }
  };

  const getFinalPosition = () => {
    switch (direction) {
      case 'top':
      case 'bottom':
        return { y: 0, opacity: 1 };
      case 'left':
      case 'right':
        return { x: 0, opacity: 1 };
      default:
        return { y: 0, opacity: 1 };
    }
  };

  const splitText = () => {
    if (animateBy === 'words') {
      return text.split(' ');
    } else if (animateBy === 'chars') {
      return text.split('');
    }
    return [text];
  };

  const words = splitText();

  // Use block display for headings and long text
  const useBlock = className.includes('h1') || className.includes('h2') || className.includes('h3') || text.length > 50;
  const Wrapper = useBlock ? motion.div : motion.span;
  const wrapperStyle = useBlock 
    ? { display: 'block', width: '100%' } 
    : { display: 'inline' };

  // For h1, inherit gradient text styles
  const isH1 = className.includes('h1-title');
  const isH2 = className.includes('h2') || className.includes('feature-item');
  const h1GradientStyle = isH1 ? {
    background: 'linear-gradient(135deg, #ffffff 0%, #e8f0ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  } : {};
  
  const h2GradientStyle = isH2 ? {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.85) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  } : {};

  // Hero section gets faster animation
  const isHero = className.includes('hero-blur');
  const isH1Title = className.includes('h1-title');
  const isFeatureItem = className.includes('feature-item');
  // H1 title gets even faster animation, feature items also get faster
  const duration = isH1Title ? 0.4 : (isFeatureItem ? 0.5 : (isHero ? 0.6 : 0.8));
  const wordDelay = isH1Title ? 0.05 : (isFeatureItem ? 0.06 : (isHero ? 0.08 : 0.12));

  return (
    <Wrapper
      ref={elementRef}
      className={className}
      style={{
        ...wrapperStyle,
        ...h1GradientStyle,
        ...h2GradientStyle
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{
            ...getInitialPosition(),
            filter: 'blur(10px)'
          }}
          animate={isVisible ? {
            ...getFinalPosition(),
            filter: 'blur(0px)'
          } : {
            ...getInitialPosition(),
            filter: 'blur(10px)'
          }}
          transition={{
            duration: duration,
            delay: delay / 1000 + index * wordDelay,
            ease: [0.4, 0, 0.2, 1]
          }}
          onAnimationComplete={() => {
            if (index === words.length - 1 && onAnimationComplete) {
              onAnimationComplete();
            }
          }}
          style={{ 
            display: 'inline-block', 
            marginRight: animateBy === 'words' ? '0.25em' : '0.05em',
            ...(isH1 ? {
              background: 'linear-gradient(135deg, #ffffff 0%, #e8f0ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            } : {}),
            ...(isH2 ? {
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.85) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            } : {})
          }}
        >
          {word}
          {animateBy === 'words' && index < words.length - 1 && ' '}
        </motion.span>
      ))}
    </Wrapper>
  );
};

export default BlurText;

