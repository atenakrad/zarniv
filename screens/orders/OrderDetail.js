import { FlatList, StyleSheet, Text, View, Platform, ToastAndroid, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios';

import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import { useTranslation } from 'react-i18next';
import { formatDate, formatPrice, handleError } from '../../helpers/Common';
import OrderDetailItem from '../../components/OrderDetailItem';
import { themeColor0, themeColor11, themeColor12, themeColor3, themeColor5, themeColor6, themeColor7 } from '../../theme/Color';
import { uri } from '../../services/URL';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loader from './../../components/Loader';
import Button from './../../components/Button';
import { useNavigation } from '@react-navigation/native';

export default function OrderDetail({ route }) {
    const navigation = useNavigation()
    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken)
    const [refreshing, setRefreshing] = useState(true)
    const [loading, setLoading] = useState(true);

    const orderId = route?.params?.orderId

    const [data, setData] = useState(null);
    const fetchData = async () => {
        try {
            const response = await axios.post(`${uri}/orderDetail/`, { orderId: orderId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } });
            setData(response.data);
        } catch (error) {

            handleError(error, t)
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
    const paidPrice = (manual_reservation_status) => {
        if (manual_reservation_status == 'none' || manual_reservation_status == 'completed') {
            return data?.get_total_with_shipping
        } else {
            return data?.reserved_amount
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


    if (loading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView edges={{ top: 'additive', bottom: 'additive' }} style={NewStyles.container}>
            <View style={[NewStyles.center, { paddingVertical: '5%' }]}>
                <Text style={NewStyles.heading10}>جزئیات سفارش</Text>
            </View>
            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
            <FlatList
                contentContainerStyle={styles.contentContainerStyle}
                showsVerticalScrollIndicator={false}
                data={data?.order_details}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => {
                    setRefreshing(true);
                    fetchData()
                }} />}
                ListHeaderComponent={() => (
                    <View style={[styles.headerWrapper, NewStyles.shadow]} >
                        <View style={[NewStyles.rowWrapper]}>
                            <Text style={NewStyles.title10}>کدپیگیری سفارش</Text>
                            <Text style={NewStyles.text10}>{data?.id}</Text>
                        </View>
                        <View style={[NewStyles.rowWrapper]}>
                            <Text style={NewStyles.title10}>{t('مجموع مبلغ سفارش')}</Text>
                            <Text style={NewStyles.text10}>{(formatPrice(data?.get_total_price))} {t('currency unit')}</Text>
                        </View>
                        <View style={[NewStyles.rowWrapper]}>
                            <Text style={NewStyles.title10}>{t('Delivery Fee')}</Text>
                            <Text style={NewStyles.text10}>{data?.get_total_shipping_price == 0 ? 'تحویل رایگان' : `${formatPrice(data?.get_total_shipping_price)} ${t('currency unit')}`}</Text>
                        </View>
                        {data?.packaging_option?.id && <View style={[NewStyles.rowWrapper]}>
                            <Text style={NewStyles.title10}>هزینه بسته بندی</Text>
                            <Text style={NewStyles.text10}>{formatPrice(data?.packaging_option?.price)} تومان</Text>
                        </View>}
                        <View style={[NewStyles.rowWrapper]}>
                            <Text style={NewStyles.title10}>{t('مبلغ پرداخت شده')}</Text>
                            <Text style={NewStyles.text10}>{formatPrice(paidPrice(data?.manual_reservation_status))} {t('currency unit')}</Text>
                        </View>
                        {data?.pay_type == 4 && <View style={NewStyles.rowWrapper}>
                            <Text style={NewStyles.title10}>وضعیت رزرو</Text>
                            <View style={[{ backgroundColor: reserveStatus(data?.manual_reservation_status).color.bgColor(0.1), paddingHorizontal: 10, paddingVertical: 5 }, NewStyles.border100]}>
                                <Text style={[NewStyles.text, { fontSize: 12, color: reserveStatus(data?.manual_reservation_status).color.color }]}>{reserveStatus(data?.manual_reservation_status)?.lable}</Text>
                            </View>
                        </View>}
                        {data?.pay_type == 4 && <View style={NewStyles.rowWrapper}>
                            <Text style={NewStyles.title10}>مهلت پرداخت باقی مبلغ</Text>
                            <Text style={[NewStyles.text]}>{formatDate(data?.reservation_expires_at)}</Text>
                        </View>}
                        {data?.packaging_option?.id && <View style={[NewStyles.rowWrapper]}>
                            <Text style={NewStyles.title10}>بسته بندی</Text>
                            <Text style={NewStyles.text10}>{data?.packaging_option?.title}</Text>
                        </View>}
                        {data?.order_details?.[0]?.shipping_method && <View style={[NewStyles.rowWrapper]}>
                            <Text style={NewStyles.title10}>روش ارسال</Text>
                            <Text style={NewStyles.text10}>{data?.order_details?.[0]?.shipping_method}</Text>
                        </View>}
                        {data?.order_details?.[0]?.shipping_tracking_code && <View style={[NewStyles.rowWrapper]}>
                            <Text style={NewStyles.title10}>کد رهگیری</Text>
                            <Text style={NewStyles.text10}>{data?.order_details?.[0]?.shipping_tracking_code}</Text>
                        </View>}
                        <View>
                            <Text style={NewStyles.title10}>{t('Address')}</Text>
                            <Text style={NewStyles.text10}>{data?.city}, {data?.address}, پلاک {data?.number}, واحد {data?.unit}</Text>
                        </View>
                        {data?.description && <View>
                            <Text style={NewStyles.title10}>توضیحات</Text>
                            <Text style={NewStyles.text10} >{data?.description}</Text>
                        </View>}
                        {!(data?.pay_type != 4 || data?.manual_reservation_status != 'pending') &&
                            <Button
                                title={'تسویه باقی‌مانده سفارش'}
                                onPress={() => {
                                    navigation.navigate('PayReserve', { orderId: orderId, price: Number(data?.get_total_with_shipping) - Number(data?.reserved_amount) })
                                }}
                            />
                        }
                    </View>
                )}
                renderItem={({ item }) =>
                    <OrderDetailItem item={item} />
                }

            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
    },
    contentContainerStyle: {
        gap: 2,
    },
    headerWrapper: {
        width: deviceWidth,
        backgroundColor: themeColor5.bgColor(1),
        padding: '5%',
        gap: 10,
    },
});