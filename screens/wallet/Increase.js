import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import * as Linking from "expo-linking";

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor12, themeColor3 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { fetchUser } from '../../slices/userSlice';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import TransparentButton from '../../components/TransparentButton';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';
import BankInfoComponent from '../../components/BankInfoComponent';
import RecieptFormComponent from '../../components/RecieptFormComponent';
export default function Increase({ navigation }) {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const trading = useSelector((state) => state?.trading)
    const tradingData = trading?.data

    const user = useSelector((state) => state.user?.data);
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(null)


    useEffect(() => {
        const subscription = Linking.addEventListener("url", ({ url }) => {
            const { queryParams } = Linking.parse(url);
            console.log(queryParams);
            
            if (queryParams?.Status == 'OK' && queryParams?.type == 'wallet') {
                dispatch(fetchUser(accessToken));
                showToastOrAlert('کیف پول شما با موفقیت شارژ شد.');
                setLoading(false);
            } else if (queryParams?.Status == 'NOK' && queryParams?.type == 'wallet') {
                showToastOrAlert('پرداخت با خطا مواجه شد.');
                setLoading(false);
            }
        });
        return () => subscription.remove();
    }, []);

    const redirectUrl = Linking.createURL("/?");

    const increaseWallet = async () => {

        if (amount > tradingData?.gateway_payment_limit) {
            showToastOrAlert('عبور از سقف تراکنش');
            return;
        }

        setLoading(true);
        try {
            await Linking.openURL(`${uri}/increaseWallet?linkingUri=${redirectUrl}&amount=${amount}&userId=${user?.id}`);
        } catch (error) {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        dispatch(fetchTradingAllowed())
    }, [])

    return (
        <SafeAreaView style={NewStyles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>

                <ScrollView contentContainerStyle={styles.contentContainerStyle}>
                    <View style={NewStyles.center}>
                        <Text style={NewStyles.heading10}>افزایش موجودی</Text>
                    </View>
                    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                    <Text style={NewStyles.text10}>مبلغ مورد نظر خود را به تومان وارد کنید.</Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} placeholder='مبلغ به تومان' value={amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChangeText={(text) => { setAmount(text?.replace(/,/g, "")) }} />
                    <Button title={'پرداخت'}
                        loading={loading}
                        onPress={() => {
                            if (amount >= 10000) {
                                increaseWallet()
                            } else {
                                const message = 'حداقل مبلغ برای شارژ کیف پول ۱۰.۰۰۰ تومان می باشد.'
                                showToastOrAlert(message)
                            }
                        }}
                    />

                    <BankInfoComponent />
                    <RecieptFormComponent
                        title={'شارژ دستی کیف پول'}
                        request_type={'wallet'}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        gap: 10,
    },
});