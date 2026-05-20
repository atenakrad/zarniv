import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor12, themeColor3, themeColor4, themeColor6 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { fetchUser } from '../../slices/userSlice';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl } from 'react-native';

export default function EditCard({ navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector(state => state?.token?.accessToken);
    const user = useSelector(state => state.user?.data);
    const userLoading = useSelector(state => state.user?.loading);


    const [loading, setLoading] = useState(false);
    const [accountNumber, setAccountNumber] = useState(null);

    const verify = async () => {
        if (!accountNumber) {
            showToastOrAlert('لطفا ابتدا اطلاعات خود را تکمیل نمایید.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/verify-bank-info/`, { accountNumber }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            showToastOrAlert(response?.data?.message);
        } catch (error) {
            handleError(error, t)
        } finally {
            dispatch(fetchUser(accessToken))
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'additive', bottom: 'additive' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
                <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={userLoading} onRefresh={() => {
                    dispatch(fetchUser(accessToken))
                }} />}>
                    <View style={NewStyles.center}>
                        <Text style={NewStyles.heading10}>احراز اطلاعات بانکی</Text>
                    </View>
                    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor10.bgColor(0.2) }} />

                    {(!user?.is_national_birth_verified || !user?.is_phone_national_verified) && <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor6.bgColor(0.1) }, NewStyles.border10]}>
                        <View style={[NewStyles.row, { gap: 10 }]}>
                            <Ionicons name="alert-circle-outline" size={24} color={themeColor6.bgColor(1)} />
                            <Text style={[NewStyles.text6, { flex: 1 }]}>حساب کاربری شما در حال حاضر احراز هویت نشده است، برای احراز اطلاعات بانکی باید ابتدا حساب کاربری خود را احراز کنید.</Text>
                        </View>
                        <Button title={'احراز هویت'}
                            onPress={() => {
                                navigation.navigate('Verify')
                            }}
                        />
                    </View>}

                    <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                        <View style={NewStyles.rowWrapper}>
                            <Text style={NewStyles.text10}>نام دارنده‌ی حساب</Text>
                            <Text style={NewStyles.text10}>{user?.bank_owner_name && (user?.bank_owner_name) || '-'}</Text>
                        </View>
                        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                        <View style={NewStyles.rowWrapper}>
                            <Text style={NewStyles.text10}>نام بانک</Text>
                            <Text style={NewStyles.text10}>{user?.bank_name && (user?.bank_name) || '-'}</Text>
                        </View>
                        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                        <View style={NewStyles.rowWrapper}>
                            <Text style={NewStyles.text10}>شماره کارت</Text>
                            <Text style={NewStyles.text10}>{user?.card_number || '-'}</Text>
                        </View>
                        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                        <View style={NewStyles.rowWrapper}>
                            <Text style={NewStyles.text10}>شماره شبا</Text>
                            <Text style={NewStyles.text10}>{user?.iban || '-'}</Text>
                        </View>
                    </View>
                    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                    <Text style={NewStyles.text10}>حساب وارد شده، باید متعلق به خودتان باشد. این اطلاعات باید متعلق به مالک شماره {user?.phone_number} باشد</Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} placeholderTextColor={themeColor10.bgColor(0.5)} placeholder='شماره کارت یا شماره شبا' value={accountNumber} onChangeText={(text) => { setAccountNumber(text) }} />
                    <Button title={'ثبت'} loading={loading} onPress={() => verify()} />
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
    button: {
        flex: 1,
        backgroundColor: themeColor0.bgColor(1),
        height: 50
    },
});