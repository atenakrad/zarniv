import { Text, StyleSheet, Pressable, View } from 'react-native';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

import NewStyles from '../styles/NewStyles';
import { themeColor6, themeColor7, themeColor12, themeColor3 } from '../theme/Color';
import { formatDate, formatPrice, showToastOrAlert } from '../helpers/Common';
import { mainUri } from '../services/URL';
import { useTranslation } from 'react-i18next';

export default function RateItem({ item, navigation }) {

    const { t } = useTranslation();

    const [selectedItem, setSelectedItem] = useState(null);
    const handleLongPress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };
    const handleCopy = (item) => {
        setSelectedItem(item?.name);
        Clipboard.setStringAsync(selectedItem);
        showToastOrAlert(t("Price copied."));
    };

    return (
        <Pressable style={[styles.wrapper, NewStyles.border20, NewStyles.shadow]}
            android_ripple={{ color: themeColor3.bgColor(0.05), foreground: true }}
            onLongPress={async () => {
                handleLongPress();
                handleCopy(item);
            }}
            onPress={() => navigation.navigate('Rate Detail', { slug: item?.key })}
        >
            <View style={NewStyles.rowWrapper}>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={NewStyles.text}>{item?.title}</Text>
                    {/* <Text style={NewStyles.text3}>{item?.category}</Text> */}
                </View>
                {/* <Image style={[{ height: 25, width: 25 }, NewStyles.border100]} contentFit='cover' source={{ uri: `${mainUri}${item?.image}` }} /> */}
            </View>
            <View style={{ alignItems: 'flex-start' }}>
                <View style={NewStyles.row}>
                    <Text style={item?.change >= 0 ? NewStyles.text7 : NewStyles.text6} numberOfLines={2}>{formatPrice(Math.abs(item?.change))}</Text>
                    <Ionicons name={item?.change >= 0 ? "arrow-up" : "arrow-down"} size={15} color={item?.change >= 0 ? themeColor7.bgColor(1) : themeColor6.bgColor(1)} />
                </View>
                <Text style={[NewStyles.heading10, { fontSize: 25 }]} numberOfLines={2}>{formatPrice((Number(item?.price) / 10)?.toFixed())}</Text>
                <Text style={[NewStyles.text3, { fontSize: 12, color: themeColor3.bgColor(0.5), }]}>{formatDate(item?.date)}</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        gap: 30,
        backgroundColor: themeColor12.bgColor(1),
        marginHorizontal: 2.5,
        padding: '3%',
    },
})