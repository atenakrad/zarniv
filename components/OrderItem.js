import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';

import { mainUri } from '../services/URL';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor1, themeColor11, themeColor4, themeColor5, themeColor6, themeColor7 } from '../theme/Color';
import ImageThumbnail from '../components/ImageThumbnail';
import { formatDate, formatPrice } from '../helpers/Common';

export default function OrdersItem({ item, navigation }) {

    const { t } = useTranslation();
 
    const orderDetails = item?.order_details;

    const paidPrice = (manual_reservation_status) => {
        if (manual_reservation_status == 'none' || manual_reservation_status == 'completed') {
            return item?.get_total_with_shipping
        } else {
            return item?.reserved_amount
        }
    }

    const reserveStatus = (manual_reservation_status) => {
        if (manual_reservation_status == 'pending') {
            return ({
                lable: 'در انتظار تکمیل پرداخت',
                color: themeColor11
            })
        } else if (manual_reservation_status == 'completed') {
            return ({
                lable: 'پرداخت تکمیل شده',
                color: themeColor7
            })
        } else if (manual_reservation_status == 'expired') {
            return ({
                lable: 'منقضی شده',
                color: themeColor6
            })
        } else {
            return ({
                lable: 'لغو شده',
                color: themeColor6
            })
        }
    }

    return (
        <Pressable style={[styles.itemWrapper, NewStyles.shadow,]} onPress={() => navigation.navigate('Order Detail', { orderId: item?.id })}>
            <View style={NewStyles.rowWrapper}>
                <Text style={NewStyles.text10}>شناسه سفارش: {item?.id}</Text>
                <Text style={NewStyles.text10}>{formatDate(item?.created_at)}</Text>
            </View>
            <View style={NewStyles.rowWrapper}>
                {orderDetails?.length > 2 && <Text style={NewStyles.text10}>+ {orderDetails?.length - 2} {t('more')}</Text>}
                <FlatList
                    contentContainerStyle={styles.imageListWrapper}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={orderDetails?.slice(0, 2)}
                    keyExtractor={(item) => item?.id?.toString()}
                    renderItem={({ item }) => {
                        return (
                            <View style={[styles.imageItemWrapper, NewStyles.center]}>
                                {item?.last_image ? <Image style={styles.imageItem} source={{ uri: `${mainUri}${item?.last_image}` }} /> : <ImageThumbnail />}
                            </View>
                        )
                    }}
                />
            </View>
            
            <View style={NewStyles.rowWrapper}>
                <Text style={NewStyles.text10}>{'مبلغ پرداختی: '} {formatPrice(paidPrice(item?.manual_reservation_status))} {t('currency unit')}</Text>

            </View>
            {item?.manual_reservation_status != 'none' && <View style={[NewStyles.rowWrapper, { marginTop: 5 }]}>
                <Text style={NewStyles.text10}>وضعیت رزرو</Text>


                <View style={[{ backgroundColor: reserveStatus(item?.manual_reservation_status).color.bgColor(0.1), paddingHorizontal: 10, paddingVertical: 5 }, NewStyles.border100]}>
                    <Text style={[NewStyles.text, { fontSize: 12, color: reserveStatus(item?.manual_reservation_status).color.color }]}>{reserveStatus(item?.manual_reservation_status)?.lable}</Text>
                </View>
            </View>
            }
        </Pressable>
    )
}

const styles = StyleSheet.create({

    itemWrapper: {
        backgroundColor: themeColor4.bgColor(1),
        padding: '5%',
        ...NewStyles.border5
    },

    imageListWrapper: {
        gap: 10,
        marginVertical: 10,
    },

    imageItemWrapper: {
        height: deviceWidth * 0.2,
        width: deviceWidth * 0.2,
    },

    imageItem: {
        height: '100%',
        width: '100%',
    },

    status: {
        fontFamily: 'VazirLight',
        textAlign: 'auto',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: themeColor1.bgColor(0.3),
        color: themeColor4.bgColor(1),
    },
});