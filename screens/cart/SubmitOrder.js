import React, { useEffect, useState } from 'react';
import { FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { fetchCart } from '../../slices/cartSlice';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { fetchUser } from '../../slices/userSlice';
import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import { themeColor0, themeColor12, themeColor3 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import PaymentModal from '../../components/PaymentModal';

export default function SubmitOrder({ navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/fetchShippingMethods/`);
            setData(response.data);
            setShippingMethodId(parseFloat(response?.data[0]?.id));
            setShippingMethodPrice(parseFloat(response?.data[0]?.price));
        } catch (error) {
            Platform.OS === 'android' ? ToastAndroid.show(`${t('Something went wrong!')}`, ToastAndroid.SHORT) : alert(`${t('Something went wrong!')}`)
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    const [address, setAddress] = useState(null);
    const [shippingMethodId, setShippingMethodId] = useState(null);
    const totalPrice = parseFloat(useSelector(state => state.cart.totalPrice));
    const totalDiscountedPrice = parseFloat(useSelector(state => state.cart.totalDiscountedPrice));
    const [shippingMethodPrice, setShippingMethodPrice] = useState(null);

    const [paymentModal, setPaymentModal] = useState(false);

    const submitOrderWallet = async () => {
        try {
            const response = await axios.post(`${uri}/submitOrderWallet/`, { address: address, shippingMethodId: shippingMethodId, shippingMethodPrice: shippingMethodPrice }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status == 200) {
                Platform.OS === 'android' ? ToastAndroid.show(`${t('Your order has been placed successfully!')}`, ToastAndroid.SHORT) : alert(`${t('Your order has been placed successfully!')}`)
                dispatch(fetchUser(accessToken));
                dispatch(fetchCart(accessToken));
                navigation.navigate('DrawerLayout', { screen: 'MainLayout' })
            }
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        Platform.OS === 'android' ? ToastAndroid.show(`${t('Unauthorized access. Please login.')}`, ToastAndroid.SHORT) : alert(`${t('Unauthorized access. Please login.')}`)
                        break;
                    case 404:
                        Platform.OS === 'android' ? ToastAndroid.show(`${t('Product variation not found.')}`, ToastAndroid.SHORT) : alert(`${t('Product variation not found.')}`)
                        break;
                    case 409:
                        Platform.OS === 'android' ? ToastAndroid.show(`${t('Insufficient stock or wallet balance.')}`, ToastAndroid.SHORT) : alert(`${t('Insufficient stock or wallet balance.')}`)
                        break;
                    default:
                        Platform.OS === 'android' ? ToastAndroid.show(`${t('An error occurred. Please try again later.')}`, ToastAndroid.SHORT) : alert(`${t('An error occurred. Please try again later.')}`)
                }
            } else {
                Platform.OS === 'android' ? ToastAndroid.show(`${t('An error occurred. Please check your internet connection.')}`, ToastAndroid.SHORT) : alert(`${t('An error occurred. Please check your internet connection.')}`)
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }
    const submitOrderCash = async () => {
        try {
            const response = await axios.post(`${uri}/submitOrderCash/`, { address: address, shippingMethodId: shippingMethodId, shippingMethodPrice: shippingMethodPrice }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status == 200) {
                Platform.OS === 'android' ? ToastAndroid.show(`${t('Your order has been placed successfully!')}`, ToastAndroid.SHORT) : alert(`${t('Your order has been placed successfully!')}`)
                dispatch(fetchUser(accessToken));
                dispatch(fetchCart(accessToken));
                navigation.navigate('Layout', { screen: 'Orders' })
            }
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        Platform.OS === 'android' ? ToastAndroid.show(`${t('Unauthorized access. Please login.')}`, ToastAndroid.SHORT) : alert(`${t('Unauthorized access. Please login.')}`)
                        break;
                    case 404:
                        Platform.OS === 'android' ? ToastAndroid.show(`${t('Product variation not found.')}`, ToastAndroid.SHORT) : alert(`${t('Product variation not found.')}`)
                        break;
                    case 409:
                        Platform.OS === 'android' ? ToastAndroid.show(`${t('Insufficient stock or wallet balance.')}`, ToastAndroid.SHORT) : alert(`${t('Insufficient stock or wallet balance.')}`)
                        break;
                    default:
                        Platform.OS === 'android' ? ToastAndroid.show(`${t('An error occurred. Please try again later.')}`, ToastAndroid.SHORT) : alert(`${t('An error occurred. Please try again later.')}`)
                }
            } else {
                Platform.OS === 'android' ? ToastAndroid.show(`${t('An error occurred. Please check your internet connection.')}`, ToastAndroid.SHORT) : alert(`${t('An error occurred. Please check your internet connection.')}`)
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    return (
        <View style={NewStyles.container}>
            <CustomStatusBar />
            {loading && <Loader />}
            <ScrollView contentContainerStyle={{ flex: 1, alignItems: 'center', paddingTop: 20 }}>
                <View style={{ width: '100%', paddingHorizontal: 15 }}>
                    <Text style={NewStyles.text4}>{t('Enter your postal address. *')}</Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text4, { marginVertical: 10 }]} autoComplete={'postal-address'} keyboardType='default' placeholderTextColor={themeColor3.bgColor(1)} placeholder={`${t('Address')}`} value={address} onChangeText={(text) => setAddress(text)} />
                    <Text style={NewStyles.text4}>{t('Choose your desired shipping method. *')}</Text>
                </View>
                <FlatList
                    contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} refreshing={refreshing} onRefresh={() => { fetchData() }} />}
                    data={data}
                    keyExtractor={(item) => item?.id?.toString()}
                    renderItem={({ item }) =>
                        <View style={[styles.itemWrapper, NewStyles.rowWrapper, NewStyles.shadow]}>
                            <BouncyCheckbox
                                size={25}
                                fillColor={themeColor0.bgColor(1)}
                                unFillColor={themeColor12.bgColor(1)}
                                iconStyle={{ borderColor: themeColor0.bgColor(1) }}
                                text={item?.name + '  ' + item?.price + '  ' + `${t('currency unit')}`}
                                innerIconStyle={{ borderWidth: 1 }}
                                textStyle={[NewStyles.text4, { textDecorationLine: 'none' }]}
                                onPress={() => {
                                    setShippingMethodId(item?.id);
                                    setShippingMethodPrice(parseFloat(item?.price));
                                }}
                                disableBuiltInState
                                isChecked={item?.id == shippingMethodId}
                            />
                        </View>
                    }
                />
                <PaymentModal paymentModal={paymentModal} setPaymentModal={setPaymentModal} title={`${t('Order Payment')}`} message={`${t('Which payment method do you prefer?')}`} walletPayment={() => { setLoading(true); submitOrderWallet() }} gatewayPayment={() => { submitOrderCash() }} />
            </ScrollView>
            <View style={[styles.footerWrapper, NewStyles.shadow]} >
            <View style={[NewStyles.rowWrapper, { marginVertical: 10 }]}>
                        <Text style={NewStyles.text4}>{t('Order Total')}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            {totalDiscountedPrice > 0 ?
                                <>
                                    <Text style={NewStyles.discountText}>{totalPrice} {t('currency unit')}</Text>
                                    <Text style={NewStyles.text4}> - </Text>
                                    <Text style={NewStyles.text4}>{totalDiscountedPrice} {t('currency unit')}</Text>
                                </>
                                :
                                <Text style={NewStyles.text4}>{totalPrice} {t('currency unit')}</Text>
                            }
                        </View>
                    </View>
                    <View style={[NewStyles.rowWrapper, { marginVertical: 10 }]}>
                        <Text style={NewStyles.text4}>{t('Discount Price')}</Text>
                        <Text style={NewStyles.text4}>{(totalDiscountedPrice - totalPrice ).toFixed(2)} {t('currency unit')}</Text>
                    </View>
                <View style={[NewStyles.rowWrapper, { marginVertical: 10 }]}>
                    <Text style={NewStyles.text4}>{t('shipping Method Price')}</Text>
                    <Text style={NewStyles.text4}>{shippingMethodPrice} {t('currency unit')}</Text>
                </View>
                <View style={[NewStyles.rowWrapper, { marginVertical: 10 }]}>
                    <Text style={NewStyles.text4}>{t('Total')}</Text>
                    <Text style={NewStyles.text4}>{totalDiscountedPrice + shippingMethodPrice} {t('currency unit')}</Text>
                </View>
                <Button title={`${t('Submit Order')}`} loading={loading}
                    onPress={() => {
                        if (address && shippingMethodId) {
                            setPaymentModal(true);
                        } else {
                            Platform.OS === 'android' ? ToastAndroid.show(`${t('Please fill in all the required fields.')}`, ToastAndroid.SHORT) : alert(`${t('Please fill in all the required fields.')}`)
                        }
                    }} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({

    itemWrapper: {
        height: 50,
        width: deviceWidth * 0.95,
        backgroundColor: themeColor12.bgColor(1),
        paddingHorizontal: 15,
    },

    contentContainerStyle: {
        gap: 10,
        paddingVertical: 10,
    },

    footerWrapper: {
        // position:'absolute',bottom: 0,
        width: deviceWidth,
        backgroundColor: themeColor12.bgColor(1),
        paddingVertical: 20,
        paddingHorizontal: '5%'
    },
})