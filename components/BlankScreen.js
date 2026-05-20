import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceHeight } from '../styles/NewStyles';

export default function BlankScreen({ customStyle }) {

    const { t } = useTranslation();
    return (
        <View style={[styles.animationContainer, NewStyles.center, customStyle]}>
            <Text style={NewStyles.text10}>{t('No records to display!')}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    animationContainer: {
        height: deviceHeight - 100,
    },
});
