import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import NewStyles, { deviceHeight } from '../styles/NewStyles';
import { mainUri } from '../services/URL';
import { themeColor1, themeColor5 } from '../theme/Color';

export default function CustomImage({ item, x, index, size, spacer }) {

    const style = useAnimatedStyle(() => {
        const scale = interpolate(
            x.value,
            [(index - 2) * size, (index - 1) * size, index * size],
            [0.95, 1, 0.95],
        );
        return {
            transform: [{ scale }],
        };
    });

    if (!item?.image) {
        return <View style={{ width: spacer }} key={index} />;
    }

    return (
        <View style={{ overflow: 'hidden', width: size }} key={index}>
            <Animated.View style={[styles.imageContainer, style]}>
                <ImageBackground
                    style={[styles.imageBackground, NewStyles.border20]}
                    source={{ uri: `${mainUri}${item?.image}` }}
                    contentFit="cover"
                >
                    <LinearGradient colors={[themeColor5.bgColor(0), themeColor1.bgColor(0.8)]} style={[{ height: '100%', width: '100%', padding: '5%', alignItems: 'flex-end', justifyContent: 'flex-end' }, NewStyles.border20]} >
                        <Text style={[NewStyles.heading4, { fontFamily: 'saye', fontSize:30, width:'100%' }]}>{item?.title} </Text>
                        <Text style={[NewStyles.text4, { fontFamily: 'saye', lineHeight:32, fontSize:22, width:'100%' }]}>{item?.sub_title} </Text>
                    </LinearGradient>
                </ImageBackground>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        overflow: 'hidden',
    },
    imageBackground: {
        width: '100%',
        height: deviceHeight * 0.25,
        flex: 1,
        marginBottom: 10,
    },
})
