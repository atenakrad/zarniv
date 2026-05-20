import { View, StyleSheet, Text, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor5 } from '../theme/Color';
import { formatDate, formatPrice } from '../helpers/Common';
import { mainUri } from '../services/URL';

export default function WithdrawalItem({ item }) {

    const { t } = useTranslation();
    const renderRow = (label, value, textStyle = NewStyles.text10, action, textStyle2) =>
        value ? (
            <Pressable style={NewStyles.rowWrapper} onPress={action}>
                <Text style={[NewStyles.text3, textStyle2]}>{t(label)}</Text>
                <Text style={textStyle}>{value}</Text>
            </Pressable>
        ) : null;

    return (
        <View style={[styles.itemWrapper, NewStyles.shadow, NewStyles.border10]}>
            {renderRow(`# ${item?.id ?? '---'}`, formatDate(item?.created_at),)}
            {renderRow('Amount', `${formatPrice(item?.amount)} ${t('T')}`)}
            {renderRow('Status', item?.status == 0 ? 'در حال رسیدگی' : item?.status == 1 ? 'تأیید شده' : item?.status == 2 ? 'تکمیل شده' : 'رد شده', item?.status === '0' ? NewStyles.text : item?.status === '3' ? NewStyles.text6 : NewStyles.text7)}
            {item?.iban && renderRow('شماره شبا', (item?.iban))}
            {item?.card_number && renderRow('شماره کارت', (item?.card_number))}
            {item?.bank_owner_name && renderRow('نام صاحب حساب', (item?.bank_owner_name))}
            {item?.bank_name && renderRow('نام بانک', (item?.bank_name))}
            {item?.receipt && renderRow('رسید پرداخت', `مشاهده`, NewStyles.text, () => Linking.openURL(`${mainUri}${item?.receipt}`))}
            {item?.completed_at && renderRow('تاریخ پایان', formatDate(item?.completed_at))}
            {item?.cancel_reason && renderRow('علت رد', ` `, [], null, NewStyles.title6)}
            {item?.cancel_reason && renderRow(``, `${item?.cancel_reason}`, [NewStyles.text6, { flex: 1 }])}
        </View>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        width: '100%',
        backgroundColor: themeColor5.bgColor(1),
        paddingHorizontal: '5%',
        paddingVertical: 15,
        gap: 10
    },
})