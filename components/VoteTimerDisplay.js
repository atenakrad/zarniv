import React, { useState, useEffect, useRef, memo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import CountdownTimer from './CountdownTimer';
import FinalCountdown from './FinalCountdown';
import { themeColor0 } from '../theme/Color';

const VoteTimerDisplay = memo(({ initialRemainingSeconds, onTimeExpired, title, subTitle, }) => {
  const hasRawTime = initialRemainingSeconds !== undefined
    && initialRemainingSeconds !== null
    && initialRemainingSeconds !== '';
  const normalizedInitial = Number(initialRemainingSeconds);
  const hasValidTime = hasRawTime && Number.isFinite(normalizedInitial) && normalizedInitial >= 0;
  const [timeLeft, setTimeLeft] = useState(hasValidTime ? normalizedInitial : null);
  const intervalRef = useRef(null);
  const onTimeExpiredRef = useRef(onTimeExpired);

  useEffect(() => {
    onTimeExpiredRef.current = onTimeExpired;
  }, [onTimeExpired]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!hasValidTime) {
      setTimeLeft(null);
      return undefined;
    }

    setTimeLeft(normalizedInitial);

    if (normalizedInitial > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          const safePrevious = Number.isFinite(prevTime) ? prevTime : 0;
          const newTime = Math.max(0, safePrevious - 1);
          if (newTime === 0) {
            onTimeExpiredRef.current?.();
          }
          return newTime;
        });
      }, 1000);
    } else if (normalizedInitial === 0) {
      onTimeExpiredRef.current?.();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasValidTime, normalizedInitial]);

  // نبودن status معتبر یعنی هنوز پاسخ سرور نیامده؛ هرگز ۲۰ دقیقه ساختگی نشان نده.
  if (!hasValidTime || timeLeft === null) {
    return (
      <View style={{ minHeight: 120, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
      </View>
    );
  }

  const isCountingToStart = normalizedInitial > 0;

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
