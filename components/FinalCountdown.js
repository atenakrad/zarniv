import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { themeColor1, themeColor12 } from '../theme/Color';

const { width, height } = Dimensions.get('window');

const FinalCountdown = ({ seconds }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (seconds > 0 && seconds <= 10) {
      // Reset and start animation for each second
      scale.value = 0.5;
      opacity.value = 0;
      
      // Scale up and fade in
      scale.value = withTiming(2, { duration: 400, easing: Easing.out(Easing.cubic) });
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 600, easing: Easing.in(Easing.ease) })
      );
    }
  }, [seconds]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (seconds > 10 || seconds <= 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.numberContainer, animatedStyle]}>
        <Text style={styles.number}>{seconds}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  numberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 120,
    color: themeColor12.bgColor(1),
    fontFamily: 'VazirBold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    paddingBottom:10
    
  },
});

export default FinalCountdown;
