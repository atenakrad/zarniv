import { useEffect, useState } from 'react';
import { FlatList, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { mainUri, uri } from '../../services/URL';
import { formatDate, formatPrice, showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor11, themeColor4, themeColor5, themeColor6, themeColor7 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import BlankScreen from '../../components/BlankScreen';
import TransactionItem from '../../components/TransactionItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchUser } from '../../slices/userSlice';

export default function RecieptLists() {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const accessToken = useSelector(state => state?.token?.accessToken);
    const user = useSelector(state => state?.user?.data);
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/manual-payment-request/list/`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            setData(response?.data);
        } catch (error) {
            const message = error.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };
    useEffect(() => {
        dispatch(fetchUser(accessToken))
        fetchData();
    }, [refreshing]);
    const statusLabel = (status) => {
        if (status == 0) {
            return (
                {
                    text: 'در انتظار بررسی',
                    color: themeColor11
                }
            )
        } else if (status == 1) {
            return (
                {
                    text: 'تأیید شده',
                    color: themeColor7
                }
            )
        } else {
            return (
                {
                    text: 'رد شده',
                    color: themeColor6
                }
            )
        }
    }

    if (loading) return <Loader />;

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <CustomStatusBar />
            <FlatList

                contentContainerStyle={[styles.contentContainerStyle]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                ListEmptyComponent={<BlankScreen />}
                data={data}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item }) => {
                    return (
                        <View style={[styles.itemWrapper, NewStyles.shadow, NewStyles.border10]}>
                            <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text}>مبلغ</Text>
                                <Text style={NewStyles.text10}>{formatPrice(item?.amount)} {t('T')}</Text>
                            </View>
                            {item?.order_id && <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text}>شناسه سفارش مربوطه</Text>
                                <Text style={NewStyles.text10}>{(item?.order_id)}</Text>
                            </View>}
                            {item?.transaction_id && <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text}>شناسه تراکنش مربوطه</Text>
                                <Text style={NewStyles.text10}>{(item?.transaction_id)}</Text>
                            </View>}
                            {item?.receipt && <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text}>فیش واریزی</Text>
                                <TouchableOpacity style={{ paddingHorizontal: 5, borderBottomWidth: 1, borderBottomColor: themeColor0.bgColor(1) }} onPress={() => { Linking.openURL(`${mainUri}${item?.receipt}`) }}>
                                    <Text style={NewStyles.text}>مشاهده</Text>
                                </TouchableOpacity>
                            </View>}
                            {item?.description && <View>
                                <Text style={NewStyles.text}>توضیحات شما</Text>
                                <Text style={NewStyles.text10}>{item?.description}</Text>
                            </View>}
                            {item?.admin_note && <View>
                                <Text style={NewStyles.text}>توضیحات مدیریت</Text>
                                <Text style={NewStyles.text10}>{item?.admin_note}</Text>
                            </View>}
                            {
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text}>تاریخ و ساعت ثبت</Text>
                                    <Text style={NewStyles.text10}>{formatDate(item?.created_at)}</Text>
                                </View>
                            }
                            {
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text}>وضعیت</Text>
                                    <View style={[{paddingHorizontal:10, paddingVertical:5, backgroundColor: statusLabel(item?.status)?.color?.bgColor(0.1)}, NewStyles.border100]}>
                                        <Text style={[NewStyles.text10, { color: statusLabel(item?.status)?.color?.color, fontSize:12 }]}>{statusLabel(item?.status)?.text}</Text>
                                    </View>
                                </View>
                            }

                        </View>
                    )
                }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 5,
        paddingHorizontal: '5%',
        paddingBottom: 15
    },
    itemWrapper: {
        width: '100%',
        backgroundColor: themeColor4.bgColor(1),
        paddingHorizontal: 10,
        paddingVertical: 15,
        gap: 5
    },
})