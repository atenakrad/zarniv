import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor12, themeColor3 } from '../theme/Color';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import TransparentButton from './TransparentButton';
import BankAccountSelector from './BankAccountSelector';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { uri } from '../services/URL';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { handleError, showToastOrAlert } from '../helpers/Common';
import { useTranslation } from 'react-i18next';

const RecieptFormComponent = ({
    title,
    request_type,
    order_id,
    transaction_id,
    physical_delivery_request_id,
    physical_delivery_silver_request_id,
    userBankAccounts: suppliedUserAccounts,
    siteBankAccounts: suppliedSiteAccounts,
    onSuccess,
}) => {
    const navigation = useNavigation();
    const [priceReciep, setPriceReciep] = useState('');
    const [description, setDescription] = useState('');
    const [reciepCover, setReciepCover] = useState({ uri: '', name: '', type: '' });
    const [loadingReciep, setLoadingReciep] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [userAccounts, setUserAccounts] = useState(suppliedUserAccounts || []);
    const [siteAccounts, setSiteAccounts] = useState(suppliedSiteAccounts || []);
    const [sourceAccountId, setSourceAccountId] = useState(null);
    const [destinationAccountId, setDestinationAccountId] = useState(null);

    const accessToken = useSelector((state) => state?.token?.accessToken);
    const { t } = useTranslation();
    const needsBankSelection = request_type === 'wallet';

    const applyAccountData = (users, sites) => {
        setUserAccounts(users);
        setSiteAccounts(sites);

        const sourceExists = users.some((item) => String(item.id) === String(sourceAccountId));
        if (!sourceExists) {
            const defaultAccount = users.find((item) => item?.is_default) || users[0];
            setSourceAccountId(defaultAccount?.id || null);
        }

        const destinationExists = sites.some((item) => String(item.id) === String(destinationAccountId));
        if (!destinationExists) {
            setDestinationAccountId(sites[0]?.id || null);
        }
    };

    useEffect(() => {
        if (Array.isArray(suppliedUserAccounts) || Array.isArray(suppliedSiteAccounts)) {
            applyAccountData(suppliedUserAccounts || [], suppliedSiteAccounts || []);
        }
    }, [suppliedUserAccounts, suppliedSiteAccounts]);

    useEffect(() => {
        if (!needsBankSelection || !accessToken) return;
        if (Array.isArray(suppliedUserAccounts) && Array.isArray(suppliedSiteAccounts)) return;

        setLoadingAccounts(true);
        axios.get(`${uri}/bank-accounts/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }).then((response) => {
            applyAccountData(
                response?.data?.verified_user_accounts || [],
                response?.data?.site_accounts || []
            );
        }).catch((error) => {
            handleError(error, t);
        }).finally(() => setLoadingAccounts(false));
    }, [accessToken, needsBankSelection]);

    const pickReciepFile = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (result.canceled) return;

        const localUri = result.assets[0].uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        setReciepCover({ uri: localUri, name: filename, type });
    };

    const submitReciep = async () => {
        if (!priceReciep) {
            showToastOrAlert('وارد کردن مبلغ الزامی است');
            return;
        }
        if (!reciepCover?.uri) {
            showToastOrAlert('بارگذاری تصویر فیش الزامی است.');
            return;
        }
        if (needsBankSelection && !sourceAccountId) {
            showToastOrAlert('حساب بانکی مبدأ را انتخاب کنید.');
            return;
        }
        if (needsBankSelection && !destinationAccountId) {
            showToastOrAlert('حساب مقصد سایت را انتخاب کنید.');
            return;
        }

        setLoadingReciep(true);
        try {
            const formData = new FormData();
            formData.append('amount', priceReciep);
            formData.append('description', description);
            formData.append('request_type', request_type);

            if (needsBankSelection) {
                formData.append('source_user_bank_account', String(sourceAccountId));
                formData.append('destination_site_bank_account', String(destinationAccountId));
            }
            if (order_id) formData.append('order', order_id);
            if (transaction_id) formData.append('transaction_id', transaction_id);
            if (physical_delivery_request_id) {
                formData.append('physical_delivery_request', physical_delivery_request_id);
            }
            if (physical_delivery_silver_request_id) {
                formData.append('physical_delivery_silver_request', physical_delivery_silver_request_id);
            }

            formData.append('receipt', {
                uri: reciepCover.uri,
                name: reciepCover.name,
                type: reciepCover.type,
            });

            const response = await axios.post(`${uri}/manual-payment-request/`, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            showToastOrAlert(response?.data?.message);
            setPriceReciep('');
            setReciepCover({ uri: '', name: '', type: '' });
            setDescription('');
            onSuccess?.();
        } catch (error) {
            handleError(error, t);
        } finally {
            setLoadingReciep(false);
        }
    };

    return (
        <View style={[styles.wrapper, NewStyles.border5]}>
            <Text style={NewStyles.title10}>{title}</Text>

            {needsBankSelection && (
                <>
                    <BankAccountSelector
                        title={'حساب مبدأ شما'}
                        accounts={userAccounts}
                        selectedId={sourceAccountId}
                        onSelect={setSourceAccountId}
                        emptyText={'برای ثبت فیش ابتدا یک حساب بانکی احرازشده اضافه کنید.'}
                    />
                    {userAccounts.length === 0 && (
                        <TransparentButton
                            title={'افزودن حساب بانکی'}
                            onPress={() => navigation.navigate('EditCard')}
                        />
                    )}

                    <BankAccountSelector
                        title={'حساب مقصد سایت'}
                        accounts={siteAccounts}
                        selectedId={destinationAccountId}
                        onSelect={setDestinationAccountId}
                        emptyText={'حساب فعال سایت برای واریز دستی موجود نیست.'}
                        siteMode={true}
                    />
                </>
            )}

            <View style={{ gap: 5 }}>
                <Text style={NewStyles.text10}>
                    مبلغ واریزی به تومان<Text style={NewStyles.title6}>*</Text>
                </Text>
                <TextInput
                    style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                    placeholder='مبلغ واریزی'
                    keyboardType={Platform?.OS === 'ios' ? 'numbers-and-punctuation' : 'number-pad'}
                    placeholderTextColor={themeColor3.bgColor(1)}
                    value={priceReciep?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    onChangeText={(value) => setPriceReciep(value?.replace(/,/g, '').replace(/[^0-9]/g, ''))}
                />
            </View>

            <View style={{ gap: 5 }}>
                <Text style={NewStyles.text10}>توضیحات</Text>
                <TextInput
                    style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { height: 100 }]}
                    verticalAlign='top'
                    textAlignVertical='top'
                    placeholder='توضیحات یا شماره پیگیری'
                    maxLength={255}
                    placeholderTextColor={themeColor3.bgColor(1)}
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                />
            </View>

            <View style={{ gap: 5 }}>
                <Text style={NewStyles.text10}>
                    تصویر فیش<Text style={NewStyles.title6}>*</Text>
                </Text>
                <TouchableOpacity
                    style={[styles.uploadButton, NewStyles.row, NewStyles.border10, NewStyles.center]}
                    onPress={pickReciepFile}
                >
                    <Ionicons
                        name={reciepCover?.uri ? 'checkmark-circle' : 'cloud-upload'}
                        size={20}
                        color={themeColor0.bgColor(1)}
                    />
                    <Text style={NewStyles.title}>
                        {reciepCover?.uri ? 'فیش بارگذاری شد' : 'بارگذاری فیش'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Button
                title={'ثبت فیش'}
                style={{ marginVertical: 0 }}
                onPress={submitReciep}
                loading={loadingReciep || loadingAccounts}
            />
            <TransparentButton
                title={'مشاهده تاریخچه'}
                style={{ marginVertical: 0 }}
                onPress={() => navigation.navigate('RecieptLists')}
            />
        </View>
    );
};

export default RecieptFormComponent;

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: themeColor12.bgColor(1),
        padding: 10,
        gap: 10,
    },
    uploadButton: {
        borderWidth: 1,
        borderColor: themeColor0.bgColor(1),
        height: 40,
        gap: 10,
    },
});
