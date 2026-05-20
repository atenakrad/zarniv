import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor4, themeColor5 } from '../theme/Color';
import { formatDate, formatPrice } from '../helpers/Common';

export default function TransactionItem({ item }) {

    const { t } = useTranslation();

    const renderRow = (label, value, textStyle = NewStyles.text10) =>
        value ? (
            <View style={NewStyles.rowWrapper}>
                <Text style={NewStyles.text3}>{t(label)}</Text>
                <Text style={textStyle}>{value}</Text>
            </View>
        ) : null;

    return (
        <View style={[styles.itemWrapper, NewStyles.shadow, NewStyles.border10]}>
            {renderRow(`# ${item?.id}`, formatDate(item?.created_at))}
            {renderRow('Transaction result', item?.status == true ? 'موفق' : 'ناموفق', item?.status == true ? NewStyles.text7 : NewStyles.text6)}
            {item?.order_id && renderRow('Order ID', `${item?.order_id}`)}
            {renderRow('Amount', `${formatPrice(item?.amount)} ${t('T')}`)}
            {item?.description && renderRow('توضیحات', ` `)}
            {item?.description && renderRow(``, `${item?.description}`, [NewStyles.text10, { flex: 1 }])}
        </View>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        width: '100%',
        backgroundColor: themeColor4.bgColor(1),
        paddingHorizontal: 10,
        paddingVertical: 15,
        gap: 5
    },
})