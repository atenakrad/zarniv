import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor12, themeColor13 } from '../theme/Color';

const pad = (num) => num.toString().padStart(2, '0');

const CountdownTimer = ({ title, timeLeft: externalTimeLeft, subTitle }) => {
  const [timeLeft, setTimeLeft] = useState(externalTimeLeft || 1200);
  const initialOpacity = useSharedValue(0);
  const bounceAnim = useSharedValue(1);

  const prevSecond = useRef(null);

  // Update timeLeft when external prop changes
  useEffect(() => {
    if (externalTimeLeft !== undefined) {
      setTimeLeft(externalTimeLeft);
    }
  }, [externalTimeLeft]);

  useEffect(() => {
    // انیمیشن اولیه ظاهر شدن تایمر
    initialOpacity.value = withTiming(1, { duration: 600 });

    // Only run internal countdown if no external timeLeft is provided
    if (externalTimeLeft === undefined) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }

          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [externalTimeLeft]);

  useEffect(() => {
    const sec = timeLeft % 60;
    if (prevSecond.current !== null && sec !== prevSecond.current) {
      // وقتی ثانیه تغییر کرد، انیمیشن bounce
      bounceAnim.value = 0.8;
      bounceAnim.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });
    }
    prevSecond.current = sec;
  }, [timeLeft]);

  const animatedInitialStyle = useAnimatedStyle(() => ({
    opacity: initialOpacity.value,
    transform: [{ scale: initialOpacity.value }],
  }));

  const animatedBounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceAnim.value }],
  }));

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <Animated.View style={[styles.container, NewStyles.center, animatedInitialStyle]}>
      <Text style={NewStyles.title10}>{title}</Text>
      {subTitle && <Text style={[NewStyles.title10, { fontSize: 18 }]}>{subTitle}</Text>}
      <View style={NewStyles.row}>
        <Text style={styles.timeText}>
          {pad(seconds)}
        </Text>
        <Text style={[styles.timeText, styles.colon]}>:</Text>
        <Text style={styles.timeText}>
          {pad(minutes)}
        </Text>
        <Text style={[styles.timeText, styles.colon]}>:</Text>
        <Text style={[styles.timeText,]}>
          {pad(hours)}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignSelf: 'center',
    width: '100%'
  },
  timeText: {
    ...NewStyles.title,
    fontSize: 48,
    color: themeColor0.bgColor(1),
    letterSpacing: 2,
  },
  colon: {
    color: themeColor1.bgColor(1),
  },
});

export default CountdownTimer;
