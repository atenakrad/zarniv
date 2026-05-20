import { View, Text, StyleSheet } from 'react-native';

import { themeColor12 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';

export default function ImageThumbnail() {
    return (
        <View style={[styles.wrapper, NewStyles.center]}>
            <Text style={NewStyles.text10}>زرنیو</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        height: '100%',
        width: '100%',
        backgroundColor: themeColor12.bgColor(0.5),
    },
})