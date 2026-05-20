import { View, Modal, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as Linking from "expo-linking";

import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor5 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';
import TransparentButton from './TransparentButton';
import { uri } from '../services/URL';
import { formatPrice, handleError, showToastOrAlert } from '../helpers/Common';
import { fetchCart } from '../slices/cartSlice';
import { fetchUser } from '../slices/userSlice';
import axios from 'axios';
import { emptyAddress } from '../slices/addressSlice';
import Button from './Button';
import { fetchInfoPrice } from '../slices/goldInfoSlice';
import { fetchRate } from '../slices/rateSlice';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentModal({ paymentModal, setPaymentModal, title, navigation, setLoading }) {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const goldInfo = useSelector(state => state.goldInfo?.data);
    const trading = useSelector((state) => state?.trading)
    const tradingData = trading?.data

    const cartItems = useSelector(state => state?.cart?.items);

    const allFreeDelivery = cartItems?.every(cart =>
        cart.labels?.some(label => label.label_type === "free_delivery")
    );

    const goldPrice = goldInfo?.gold_price_per_gram;
    const goldSellPrice = goldPrice * (1 - goldInfo?.gold_sell_percent / 100);

    const user = useSelector(state => state.user);
    const [priceInGold, setPriceInGold] = useState(0)
    const address = useSelector(state => state?.address);
    const shippingPrice = allFreeDelivery ? 0 : Number(address?.shippingMethods?.['1']?.price);

    const totalDiscountedPrice = useSelector(state => state.cart?.totalDiscountedPrice);
    const redirectUrl = Linking.createURL("/?");
    const [payWay, setPayWay] = useState(null)
    function isEmpty(obj) {
        for (const prop in obj) {
            if (Object.hasOwn(obj, prop)) {
                return false;
            }
        }
        return true;
    }

    const _addLinkingListener = () => {
        const subscription = Linking.addEventListener("url", ({ url }) => {
            const { queryParams } = Linking.parse(url);
            if (queryParams?.Status === 'OK') {
                setLoading(false);
                dispatch(fetchUser(accessToken))
                dispatch(fetchCart(accessToken))
                dispatch(emptyAddress())
                showToastOrAlert('سفارش شما با موفقیت ثبت شد.')
                navigation.replace('Orders')
            } else if (queryParams?.Status === 'NOK') {
                setLoading(false);
                showToastOrAlert('پرداخت با خطا مواجه شد.')
            }
        });
        return () => subscription.remove();
    }

    const gatewayPayment = async () => {
        if (!isEmpty(address?.shippingMethods)) {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams({
                    linkingUri: redirectUrl,
                    payment_method: 'gateway',
                    full_name: address?.full_name,
                    phone: address?.phone,
                    address: address?.address,
                    city: address?.city,
                    postalcode: address?.postalcode,
                    number: address?.number,
                    unit: address?.unit,
                    description: address?.description,
                    package: address?.package,
                    shippingMethods: JSON.stringify(address?.shippingMethods),
                    userId: user?.data?.id,
                });
                const response = await axios.get(`${uri}/order/submit/gateway?${queryParams}`);
                const startpayUrl = response?.data?.startpay_url;
                if (startpayUrl) {
                    _addLinkingListener();
                    Linking.openURL(startpayUrl);
                } else {
                    showToastOrAlert('آدرس پرداخت دریافت نشد.');
                }
            } catch (error) {
                handleError(error, t)
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
            showToastOrAlert('انتخاب روش ارسال الزامی می‌باشد.');
        }
    }



    const walletPayment = async () => {
        if (!isEmpty(address?.shippingMethods)) {
            setLoading(true);
            await axios.post(`${uri}/order/submit/wallet/`, { payment_method: payWay, full_name: address?.full_name, phone: address?.phone, address: address?.address, city: address?.city, postalcode: address?.postalcode, number: address?.number, unit: address?.unit, description: address?.description, shippingMethods: JSON.stringify(address?.shippingMethods), methodId: address?.shippingMethods?.["1"]?.methodId, price: address?.shippingMethods?.["1"]?.price, type: address?.shippingMethods?.["1"]?.type, package: address?.package, manual_reservation_status: payWay == 'reserve' ? 'pending' : 'none' }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
                .then((response) => {
                    if (response.status == 201) {
                        dispatch(fetchUser(accessToken))
                        dispatch(fetchCart(accessToken))
                        dispatch(emptyAddress())
                        showToastOrAlert(response?.data?.message)
                        navigation.replace('Orders')
                    }
                })
                .catch((error) => {
                    console.log('====================================');
                    console.log(error?.response?.status);
                    console.log('====================================');
                    handleError(error, t)
                }).finally(() => {
                    setLoading(false);
                })
        } else {
            setLoading(false);
            showToastOrAlert('انتخاب روش ارسال الزامی می باشد.')
        }
    }

    const calculatePriceFromWeight = async (numericWeight) => {
        if (!numericWeight || !goldPrice) return "";
        const payload = {
            mode: 'price',
            weight: numericWeight,
            way: 'sell'

        }
        try {
            const response = await dispatch(fetchInfoPrice({ params: payload }))
            return Math.round(response?.payload?.price);
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت طلا')
            return '0';
        }
    };
    const calculateUserPrice = async () => {
        const calculatedPrice = await calculatePriceFromWeight(user?.data?.wallet?.gold_balance * 1000);

        setPriceInGold(calculatedPrice);
    }
    useEffect(() => {
        if (user?.data?.wallet) {
            calculateUserPrice()

        }
    }, [user?.data?.wallet])

    const btnTitle = () => {
        if (payWay && payWay == "wallet") {
            if ((Number(totalDiscountedPrice) + shippingPrice + Number(address?.package_price)) > user?.data?.wallet?.balance) {
                return (false)
            } else {
                return (true)
            }
        } else if (payWay && payWay == 'gold') {
            if ((((Number(totalDiscountedPrice) + shippingPrice + Number(address?.package_price))) / goldSellPrice).toFixed(3) > Number(user?.data?.wallet?.gold_balance)) {
                return false
            } else {
                return true
            }
        } else {
            return true
        }
    }
    const validatePhone = (phone) => {
        if (phone.match(/^09\d{9}$/)) {
            return true;
        } else {
            return false;
        }
    };


    return (
        <View style={[{ paddingVertical: 20, gap: 10, backgroundColor: themeColor4.bgColor(1), paddingHorizontal: 10 }, NewStyles.border10, NewStyles.shadow]}>
            {(totalDiscountedPrice && address?.shippingMethods?.['1']?.price && address?.package && (payWay == "wallet" || payWay == 'reserve')) &&
                <View>

                    <View style={NewStyles.rowWrapper}>
                        <Text style={NewStyles.title1}>قیمت نهایی</Text>
                        <Text style={NewStyles.title1}>{formatPrice((Number(totalDiscountedPrice) + shippingPrice + Number(address?.package_price)).toFixed(0))} {t('currency unit')}</Text>
                    </View>
                    {
                        (((Number(totalDiscountedPrice) + shippingPrice + Number(address?.package_price)) > user?.data?.wallet?.balance && payWay != 'reserve') || (payWay == 'reserve' && Number(user?.data?.wallet?.balance) < Number(tradingData?.gateway_payment_limit))) &&
                        <View style={{ paddingVertical: 5 }}>
                            <Text style={NewStyles.title6}>موجودی ریالی کافی نیست.</Text>
                        </View>
                    }
                </View>
            }
            {(totalDiscountedPrice && address?.shippingMethods?.['1']?.price && address?.package && payWay == 'gold') &&
                <View>
                    <View style={NewStyles.rowWrapper}>
                        <Text style={NewStyles.title1}>وزن کل</Text>
                        <Text style={NewStyles.title1}>{(((Number(totalDiscountedPrice) + shippingPrice + Number(address?.package_price))) / goldSellPrice).toFixed(3)} گرم</Text>
                    </View>
                    {
                        (((Number(totalDiscountedPrice) + shippingPrice + Number(address?.package_price))) / goldSellPrice).toFixed(3) > Number(user?.data?.wallet?.gold_balance) &&
                        <View style={{ paddingVertical: 5 }}>
                            <Text style={NewStyles.title6}>موجودی کافی نیست.</Text>
                        </View>
                    }
                </View>
            }

            <View style={{ flex: 1, gap: 10 }}>
                <TouchableOpacity style={[{ width: '100%', paddingVertical: 10, borderWidth: 1, borderColor: themeColor0.bgColor(0), backgroundColor: themeColor3.bgColor(0.1), paddingHorizontal: 15 }, NewStyles.rowWrapper, NewStyles.border10, payWay == "wallet" && { borderColor: themeColor0.bgColor(1), borderWidth: 1 }]} onPress={() => {
                    setPayWay("wallet")
                }}>
                    <Text style={[NewStyles.title10]}>کیف پول ریالی</Text>
                    <Text style={NewStyles.title}>{formatPrice(user?.data?.wallet?.balance)} {t('currency unit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[{ width: '100%', paddingVertical: 10, borderWidth: 1, borderColor: themeColor0.bgColor(0), backgroundColor: themeColor3.bgColor(0.1), paddingHorizontal: 15 }, NewStyles.rowWrapper, NewStyles.border10, payWay == 'gold' && { borderColor: themeColor0.bgColor(1), borderWidth: 1 }]} onPress={() => {
                    setPayWay('gold')
                }}>
                    <Text style={NewStyles.title10}>کیف پول طلا</Text>
                    <Text style={NewStyles.title}>{Number(user?.data?.wallet?.gold_balance)} گرم</Text>
                </TouchableOpacity>
                {(totalDiscountedPrice && address?.shippingMethods?.['1']?.price && address?.package && (Number(totalDiscountedPrice) + shippingPrice + Number(address?.package_price)) > tradingData?.gateway_payment_limit) && <TouchableOpacity style={[{ width: '100%', paddingVertical: 10, borderWidth: 1, borderColor: themeColor0.bgColor(0), backgroundColor: themeColor3.bgColor(0.1), paddingHorizontal: 15 }, NewStyles.border10, payWay == 'reserve' && { borderColor: themeColor0.bgColor(1), borderWidth: 1 }]} onPress={() => {
                    setPayWay('reserve')
                }}>
                    <Text style={NewStyles.title10}>رزرو پرداخت</Text>
                    <Text style={[NewStyles.text3, { direction: 'rtl', textAlign: 'justify' }]}>{`سقف هر پرداخت آنلاین 200,000,000 تومان است. با انتخاب این روش، ابتدا ${formatPrice(tradingData?.gateway_payment_limit)} تومان از کیف پول پرداخت می‌شود و سفارش تا ${tradingData?.manual_reservation_hours} ساعت برای شما رزرو می‌ماند. باقی‌مانده را می‌توانید با فیش واریزی از بخش جزئیات سفارش ثبت کنید.`}</Text>
                </TouchableOpacity>}
            </View>
            {(payWay && address?.shippingMethods?.['1'] && address?.package) && <View style={{ flex: 1 }}>
                <Button title={btnTitle() ? 'پرداخت' : 'افزایش موجودی'} onPress={() => {
                    if (address?.full_name && address?.phone && address?.city && address?.postalcode && address?.address && address?.number && address?.unit && address?.phone) {
                        if (validatePhone(address?.phone)) {

                            if (!(address?.shippingMethods && Object.keys(address.shippingMethods).length > 0)) {
                                showToastOrAlert('انتخاب روش ارسال الزامی می‌باشد.')
                                return;
                            }
                        } else {
                            showToastOrAlert(t("The mobile number you entered is not valid."))
                            return;
                        }
                    } else {
                        showToastOrAlert('لطفا تمامی فیلدهای الزامی را پر کنید.')
                        return;
                    }

                    if (payWay == "wallet" && btnTitle()) {
                        walletPayment(); setPaymentModal(false)
                    } else if (payWay == "wallet" && !btnTitle()) {
                        navigation.navigate('Increase')
                    } else if (payWay == 'gold' && btnTitle()) {
                        walletPayment(); setPaymentModal(false)

                    } else if (payWay == 'gold') {
                        navigation.navigate('Purchase')
                    } else {
                        walletPayment(); setPaymentModal(false)
                    }
                }} />
            </View>}

        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: themeColor1.bgColor(0.5),
    },
    modalView: {
        height: 150,
        width: '85%',
        backgroundColor: themeColor5.bgColor(1),
        padding: 20,
        justifyContent: 'space-around',
    },
});