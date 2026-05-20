import { ActivityIndicator, StyleSheet } from 'react-native';

import { themeColor0, themeColor5 } from '../theme/Color';
import { deviceHeight, deviceWidth } from '../styles/NewStyles';

export default function Loader() {

    return (
        <ActivityIndicator color={themeColor0.bgColor(1)} size='large' style={styles.loaderWrapper} />
    )
}

const styles = StyleSheet.create({
    loaderWrapper: {
        height: deviceHeight,
        width: deviceWidth,
        backgroundColor: themeColor5.bgColor(1),
    },
})