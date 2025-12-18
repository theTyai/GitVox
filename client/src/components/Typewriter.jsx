import React, { useState, useEffect } from 'react';

const Typewriter = ({ text, speed = 30, delay = 0, onComplete, showCursor = false }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    } else if (!completed) {
      setCompleted(true);
      if (onComplete) onComplete();
    }
  }, [started, displayedText, text, speed, onComplete, completed]);

  return (
    <span>
      {displayedText}
      {showCursor && !completed && <span className="cursor-blink"></span>}
    </span>
  );
};

export default Typewriter;