import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, } from 'react-native-reanimated';

import NewStyles from '../styles/NewStyles';
import { themeColor1, themeColor4 } from '../theme/Color';

export default function Dot({ x, index, size }) {
    const animatedDotStyle = useAnimatedStyle(() => {
        const widthAnimation = interpolate(
            x.value,
            [(index - 1) * size, index * size, (index + 1) * size],
            [6, 16, 6],
            Extrapolation.CLAMP,
        );
        const opacityAnimation = interpolate(
            x.value,
            [(index - 1) * size, index * size, (index + 1) * size],
            [0.3, 1, 0.3],
            Extrapolation.CLAMP,
        );
        return {
            width: widthAnimation,
            opacity: opacityAnimation,
        };
    });
    return <Animated.View style={[styles.dots, NewStyles.border5, animatedDotStyle]} />;
};

const styles = StyleSheet.create({
    dots: {
        height: 6,
        backgroundColor: themeColor4.bgColor(1),
        marginHorizontal: 3,
    },
})