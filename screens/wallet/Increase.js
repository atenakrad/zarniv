import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Linking from 'expo-linking';
import axios from 'axios';

import NewStyles from '../../styles/NewStyles';
import { themeColor10, themeColor12, themeColor3 } from '../../theme/Color';
import Button from '../../components/Button';
import TransparentButton from '../../components/TransparentButton';
import BankInfoComponent from '../../components/BankInfoComponent';
import RecieptFormComponent from '../../components/RecieptFormComponent';
import BankAccountSelector from '../../components/BankAccountSelector';
import { uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { fetchUser } from '../../slices/userSlice';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';

export default function Increase({ navigation }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const tradingData = useSelector((state) => state?.trading?.data);

    const [loading, setLoading] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [amount, setAmount] = useState('');
    const [userAccounts, setUserAccounts] = useState([]);
    const [siteAccounts, setSiteAccounts] = useState([]);
    const [selectedBankAccountId, setSelectedBankAccountId] = useState(null);

    const fetchBankAccounts = async () => {
        if (!accessToken) return;
        setLoadingAccounts(true);
        try {
            const response = await axios.get(`${uri}/bank-accounts/`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const verified = response?.data?.verified_user_accounts || [];
            const sites = response?.data?.site_accounts || [];
            setUserAccounts(verified);
            setSiteAccounts(sites);

            const selectedStillExists = verified.some(
                (item) => String(item?.id) === String(selectedBankAccountId)
            );
            if (!selectedStillExists) {
                const defaultAccount = verified.find((item) => item?.is_default) || verified[0];
                setSelectedBankAccountId(defaultAccount?.id || null);
            }
        } catch (error) {
            handleError(error, t);
        } finally {
            setLoadingAccounts(false);
        }
    };

    useEffect(() => {
        const subscription = Linking.addEventListener('url', ({ url }) => {
            const { queryParams } = Linking.parse(url);

            if (queryParams?.Status === 'OK' && queryParams?.type === 'wallet') {
                dispatch(fetchUser(accessToken));
                showToastOrAlert('کیف پول شما با موفقیت شارژ شد.');
                setAmount('');
            } else if (queryParams?.Status === 'NOK' && queryParams?.type === 'wallet') {
                showToastOrAlert('پرداخت با خطا مواجه شد.');
            }
            setLoading(false);
        });

        return () => subscription.remove();
    }, [accessToken]);

    useEffect(() => {
        dispatch(fetchTradingAllowed());
        fetchBankAccounts();
    }, [accessToken]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchBankAccounts);
        return unsubscribe;
    }, [navigation, accessToken, selectedBankAccountId]);

    const redirectUrl = Linking.createURL('/?');

    const increaseWallet = async () => {
        const numericAmount = Number(String(amount || '').replace(/,/g, ''));

        if (!selectedBankAccountId) {
            showToastOrAlert('لطفاً حساب بانکی مبدأ را انتخاب کنید.');
            return;
        }

        if (!Number.isFinite(numericAmount) || numericAmount < 10000) {
            showToastOrAlert('حداقل مبلغ برای شارژ کیف پول ۱۰,۰۰۰ تومان است.');
            return;
        }

        if (tradingData?.gateway_payment_limit && numericAmount > Number(tradingData.gateway_payment_limit)) {
            showToastOrAlert('عبور از سقف تراکنش');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${uri}/increaseWallet/`,
                {
                    amount: numericAmount,
                    bank_account_id: selectedBankAccountId,
                    linkingUri: redirectUrl,
                },
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const paymentUrl = response?.data?.payment_url;
            if (!paymentUrl) {
                throw new Error('payment_url missing');
            }
            // ابتدا لینک عمومی و امضاشده API در مرورگر باز می‌شود؛
            // بک‌اند از همان درخواست مرورگر session لازم برای SEP را ساخته و سپس redirect می‌کند.
             
            await Linking.openURL(paymentUrl);
        } catch (error) {
            handleError(error, t);
            setLoading(false);
        }finally{
            setLoading(false)
        }
    };

    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
                <ScrollView contentContainerStyle={styles.contentContainerStyle}>
                    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />

                    <Text style={NewStyles.title10}>شارژ کیف پول از درگاه</Text>
                    <Text style={NewStyles.text10}>
                        حساب بانکی مبدأ را انتخاب کنید. اطلاعات همین حساب داخل تراکنش ذخیره می‌شود.
                    </Text>

                    <BankAccountSelector
                        title={'حساب بانکی مبدأ'}
                        accounts={userAccounts}
                        selectedId={selectedBankAccountId}
                        onSelect={setSelectedBankAccountId}
                        emptyText={'هنوز حساب بانکی احرازشده‌ای ندارید.'}
                    />

                    <TransparentButton
                        title={'مدیریت / افزودن حساب بانکی'}
                        onPress={() => navigation.navigate('EditCard')}
                    />

                    <Text style={NewStyles.text10}>مبلغ مورد نظر خود را به تومان وارد کنید.</Text>
                    <TextInput
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                        placeholderTextColor={themeColor10.bgColor(0.5)}
                        keyboardType={Platform?.OS === 'ios' ? 'numbers-and-punctuation' : 'number-pad'}
                        placeholder='مبلغ به تومان'
                        value={amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        onChangeText={(text) => setAmount(text?.replace(/,/g, '').replace(/[^0-9]/g, ''))}
                    />
                    <Button
                        title={'پرداخت'}
                        loading={loading || loadingAccounts}
                        onPress={increaseWallet}
                    />

                    <View style={{ height: 6 }} />
                    <BankInfoComponent siteAccounts={siteAccounts} />

                    <RecieptFormComponent
                        title={'شارژ دستی کیف پول'}
                        request_type={'wallet'}
                        userBankAccounts={userAccounts}
                        siteBankAccounts={siteAccounts}
                        onSuccess={fetchBankAccounts}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingBottom: '5%',
        gap: 10,
    },
});
