import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor4 } from '../theme/Color';

export default function Button({ title, onPress, loading, style, color }) {
    return (
        <Pressable style={[styles.button, NewStyles.center, NewStyles.shadow, NewStyles.border5, style]} disabled={loading} onPress={onPress}>
            {!loading && <Text style={[NewStyles.title4, color && { color: color }, {width:'100%', textAlign:'center'}]}>{title}</Text>}
            {loading && <ActivityIndicator color={themeColor4.bgColor(1)} size='small' />}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: themeColor1.bgColor(1),
        marginVertical: 20,
        height: 40
    },
})