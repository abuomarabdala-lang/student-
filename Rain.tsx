import { useEffect, useRef } from 'react';

export function Rain() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create rain drops
    const drops: HTMLDivElement[] = [];
    const dropCount = 50;

    for (let i = 0; i < dropCount; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      drop.style.opacity = `${0.3 + Math.random() * 0.4}`;
      container.appendChild(drop);
      drops.push(drop);
    }

    return () => {
      drops.forEach(drop => drop.remove());
    };
  }, []);

  return <div ref={containerRef} className="rain-container" />;
}
