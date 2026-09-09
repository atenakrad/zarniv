import { View, StyleSheet, Text, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor12 } from '../theme/Color';
import { formatDate, formatPrice } from '../helpers/Common';
import { formatGramLimit } from '../helpers/tradeLimits';
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
            {item?.delivery_piece_title
                ? renderRow('قطعه تحویلی', `${item.delivery_piece_title}`)
                : renderRow('مقدار درخواست', `${formatGramLimit(item?.weight_gram || Number(item?.weight || 0) / 1000)} گرم`)}
            {!!item?.delivery_piece_weight_mg && renderRow('وزن اسمی قطعات', `${formatGramLimit(Number(item.delivery_piece_weight_mg) / 1000)} گرم`)}
            {!!item?.wallet_deduction_mg && renderRow('کسر از کیف پول', `${formatGramLimit(Number(item.wallet_deduction_mg) / 1000)} گرم`)}
            {renderRow('نام تحویل گیرنده', `${item?.receiver_name}`)}
            {renderRow('شماره تماس تحویل گیرنده', `${item?.receiver_phone}`)}
            {renderRow('کدملی تحویل گیرنده', `${item?.receiver_national_code}`)}
            {renderRow('روش تحویل', `${item?.delivery_method == 'shipping' ? 'ارسال به آدرس' : 'تحویل حضوری'}`)}
            {item?.delivery_method === 'pickup' && item?.pickup_store_detail?.shop_name && renderRow('فروشگاه تحویل', item.pickup_store_detail.shop_name)}
            {item?.delivery_method === 'pickup' && item?.pickup_store_detail?.address && renderRow('آدرس فروشگاه', item.pickup_store_detail.address)}
            {item?.delivery_method === 'pickup' && item?.pickup_time_slot_detail && renderRow(
                'زمان تحویل',
                `${item.pickup_time_slot_detail.title ? `${item.pickup_time_slot_detail.title} - ` : ''}${formatDate(item.pickup_time_slot_detail.start_at)} تا ${formatDate(item.pickup_time_slot_detail.end_at)}`
            )}
            {item?.delivery_method === 'pickup' && !item?.pickup_time_slot_detail && item?.pickup_requested_at && renderRow('زمان تحویل', formatDate(item.pickup_requested_at))}
            {item?.delivery_method === 'shipping' && item?.shipping_post_detail?.name && renderRow('روش ارسال', item.shipping_post_detail.name)}
            {item?.shipping_address && renderRow('آدرس تحویل:', ` `)}
            {item?.shipping_address && renderRow(`${item?.shipping_address}`, ` `)}
            {item?.shipping_postal_code && renderRow('کدپستی', `${item?.shipping_postal_code}`)}
            {item?.delivery_method === 'shipping' && Number(item?.shipping_base_cost || 0) > 0 && renderRow('هزینه پایه ارسال', `${formatPrice(item?.shipping_base_cost)} تومان`)}
            {item?.delivery_method === 'shipping' && Number(item?.shipping_insurance_cost || 0) > 0 && renderRow('هزینه بیمه', `${formatPrice(item?.shipping_insurance_cost)} تومان`)}
            {item?.delivery_method === 'shipping' && Number(item?.shipping_cost || 0) > 0 && renderRow('جمع ارسال و بیمه', `${formatPrice(item?.shipping_cost)} تومان`)}
            {item?.delivery_method === 'shipping' && item?.shipping_payment_status === 'paid' && renderRow('وضعیت هزینه ارسال', 'پرداخت شده', NewStyles.text7)}
            {item?.delivery_method === 'shipping' && item?.shipping_payment_pending_receipt && renderRow('وضعیت هزینه ارسال', 'فیش در انتظار بررسی', NewStyles.text11)}
            {item?.delivery_method === 'shipping' && item?.shipping_payment_status === 'pending' && item?.status !== 'approved' && renderRow('وضعیت هزینه ارسال', 'پرداخت پس از تأیید درخواست فعال می‌شود', NewStyles.text11)}
            {item?.notes && renderRow('توضیحات ضمیمه:', ` `)}
            {item?.notes && renderRow(`${item?.notes}`, ` `)}
            {
                item?.shipping_payment_can_submit && item?.shipping_cost != 0 &&
                <Button
                    title={'پرداخت هزینه ارسال'}
                    onPress={() => {
                        if (type == 'gold') {

                            navigation.navigate("ShippingDeliveryPayment", { physical_delivery_request_id: item?.id, shipping_cost: item?.shipping_cost, shipping_base_cost: item?.shipping_base_cost, shipping_insurance_cost: item?.shipping_insurance_cost })
                        } else {
                            navigation.navigate("ShippingDeliveryPaymentSilver", { physical_delivery_silver_request_id: item?.id, shipping_cost: item?.shipping_cost, shipping_base_cost: item?.shipping_base_cost, shipping_insurance_cost: item?.shipping_insurance_cost })

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