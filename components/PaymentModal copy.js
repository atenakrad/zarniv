import { View, Modal, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as Linking from "expo-linking";

import { themeColor1, themeColor5 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';
import TransparentButton from './TransparentButton';
import { uri } from '../services/URL';
import { formatPrice, showToastOrAlert } from '../helpers/Common';
import { fetchCart } from '../slices/cartSlice';
import { fetchUser } from '../slices/userSlice';
import axios from 'axios';
import { emptyAddress } from '../slices/addressSlice';

export default function PaymentModal({ paymentModal, setPaymentModal, title, navigation }) {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const user = useSelector(state => state.user);
    const address = useSelector(state => state?.address);
    const [loading, setLoading] = useState(false);

    const redirectUrl = Linking.createURL("/?");

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
                navigation.navigate('DrawerLayout', { screen: 'Orders' })
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
                _addLinkingListener()
                let result = await Linking.openURL(`${uri}/order/submit/gateway?linkingUri=${redirectUrl}&payment_method=${'gateway'}&full_name=${address?.full_name}&phone=${address?.phone}&address=${address?.address}&city=${address?.city}&postalcode=${address?.postalcode}&number=${address?.number}&unit=${address?.unit}&description=${address?.description}&shippingMethods=${encodeURIComponent(JSON.stringify(address?.shippingMethods))}&userId=${user?.data?.id}`);
                let redirectData;
                if (result.url) {
                    redirectData = Linking.parse(result.url);
                }
            } catch (error) {
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
            await axios.post(`${uri}/order/submit/wallet`, { payment_method: 'wallet', full_name: address?.full_name, phone: address?.phone, address: address?.address, city: address?.city, postalcode: address?.postalcode, number: address?.number, unit: address?.unit, description: address?.description, shippingMethods: JSON.stringify(address?.shippingMethods) }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
                .then((response) => {
                    if (response.status == 201) {
                        dispatch(fetchUser(accessToken))
                        dispatch(fetchCart(accessToken))
                        dispatch(emptyAddress())
                        showToastOrAlert(response?.data?.message)
                        navigation.navigate('DrawerLayout', { screen: 'Orders' })
                    }
                })
                .catch((error) => {
                    const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
                    showToastOrAlert(message);
                }).finally(() => {
                    setLoading(false);
                })
            // try {
            //     // if (response.status == 201) {
            //     //     dispatch(fetchUser(accessToken))
            //     //     dispatch(fetchCart(accessToken))
            //     //     dispatch(emptyAddress())
            //     //     showToastOrAlert(response?.data?.message)
            //     //     navigation.navigate('DrawerLayout', { screen: 'Orders' })
            //     // }
            // } catch (error) {
            //     const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            //     showToastOrAlert(message);
            // } finally {
            //     setLoading(false);
            // }
        } else {
            setLoading(false);
            showToastOrAlert('انتخاب روش ارسال الزامی می باشد.')
        }
    }

    return (
        <Modal animationType='fade' transparent={true} visible={paymentModal} onRequestClose={() => { setPaymentModal(!paymentModal); }}>
            <TouchableWithoutFeedback onPress={() => { setPaymentModal(false) }}>
                <View style={[styles.wrapper, NewStyles.center]}>
                    <View style={[styles.modalView, NewStyles.border5]}>
                        <Text style={NewStyles.title10}>{title}</Text>
                        <Text style={NewStyles.text10}>{t('موجودی کیف پول: ')} {formatPrice(user?.data?.wallet?.balance)} {t('currency unit')}</Text>
                        <View style={[NewStyles.rowWrapper, { justifyContent: 'flex-end', gap: 10 }]}>
                            <TransparentButton title={`${t('پرداخت از کیف پول')}`} onPress={() => { walletPayment('wallet'); setPaymentModal(false); }} />
                            <TransparentButton title={`${t('درگاه پرداخت')}`} onPress={() => { gatewayPayment('gateway'); setPaymentModal(false); }} />
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
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