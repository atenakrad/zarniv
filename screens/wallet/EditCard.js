import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor11, themeColor12, themeColor3, themeColor6, themeColor7 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { fetchUser } from '../../slices/userSlice';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditCard({ navigation }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const user = useSelector((state) => state.user?.data);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [title, setTitle] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [makeDefault, setMakeDefault] = useState(false);

    const fetchAccounts = async () => {
        if (!accessToken) return;
        setRefreshing(true);
        try {
            const response = await axios.get(`${uri}/bank-accounts/`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setAccounts(response?.data?.user_accounts || []);
        } catch (error) {
            console.log(error);

            handleError(error, t);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [accessToken]);

    const verify = async () => {
        const card = String(accountNumber || '').replace(/\D/g, '');
        if (card.length !== 16) {
            showToastOrAlert('لطفاً شماره کارت ۱۶ رقمی معتبر وارد کنید.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${uri}/verify-bank-info/`,
                {
                    accountNumber: card,
                    title: title.trim(),
                    make_default: makeDefault,
                },
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            showToastOrAlert(response?.data?.message);
            setAccountNumber('');
            setTitle('');
            setMakeDefault(false);
            await fetchAccounts();
            dispatch(fetchUser(accessToken));
        } catch (error) {
            handleError(error, t);
        } finally {
            setLoading(false);
        }
    };

    const statusLabel = (account) => {
        if (account?.is_verified) return 'تأیید شده';
        if (account?.verification_status === 'rejected') return 'رد شده';
        if (account?.verification_status === 'pending_manual') return 'در انتظار بررسی';
        return 'احراز نشده';
    };

    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
                <ScrollView
                    contentContainerStyle={styles.contentContainerStyle}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAccounts} />}
                >
                    {(!user?.is_national_birth_verified || !user?.is_phone_national_verified) && (
                        <View style={[styles.notice, NewStyles.border10]}>
                            <Ionicons name='alert-circle-outline' size={22} color={themeColor6.bgColor(1)} />
                            <Text style={[NewStyles.text6, { flex: 1 }]}>
                                برای افزودن حساب بانکی باید ابتدا احراز هویت کاربری را تکمیل کنید.
                            </Text>
                        </View>
                    )}

                    <Text style={NewStyles.text10}>
                        می‌توانید چند حساب متعلق به خودتان ثبت کنید و هنگام شارژ یا برداشت، حساب موردنظر را انتخاب کنید.
                    </Text>

                    {accounts.length === 0 ? (
                        <View style={[styles.emptyBox, NewStyles.border10]}>
                            <Text style={NewStyles.text10}>هنوز حساب بانکی ثبت نکرده‌اید.</Text>
                        </View>
                    ) : (
                        accounts.map((account) => (
                            <View key={account.id} style={[styles.accountCard, NewStyles.border10, NewStyles.shadow]}>
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.title10}>{account?.title || account?.bank_name || 'حساب بانکی'}</Text>
                                    <View style={{ flexDirection: 'row', gap: 6 }}>
                                        {account?.is_default &&
                                            <View style={[{ paddingVertical: 5, paddingHorizontal: 10, backgroundColor: themeColor0.bgColor(0.1), borderColor: themeColor0.bgColor(1), borderWidth: StyleSheet.hairlineWidth }, NewStyles.border100]}>
                                                <Text style={styles.defaultBadge}>پیش‌فرض</Text>
                                            </View>
                                        }
                                        <View style={[{ paddingVertical: 5, paddingHorizontal: 10, backgroundColor: themeColor11.bgColor(0.1), borderColor: themeColor11.bgColor(1), borderWidth: StyleSheet.hairlineWidth }, NewStyles.border100, account?.is_verified && { backgroundColor: themeColor7.bgColor(0.1), borderColor: themeColor7.bgColor(1) }]}>
                                            <Text style={[styles.statusBadge, account?.is_verified ? styles.verified : styles.pending]}> {statusLabel(account)} </Text>
                                        </View>
                                    </View>
                                </View>
                                {!!account?.bank_name && <Text style={NewStyles.text10}>بانک: {account.bank_name}</Text>}
                                <Text style={NewStyles.text10}>کارت: {account?.masked_card_number || account?.masked_identifier || '-'}</Text>
                                {!!account?.masked_iban && <Text style={NewStyles.text10}>شبا: {account.masked_iban}</Text>}
                                {!!account?.bank_owner_name && <Text style={NewStyles.text10}>صاحب حساب: {account.bank_owner_name}</Text>}
                                {!!account?.verification_message && !account?.is_verified && (
                                    <Text style={[NewStyles.text6, { fontSize: 12 }]}>{account.verification_message}</Text>
                                )}
                            </View>
                        ))
                    )}

                    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor10.bgColor(0.2), marginVertical: 4 }} />

                    <Text style={NewStyles.title10}>افزودن حساب بانکی جدید</Text>
                    <Text style={NewStyles.text10}>
                        حساب واردشده باید متعلق به مالک همین حساب کاربری باشد.
                    </Text>

                    <TextInput
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                        placeholderTextColor={themeColor3.bgColor(0.7)}
                        placeholder='عنوان حساب؛ مثلاً کارت ملت'
                        value={title}
                        maxLength={120}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                        placeholderTextColor={themeColor3.bgColor(0.7)}
                        placeholder='شماره کارت ۱۶ رقمی'
                        keyboardType='number-pad'
                        maxLength={19}
                        value={accountNumber}
                        onChangeText={(text) => setAccountNumber(text.replace(/\D/g, '').slice(0, 16))}
                    />

                    <TouchableOpacity
                        onPress={() => setMakeDefault((prev) => !prev)}
                        style={[NewStyles.row, { gap: 8, paddingVertical: 6 }]}
                    >
                        <Ionicons
                            name={makeDefault ? 'checkmark-circle' : 'ellipse-outline'}
                            size={22}
                            color={themeColor0.bgColor(1)}
                        />
                        <Text style={NewStyles.text10}>این حساب به‌عنوان حساب پیش‌فرض انتخاب شود</Text>
                    </TouchableOpacity>

                    <Button title={'ثبت و احراز حساب'} loading={loading} onPress={verify} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingBottom: '6%',
        gap: 10,
    },
    notice: {
        padding: 12,
        gap: 8,
        flexDirection: 'row',
        backgroundColor: themeColor6.bgColor(0.08),
    },
    emptyBox: {
        padding: 14,
        backgroundColor: themeColor12.bgColor(1),
    },
    accountCard: {
        padding: 12,
        backgroundColor: themeColor12.bgColor(1),
        gap: 6,
    },
    defaultBadge: {
        ...NewStyles.text
    },
    statusBadge: {
        ...NewStyles.text7
    },
    verified: {
        color: themeColor7.bgColor(1),
    },
    pending: {
        color: themeColor11.bgColor(1),
    },
});
