import React, { useState, useEffect, useRef, memo } from 'react';
import { View } from 'react-native';
import CountdownTimer from './CountdownTimer';
import FinalCountdown from './FinalCountdown';

const VoteTimerDisplay = memo(({ initialRemainingSeconds, onTimeExpired, title, subTitle, }) => {
  const [timeLeft, setTimeLeft] = useState(initialRemainingSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Clear any existing interval when component mounts or initialRemainingSeconds changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set the initial timeLeft directly
    setTimeLeft(initialRemainingSeconds);

    // Only start interval if there's time remaining and it's a positive value
    if (initialRemainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = Math.max(0, prevTime - 1);
          if (newTime === 0 && onTimeExpired) {
            onTimeExpired();
          }
          return newTime;
        });
      }, 1000);
    } else if (initialRemainingSeconds === 0 && onTimeExpired) {
      // If it's already expired when it loads
      onTimeExpired();
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [initialRemainingSeconds, onTimeExpired]); // Dependencies for the effect

  const isCountingToStart = initialRemainingSeconds !== undefined && initialRemainingSeconds !== null && initialRemainingSeconds > 0; // Adjust this logic if needed based on how you use it

  return (
    <View>
      <CountdownTimer timeLeft={timeLeft} title={title} subTitle={subTitle} />
      {isCountingToStart && timeLeft <= 10 && timeLeft > 0 && (
        <FinalCountdown seconds={timeLeft} />
      )}
    </View>
  );
});

VoteTimerDisplay.displayName = 'VoteTimerDisplay';

export default VoteTimerDisplay;
