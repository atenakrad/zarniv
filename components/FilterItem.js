import { Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor10, themeColor12, themeColor3, themeColor4 } from '../theme/Color';

export default function FilterItem({ item, index, activeFilter, setActiveFilter }) {

    let isActive = activeFilter == index;
    let color = isActive ? themeColor4.bgColor(1) : themeColor10.bgColor(1);
    let backgroundColor = isActive ? themeColor10.bgColor(1) : themeColor12.bgColor(1);

    return (
        <Pressable style={[styles.filterItem, NewStyles.border100, NewStyles.rowWrapper, { backgroundColor, gap: 10 }]} onPress={() => setActiveFilter(index)}>
            <Text style={[NewStyles.text10, { color }]}>{item.name}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    filterItem: {
        paddingHorizontal: 15,
        padding: 10,
        borderWidth: 0.5,
        borderColor: themeColor0.bgColor(0.5),
        backgroundColor: themeColor3.bgColor(1),
    },
})