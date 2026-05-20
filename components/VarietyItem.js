import { Text, Pressable, StyleSheet } from 'react-native';

import NewStyles from '../styles/NewStyles';
import { themeColor10, themeColor12, themeColor4 } from '../theme/Color';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function VarietyItem({ item, index, activeVariety, setActiveVariety }) {

    let isActive = activeVariety == index;
    let color = isActive ? themeColor4.bgColor(1) : themeColor10.bgColor(1);
    let backgroundColor = isActive ? themeColor10.bgColor(1) : themeColor12.bgColor(1);

    return (
        <Pressable style={[styles.filterItem, NewStyles.border100, NewStyles.rowWrapper, { backgroundColor, gap: 10 }]} onPress={() => setActiveVariety(index)}>
            <Text style={[NewStyles.text10, { color }]}>{item?.variety_detail?.name ?? item?.title} {item?.title && ` - ${item?.gram} گرم`}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    filterItem: {
        paddingHorizontal: 15,
        padding: 10,
        borderWidth: 0.5,
        borderColor: themeColor10.bgColor(0.5),
        backgroundColor: themeColor12.bgColor(1),
    },
})