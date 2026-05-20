import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ImageBackground } from 'expo-image';
import React, { useLayoutEffect, useState } from 'react';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import { themeColor10, themeColor3, themeColor4 } from '../../theme/Color';
import { useSelector } from 'react-redux';
import { formatPrice } from '../../helpers/Common';

export default function WalletItem({ item, x, index, size, spacer }) {

    const [aspectRatio, setAspectRatio] = useState(1);
    const user = useSelector(state => state.user?.data);
    // Get Image Width and Height to Calculate AspectRatio
    useLayoutEffect(() => {
        if (item?.file_path) {
            // const { width, height } = Image.resolveAssetSource(item?.file_path);
            const width = 1;
            const height = 1;
            setAspectRatio(width / height);
        }
    }, [item?.file_path]);

    const style = useAnimatedStyle(() => {
        const scale = interpolate(
            x.value,
            [(index - 2) * size, (index - 1) * size, index * size],
            [0.9, 1, 0.9],
        );
        return {
            transform: [{ scale }],
        };
    });

    if (!item?.file_path) {
        return <View style={{ width: spacer }} key={index} />;
    }

    return (
        <View style={{ overflow: 'hidden', width: size }} key={index}>
            <Animated.View style={[styles.imageContainer, NewStyles.border10, style]}>
                <ImageBackground style={styles.imageBackground} source={item?.file_path} contentFit='cover' transition={1000}>

                    <View style={NewStyles.rowWrapper}>
                        <View style={NewStyles.rowWrapper}>
                            <Text style={[NewStyles.heading4, { color: item?.color }]}>{item?.title}</Text>

                        </View>
                        {item?.edit && <Pressable style={[styles.iconWrapper, NewStyles.border100]} onPress={item?.edit}>
                            <MaterialIcons name="edit" size={16} color={themeColor4.bgColor(1)} />
                        </Pressable>}
                        {item?.text3 && <Pressable style={[NewStyles.row, NewStyles.border5, { gap: 5, padding: 5, backgroundColor: themeColor4.bgColor(0.2) }]} onPress={item?.action3}>
                            <Ionicons name={"cart"} size={24} color={item?.color} />
                            <Text style={[NewStyles.text4,{ color: item?.color }]}>{item?.text3}</Text>
                        </Pressable>}
                    </View>
                    <Text style={[NewStyles.text4, { color: item?.color }]}>موجودی: {item?.id == '1' ? ((user?.wallet?.gold_balance || 0.000) + ' گرم') : item?.id == '3' ? ((user?.wallet?.silver_balance || 0.000) + ' گرم') : (formatPrice(user?.wallet?.balance || 0) + ' تومان')}</Text>

                    {item?.id == '2' && <View style={NewStyles.rowWrapper}>
                        <Text style={NewStyles.text4}>شماره کارت</Text>
                        <Text style={NewStyles.title4}>{user?.card_number || '-'}</Text>
                    </View>}

                    <View style={NewStyles.rowWrapper}>
                        <Pressable style={[NewStyles.row, NewStyles.border5, { backgroundColor: themeColor4.bgColor(1), gap: 5, padding: 5, }, item?.id!='2' && {paddingHorizontal:20}]} onPress={item?.action1}>
                            <Ionicons name="arrow-up" size={15} color={themeColor10.bgColor(1)} />
                            <Text style={NewStyles.text10}>{item?.text1}</Text>
                        </Pressable>
                        {item?.text2 && <Pressable style={[NewStyles.row, NewStyles.border5, { gap: 5, padding: 5 }]} onPress={item?.action2}>
                            <Ionicons name="arrow-down-circle" size={24} color={themeColor4.bgColor(1)} />
                            <Text style={NewStyles.text4}>{item?.text2}</Text>
                        </Pressable>}
                        {item?.text4 && <Pressable style={[NewStyles.row, NewStyles.border5, { gap: 5, padding: 5 }]} onPress={item?.action4}>
                            <Ionicons name="arrow-down-circle" size={24} color={item?.color} />
                            <Text style={[NewStyles.text4, { color: item?.color }]}>{item?.text4}</Text>
                        </Pressable>}

                    </View>
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
        height: deviceWidth * 0.5,

        padding: '10%',
        justifyContent: 'space-between'
    },
    iconWrapper: {
        backgroundColor: themeColor3.bgColor(0.5),
        aspectRatio: 1,
        padding: 10
    },
})