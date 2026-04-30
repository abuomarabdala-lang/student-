import { useEffect, useState } from 'react';

const images = [
  '/images/Looney-Tunes.avif',
  '/images/images.jpeg',
  '/images/pinkpanther.jpeg',
];

export function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setFade(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slideshow-container">
      {images.map((img, index) => (
        <div
          key={img}
          className={`slideshow-image ${index === currentIndex ? 'active' : ''} ${fade && index === currentIndex ? 'fade' : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
    </div>
  );
}
