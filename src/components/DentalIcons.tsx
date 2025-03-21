import React from "react";

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

// 牙齿图标 - 更现代化的设计
export const ToothIcon: React.FC<IconProps> = ({ className, style }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="toothGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e88e5" />
          <stop offset="100%" stopColor="#26c6da" />
        </linearGradient>
        <filter id="toothShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <path
        fill="url(#toothGradient)"
        d="M32,4C18.7,4,12,12.7,12,20c0,7.3,2,16,4,22c2,6,4,14,8,14s6-4,8-4s4,4,8,4s6-8,8-14c2-6,4-14.7,4-22
        C52,12.7,45.3,4,32,4z"
        filter="url(#toothShadow)"
      />
      <path
        fill="#ffffff"
        opacity="0.8"
        d="M32,10c-9.3,0-14,5.7-14,10c0,4.3,1.3,10,2.7,14c1.3,4,2.7,9.3,5.3,9.3s4-2.7,5.3-2.7S34,43.3,36.7,43.3
        s4-5.3,5.3-9.3c1.3-4,2.7-9.7,2.7-14C44.7,15.7,41.3,10,32,10z"
      />
    </svg>
  );
};

// 牙刷图标 - 更现代化的设计
export const ToothbrushIcon: React.FC<IconProps> = ({ className, style }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#26c6da" />
          <stop offset="100%" stopColor="#5e35b1" />
        </linearGradient>
        <filter id="brushShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>
      <path
        fill="url(#brushGradient)"
        d="M48,4c-2.2,0-4,1.8-4,4v16c0,2.2,1.8,4,4,4s4-1.8,4-4V8C52,5.8,50.2,4,48,4z"
        filter="url(#brushShadow)"
      />
      <path
        fill="#5e35b1"
        d="M48,28c-1.1,0-2-0.9-2-2V10c0-1.1,0.9-2,2-2s2,0.9,2,2v16C50,27.1,49.1,28,48,28z"
      />
      <rect x="44" y="28" fill="#1e88e5" width="8" height="32" rx="2" ry="2" />
      <rect
        x="46"
        y="28"
        fill="#ffffff"
        opacity="0.6"
        width="4"
        height="32"
        rx="1"
        ry="1"
      />
    </svg>
  );
};

// 微笑图标 - 更现代化的设计
export const SmileIcon: React.FC<IconProps> = ({ className, style }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="smileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e3f2fd" />
          <stop offset="100%" stopColor="#bbdefb" />
        </linearGradient>
        <filter id="smileShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>
      <circle
        fill="url(#smileGradient)"
        cx="32"
        cy="32"
        r="28"
        filter="url(#smileShadow)"
      />
      <path
        fill="none"
        stroke="#1e88e5"
        strokeWidth="4"
        strokeLinecap="round"
        d="M20,32c0,6.6,5.4,12,12,12s12-5.4,12-12"
      />
      <circle fill="#5e35b1" cx="22" cy="24" r="4" />
      <circle fill="#5e35b1" cx="42" cy="24" r="4" />
    </svg>
  );
};

// 牙医诊所Logo组件 - 更现代化的设计
export const DentalClinicLogo: React.FC<IconProps> = ({ className, style }) => {
  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          animation: "pulse 3s infinite ease-in-out",
        }}
      >
        <ToothIcon style={{ width: "80%", height: "80%" }} />
      </div>
      <div
        style={{
          position: "absolute",
          width: "40%",
          height: "40%",
          bottom: "5%",
          right: "5%",
          animation: "float 4s infinite ease-in-out",
          animationDelay: "0.5s",
        }}
      >
        <SmileIcon style={{ width: "100%", height: "100%" }} />
      </div>
      <div
        style={{
          position: "absolute",
          width: "30%",
          height: "30%",
          top: "10%",
          left: "5%",
          animation: "float 3.5s infinite ease-in-out",
          animationDelay: "1s",
        }}
      >
        <ToothbrushIcon style={{ width: "100%", height: "100%" }} />
      </div>
      <style>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

// 背景装饰组件 - 更现代化的设计
export const DentalBackground: React.FC<IconProps> = ({ className, style }) => {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        opacity: 0.05,
        ...style,
      }}
    >
      {Array.from({ length: 15 }).map((_, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg) scale(${
              0.5 + Math.random() * 1.5
            })`,
            animation: `float-bg ${
              3 + Math.random() * 4
            }s infinite ease-in-out ${Math.random() * 2}s`,
          }}
        >
          <ToothIcon style={{ width: "40px", height: "40px" }} />
        </div>
      ))}
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`brush-${index}`}
          style={{
            position: "absolute",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg) scale(${
              0.3 + Math.random()
            })`,
            animation: `float-bg ${
              3 + Math.random() * 3
            }s infinite ease-in-out ${Math.random() * 2}s`,
          }}
        >
          <ToothbrushIcon style={{ width: "30px", height: "30px" }} />
        </div>
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`smile-${index}`}
          style={{
            position: "absolute",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg) scale(${
              0.2 + Math.random() * 0.3
            })`,
            animation: `float-bg ${
              3 + Math.random() * 3
            }s infinite ease-in-out ${Math.random() * 2}s`,
          }}
        >
          <SmileIcon style={{ width: "30px", height: "30px" }} />
        </div>
      ))}
      <style>{`
        @keyframes float-bg {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(5px, 5px) rotate(5deg);
          }
          50% {
            transform: translate(0, 10px) rotate(0deg);
          }
          75% {
            transform: translate(-5px, 5px) rotate(-5deg);
          }
        }
      `}</style>
    </div>
  );
};
