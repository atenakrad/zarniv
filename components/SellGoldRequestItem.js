import { View, StyleSheet, Text, Pressable, Image, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor12, themeColor5 } from '../theme/Color';
import { formatDate, formatPrice } from '../helpers/Common';
import { mainUri } from '../services/URL';

export default function SellGoldRequestItem({ item }) {
    const { t } = useTranslation();
    const renderRow = (label, value, textStyle = NewStyles.text10, action, textStyle2 = NewStyles.text10,) =>
        value ? (
            <Pressable style={NewStyles.rowWrapper} onPress={action}>
                <Text style={[textStyle2]}>{t(label)}</Text>
                <Text style={textStyle}>{value}</Text>
            </Pressable>
        ) : null;

    return (
        <View style={[styles.itemWrapper, NewStyles.shadow, NewStyles.border10]}>
            {renderRow(`# ${item?.id ?? '---'}`, `${formatDate(item?.created_at)}`)}
            {renderRow('Amount', `${formatPrice(Number(item?.total_price)?.toFixed(0))} ${t('T')}`)}
            {renderRow('مقدار', `${item?.weight_mg} میلی‌گرم`)}

            {renderRow('شماره کارت', item?.card_number)}
            {renderRow('شماره شبا', item?.iban)}
            {renderRow('نام صاحب حساب', item?.bank_owner_name)}
            {renderRow('Status', item?.status == '0' ? 'در حال رسیدگی' : item?.status == '1' ? 'تأیید شده' : item?.status == '2' ? 'تکمیل شده' : 'رد شده', item?.status == '0' ? NewStyles.text11 : (item?.status == '1') ? NewStyles.text7 : item?.status == '2' ? NewStyles.text : NewStyles.text6)}
            {item?.receipt && renderRow('رسید پرداخت', `مشاهده`, NewStyles.text, () => Linking.openURL(`${mainUri}${item?.receipt}`))}

            {item?.cancel_reason && renderRow('علت رد:', ` `, NewStyles.text6, () => { }, NewStyles.text6)}
            {item?.cancel_reason && renderRow(`${item?.cancel_reason}`, ` `)}
        </View>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {

        backgroundColor: themeColor12.bgColor(1),
        paddingHorizontal: '5%',
        paddingVertical: 15,
        gap: 10
    },
})