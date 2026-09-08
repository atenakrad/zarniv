import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor6 } from '../theme/Color';
import { formatGramLimit, getRemainingBuyCapacity } from '../helpers/tradeLimits';

export default function TradeLimitNotice({ limits, operationLabel, error, currentBalance }) {
    const minText = formatGramLimit(limits?.min);
    const maxText = limits?.max ? formatGramLimit(limits.max) : '';
    const remainingCapacity = currentBalance !== undefined
        ? getRemainingBuyCapacity(currentBalance, limits)
        : null;

    const capacityText = remainingCapacity !== null
        ? (remainingCapacity > 0
            ? `ظرفیت باقی‌مانده تا سقف موجودی: ${formatGramLimit(remainingCapacity)} گرم`
            : `ظرفیت خرید جدید: 0 گرم`)
        : '';

    const baseMessage = maxText
        ? `بازه مجاز ${operationLabel}: ${minText} تا ${maxText} گرم`
        : `حداقل مقدار ${operationLabel}: ${minText} گرم`;

    const message = error || (capacityText ? `${baseMessage} • ${capacityText}` : baseMessage);

    return (
        <View style={[
            styles.container,
            NewStyles.border10,
            error && styles.errorContainer,
        ]}>
            <Ionicons
                name={error ? 'alert-circle-outline' : 'information-circle-outline'}
                size={18}
                color={error ? themeColor6.bgColor(1) : themeColor0.bgColor(1)}
            />
            <Text style={[
                NewStyles.text10,
                styles.text,
                error && { color: themeColor6.bgColor(1) },
            ]}>
                {message}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 38,
        paddingHorizontal: 10,
        paddingVertical: 8,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 7,
        backgroundColor: themeColor0.bgColor(0.08),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor0.bgColor(0.28),
    },
    errorContainer: {
        backgroundColor: themeColor6.bgColor(0.06),
        borderColor: themeColor6.bgColor(0.35),
    },
    text: {
        flex: 1,
        fontSize: 12,
    },
});
