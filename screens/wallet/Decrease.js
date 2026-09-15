import { FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor12, themeColor3, themeColor6 } from '../../theme/Color';
import Button from '../../components/Button';
import TransparentButton from '../../components/TransparentButton';
import BankAccountSelector from '../../components/BankAccountSelector';
import { uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { fetchUser } from '../../slices/userSlice';
import WithdrawalItem from '../../components/WithdrawalItem';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Decrease({ navigation }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const user = useSelector((state) => state.user?.data);

    const [refreshing, setRefreshing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [data, setData] = useState([]);
    const [userAccounts, setUserAccounts] = useState([]);
    const [selectedBankAccountId, setSelectedBankAccountId] = useState(null);

    const fetchBankAccounts = async () => {
        if (!accessToken) return;
        try {
            const response = await axios.get(`${uri}/bank-accounts/`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const verified = response?.data?.verified_user_accounts || [];
            setUserAccounts(verified);

            const selectedStillExists = verified.some(
                (item) => String(item?.id) === String(selectedBankAccountId)
            );
            if (!selectedStillExists) {
                const defaultAccount = verified.find((item) => item?.is_default) || verified[0];
                setSelectedBankAccountId(defaultAccount?.id || null);
            }
        } catch (error) {
            handleError(error, t);
        }
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/fetchWithdrawRequests/`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setData(response?.data || []);
            await fetchBankAccounts();
        } catch (error) {
            handleError(error, t);
            
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        } finally {
            setRefreshing(false);
        }
    };

    const decreaseWallet = async () => {
        if (!selectedBankAccountId) {
            showToastOrAlert('لطفاً حساب بانکی مقصد را انتخاب کنید.');
            return;
        }

        const numericAmount = Number(String(amount || '').replace(/,/g, ''));
        if (!Number.isFinite(numericAmount) || numericAmount < 10000) {
            showToastOrAlert('حداقل مبلغ برداشت ۱۰,۰۰۰ تومان است.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${uri}/decreaseWallet/`,
                {
                    amount: numericAmount,
                    bank_account_id: selectedBankAccountId,
                },
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.status === 201) {
                dispatch(fetchUser(accessToken));
                showToastOrAlert(response?.data?.message);
                setAmount('');
                await fetchData();
            }
        } catch (error) {
            const message = error?.response
                ? error?.response?.data?.message || t('An unexpected error occurred!')
                : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) fetchData();
    }, [accessToken]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchBankAccounts);
        return unsubscribe;
    }, [navigation, accessToken, selectedBankAccountId]);

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        colors={[themeColor0.bgColor(1)]}
                        progressBackgroundColor={themeColor1.bgColor(1)}
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchData();
                        }}
                    />
                }
                contentContainerStyle={[styles.contentContainerStyle, { paddingHorizontal: 0, paddingTop: 0 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />

                {(!user?.is_national_birth_verified || !user?.is_phone_national_verified) && (
                    <View style={[styles.warningBox, NewStyles.border10, NewStyles.shadow]}>
                        <View style={[NewStyles.row, { gap: 10 }]}>
                            <Ionicons name='alert-circle-outline' size={24} color={themeColor10.bgColor(1)} />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>
                                حساب کاربری شما احراز هویت نشده است. برای ثبت درخواست ابتدا احراز هویت را تکمیل کنید.
                            </Text>
                        </View>
                        <Button title={'احراز هویت'} onPress={() => navigation.navigate('Verify')} />
                    </View>
                )}

                {(user?.is_national_birth_verified && user?.is_phone_national_verified && userAccounts.length === 0) && (
                    <View style={[styles.bankWarning, NewStyles.border10]}>
                        <View style={[NewStyles.row, { gap: 10 }]}>
                            <Ionicons name='alert-circle-outline' size={24} color={themeColor6.bgColor(1)} />
                            <Text style={[NewStyles.text6, { flex: 1 }]}>
                                برای برداشت باید حداقل یک حساب بانکی احرازشده داشته باشید.
                            </Text>
                        </View>
                        <Button title={'افزودن حساب بانکی'} onPress={() => navigation.navigate('EditCard')} />
                    </View>
                )}

                <View style={{ paddingHorizontal: '5%', gap: 10 }}>
                    <Text style={NewStyles.title10}>حساب مقصد برداشت</Text>
                    <BankAccountSelector
                        accounts={userAccounts}
                        selectedId={selectedBankAccountId}
                        onSelect={setSelectedBankAccountId}
                        emptyText={'حساب احرازشده‌ای برای برداشت ندارید.'}
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
                        maxLength={15}
                        placeholder='مبلغ به تومان'
                        value={amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        onChangeText={(text) => setAmount(text?.replace(/,/g, '').replace(/[^0-9]/g, ''))}
                    />
                    <Button title={'ثبت درخواست'} loading={loading} onPress={decreaseWallet} />
                </View>

                <FlatList
                    contentContainerStyle={styles.contentContainerStyle}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    data={data}
                    keyExtractor={(item) => item?.id?.toString()}
                    ListHeaderComponent={data.length > 0 ? <Text style={NewStyles.title10}>درخواست‌های شما</Text> : null}
                    renderItem={({ item }) => <WithdrawalItem item={item} />}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        gap: 10,
    },
    warningBox: {
        padding: '5%',
        gap: 10,
        backgroundColor: themeColor12.bgColor(1),
        paddingHorizontal: '5%',
    },
    bankWarning: {
        padding: '5%',
        gap: 10,
        backgroundColor: themeColor6.bgColor(0.1),
        paddingHorizontal: '5%',
    },
});
