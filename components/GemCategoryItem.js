import { Text, StyleSheet, Pressable, Image } from 'react-native';

import { mainUri } from '../services/URL';
import NewStyles, { deviceWidth } from '../styles/NewStyles';

export default function GemCategoryItem({ item, navigation }) {
    return (
        <Pressable style={[styles.wrapper, NewStyles.center,]} onPress={() => navigation.push('Gems', { categoryId: item?.id })}>
            <Image style={[NewStyles.border100, NewStyles.center, { aspectRatio: 1, width: '70%' }]} source={{ uri: `${mainUri}${item?.image}` }} contentFit="cover" transition={1000} />
            <Text style={NewStyles.text10} numberOfLines={2}>{item?.name}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        height: deviceWidth * 0.9 / 3,
        width: deviceWidth * 0.9 / 3,
        paddingHorizontal: 2,
        gap: 5
    },
})