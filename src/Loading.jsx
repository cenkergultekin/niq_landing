import React, { useEffect, useState } from 'react';
import './Loading.css';

export default function Loading({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-container">
        <div className="loading-logo">
          <div className="loading-logo-text">NIQ</div>
        </div>
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="loading-text">Yükleniyor...</div>
      </div>
    </div>
  );
}

