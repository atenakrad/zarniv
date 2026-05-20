import { Text, StyleSheet, Pressable, Image } from 'react-native';

import { mainUri } from '../services/URL';
import NewStyles, { deviceWidth } from '../styles/NewStyles';

export default function CategoryItem({ item, navigation }) {
    return (
        <Pressable style={[styles.wrapper, NewStyles.center,]} onPress={() => navigation.push('Products', { categoryId: item?.id })}>
            <Image style={[NewStyles.border100, NewStyles.center, { aspectRatio: 1, width: '70%', resizeMode: 'cover' }]} source={{ uri: `${mainUri}${item?.image}` }} transition={1000} />
            <Text style={[NewStyles.text10, {fontSize:12}]} numberOfLines={1}>{item?.name}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        height: deviceWidth * 0.9 / 3.5,
        width: deviceWidth * 0.9 / 3.5,
        // paddingHorizontal: 2,
        gap: 5
    },
})