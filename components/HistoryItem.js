import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor5 } from '../theme/Color';
import { formatDate, formatPrice } from '../helpers/Common';

export default function HistoryItem({ item }) {

    const { t } = useTranslation();
    const renderRow = (label, value, textStyle = NewStyles.text10, action) =>
        value ? (
            <Pressable style={NewStyles.rowWrapper} onPress={action}>
                <Text style={[textStyle]}>{t(label)}</Text>
                <Text style={textStyle}>{value}</Text>
            </Pressable>
        ) : null;

    return (
        <View style={[styles.itemWrapper, NewStyles.shadow]}>
            {renderRow(`# ${item?.id ?? '---'}`, `${formatDate(item?.created_at)}`)}
            {renderRow(item?.order_type == 'sell' ? 'فروش' : 'خرید', `${item?.product?.name}`, item?.order_type == 'sell' ? NewStyles.text6 : NewStyles.text7)}
            {renderRow('Amount', `${formatPrice(item?.final_price)} ${t('T')}`)}
            {renderRow('مقدار', `${item?.amount} ${item?.unit_name}`)}
            {renderRow('Status', item?.status == '0' ? 'در حال رسیدگی' : item?.status == '1' ? 'تأیید شده' : 'رد شده', item?.status == '0' ? NewStyles.text : item?.status == '1' ? NewStyles.text7 : NewStyles.text6)}
            {item?.detail && renderRow('توضیحات ضمیمه:', ` `)}
            {item?.detail && renderRow(`${item?.detail}`, ` `)}
            {item?.cancel_reason && renderRow('علت رد:', ` `)}
            {item?.cancel_reason && renderRow(`${item?.cancel_reason}`, ` `)}
        </View>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        width: deviceWidth,
        backgroundColor: themeColor5.bgColor(1),
        paddingHorizontal: '5%',
        paddingVertical: 15,
        gap: 10
    },
})