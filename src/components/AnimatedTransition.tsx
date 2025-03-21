import React, { useRef, useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

interface FadeProps {
  children: React.ReactNode;
  in?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

// 淡入淡出动画组件
export const Fade: React.FC<FadeProps> = ({ 
  children, 
  in: inProp = true, 
  duration = 300, 
  delay = 0,
  className = '',
  style = {}
}) => {
  const nodeRef = useRef(null);
  
  return (
    <CSSTransition
      in={inProp}
      timeout={duration + delay}
      classNames="fade"
      unmountOnExit
      nodeRef={nodeRef}
    >
      <div 
        ref={nodeRef}
        className={`fade-transition ${className}`}
        style={{
          ...style,
          transition: `opacity ${duration}ms ease-in-out ${delay}ms, transform ${duration}ms ease-in-out ${delay}ms`,
        }}
      >
        {children}
      </div>
    </CSSTransition>
  );
};

// 滑动动画组件
interface SlideProps extends FadeProps {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export const Slide: React.FC<SlideProps> = ({
  children,
  in: inProp = true,
  duration = 300,
  delay = 0,
  direction = 'up',
  distance = 20,
  className = '',
  style = {}
}) => {
  const nodeRef = useRef(null);
  const [initialStyle, setInitialStyle] = useState({});
  
  useEffect(() => {
    // 根据方向设置初始样式
    const directionStyles = {
      up: { transform: `translateY(${distance}px)` },
      down: { transform: `translateY(-${distance}px)` },
      left: { transform: `translateX(${distance}px)` },
      right: { transform: `translateX(-${distance}px)` }
    };
    
    setInitialStyle(directionStyles[direction]);
  }, [direction, distance]);
  
  return (
    <CSSTransition
      in={inProp}
      timeout={duration + delay}
      classNames="slide"
      unmountOnExit
      nodeRef={nodeRef}
    >
      <div
        ref={nodeRef}
        className={`slide-transition ${className}`}
        style={{
          ...style,
          ...initialStyle,
          opacity: inProp ? 1 : 0,
          transition: `opacity ${duration}ms ease-in-out ${delay}ms, transform ${duration}ms ease-in-out ${delay}ms`,
        }}
      >
        {children}
      </div>
    </CSSTransition>
  );
};

// 缩放动画组件
interface ScaleProps extends FadeProps {
  startScale?: number;
}

export const Scale: React.FC<ScaleProps> = ({
  children,
  in: inProp = true,
  duration = 300,
  delay = 0,
  startScale = 0.9,
  className = '',
  style = {}
}) => {
  const nodeRef = useRef(null);
  
  return (
    <CSSTransition
      in={inProp}
      timeout={duration + delay}
      classNames="scale"
      unmountOnExit
      nodeRef={nodeRef}
    >
      <div
        ref={nodeRef}
        className={`scale-transition ${className}`}
        style={{
          ...style,
          transform: inProp ? 'scale(1)' : `scale(${startScale})`,
          opacity: inProp ? 1 : 0,
          transition: `opacity ${duration}ms ease-in-out ${delay}ms, transform ${duration}ms ease-in-out ${delay}ms`,
        }}
      >
        {children}
      </div>
    </CSSTransition>
  );
};

// 全局CSS样式
export const AnimationStyles = () => (
  <style>{`
    .fade-transition {
      will-change: opacity, transform;
    }
    
    .fade-enter {
      opacity: 0;
      transform: translateY(10px);
    }
    
    .fade-enter-active {
      opacity: 1;
      transform: translateY(0);
    }
    
    .fade-exit {
      opacity: 1;
      transform: translateY(0);
    }
    
    .fade-exit-active {
      opacity: 0;
      transform: translateY(-10px);
    }
    
    .slide-transition {
      will-change: opacity, transform;
    }
    
    .slide-enter {
      opacity: 0;
    }
    
    .slide-enter-active {
      opacity: 1;
      transform: translateY(0) translateX(0);
    }
    
    .slide-exit {
      opacity: 1;
      transform: translateY(0) translateX(0);
    }
    
    .slide-exit-active {
      opacity: 0;
    }
    
    .scale-transition {
      will-change: opacity, transform;
    }
    
    .scale-enter {
      opacity: 0;
    }
    
    .scale-enter-active {
      opacity: 1;
      transform: scale(1);
    }
    
    .scale-exit {
      opacity: 1;
      transform: scale(1);
    }
    
    .scale-exit-active {
      opacity: 0;
    }
  `}</style>
); 