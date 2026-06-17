import { View, StyleSheet, Text, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor12 } from '../theme/Color';
import { formatDate, formatPrice } from '../helpers/Common';
import { mainUri } from '../services/URL';
import Button from './Button';
import { useNavigation } from '@react-navigation/native';

export default function DeliveryRequestHistoryItem({ item, type = "gold" }) {
    const { t } = useTranslation();
    const renderRow = (label, value, textStyle2 = NewStyles.text10, textStyle = NewStyles.text10) =>
        value ? (
            <Pressable style={NewStyles.rowWrapper} >
                <Text style={[textStyle]}>{t(label)}</Text>
                <Text style={textStyle2}>{value}</Text>
            </Pressable>
        ) : null;

    const navigation = useNavigation() 

    return (
        <View style={[styles.itemWrapper, NewStyles.shadow, NewStyles.border10]}>
            {renderRow(`# ${item?.id ?? '---'}`, `${formatDate(item?.created_at)}`)}
            {renderRow('Status', item?.status == 'pending' ? 'در حال رسیدگی' : item?.status == 'approved' ? 'تأیید شده' : item?.status == 'completed' ? 'تکمیل شده' : 'رد شده', item?.status == 'pending' ? NewStyles.text11 : item?.status == 'rejected' ? NewStyles.text6 : NewStyles.text7)}
            {renderRow('مقدار', `${item?.weight} میلی گرم`)}
            {renderRow('نام تحویل گیرنده', `${item?.receiver_name}`)}
            {renderRow('شماره تماس تحویل گیرنده', `${item?.receiver_phone}`)}
            {renderRow('کدملی تحویل گیرنده', `${item?.receiver_national_code}`)}
            {renderRow('روش تحویل', `${item?.delivery_method == 'shipping' ? 'ارسال به آدرس' : 'تحویل از مغازه'}`)}
            {item?.delivery_piece_title && renderRow('قطعه تحویلی', `${item?.delivery_piece_title}`)}
            {item?.shipping_address && renderRow('آدرس تحویل:', ` `)}
            {item?.shipping_address && renderRow(`${item?.shipping_address}`, ` `)}
            {item?.shipping_postal_code && renderRow('کدپستی', `${item?.shipping_postal_code}`)}
            {item?.shipping_cost != 0 && renderRow('هزینه ارسال', `${formatPrice(item?.shipping_cost)} تومان`)}
            {item?.notes && renderRow('توضیحات ضمیمه:', ` `)}
            {item?.notes && renderRow(`${item?.notes}`, ` `)}
            {
                item?.shipping_payment_status == 'pending' && item?.shipping_cost != 0 &&
                <Button
                    title={'پرداخت هزینه ارسال'}
                    onPress={() => {
                        if (type == 'gold') {

                            navigation.navigate("ShippingDeliveryPayment", { physical_delivery_request_id: item?.id, shipping_cost: item?.shipping_cost })
                        } else {
                            navigation.navigate("ShippingDeliveryPaymentSilver", { physical_delivery_silver_request_id: item?.id, shipping_cost: item?.shipping_cost })

                        }
                    }}
                />
            }
            {
                (item?.signed_delivery_form && item?.signed_delivery_form != null) &&
                <Button
                    title={'مشاهده فرم تحویل'}
                    onPress={() => {
                        Linking.openURL(`${mainUri}${item?.signed_delivery_form}`)
                    }}
                />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        width: deviceWidth * 0.9,
        backgroundColor: themeColor12.bgColor(1),
        paddingHorizontal: '5%',
        paddingVertical: 15,
        gap: 10
    },
})