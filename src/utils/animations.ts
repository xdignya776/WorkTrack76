
import { useEffect, useState } from 'react';

// Staggered animation entrance for elements
export const useStaggeredAnimation = (
  totalItems: number,
  baseDelay: number = 100
): number[] => {
  return Array.from({ length: totalItems }, (_, i) => baseDelay * i);
};

// Intersection observer animation hook
export const useAnimateOnScroll = (
  ref: React.RefObject<HTMLElement>,
  animationClass: string,
  threshold: number = 0.2
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            ref.current.classList.add(animationClass);
          }
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, animationClass, threshold]);

  return isVisible;
};

// Page transition animation
export const pageTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Smooth scroll to element function
export const scrollToElement = (
  elementId: string,
  offset: number = 0,
  behavior: ScrollBehavior = 'smooth'
): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior,
    });
  }
};
