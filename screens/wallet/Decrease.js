import { FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor12, themeColor3, themeColor4, themeColor6 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { fetchUser } from '../../slices/userSlice';
import WithdrawalItem from '../../components/WithdrawalItem';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Decrease({ navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch()
    const accessToken = useSelector(state => state?.token?.accessToken)

    const [refreshing, setRefreshing] = useState(true)
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(null)
    const user = useSelector(state => state.user?.data);

    const decreaseWallet = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/decreaseWallet/`, { amount: amount }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status == 201) {
                dispatch(fetchUser(accessToken));
                showToastOrAlert(response?.data?.message);
                fetchData();
            }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    }

    const [data, setData] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/fetchWithdrawRequests/`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            setData(response?.data);
        } catch (error) {
            handleError(error, t)
        } finally {
            setAmount(null)
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchData();
        }
    }, [refreshing]);

    return (
        <SafeAreaView edges={{ top: 'additive', bottom: 'additive' }} style={NewStyles.container}>
            <ScrollView refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor1.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData();  }} />} contentContainerStyle={[styles.contentContainerStyle, { paddingHorizontal: 0 }]} showsVerticalScrollIndicator={false}>
                <View style={NewStyles.center}>
                    <Text style={NewStyles.heading10}>درخواست برداشت</Text>
                </View>
                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                {(!user?.is_national_birth_verified || !user?.is_phone_national_verified) && <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1), paddingHorizontal: '5%' }, NewStyles.border10, NewStyles.shadow]}>
                    <View style={[NewStyles.row, { gap: 10 }]}>
                        <Ionicons name="alert-circle-outline" size={24} color={themeColor10.bgColor(1)} />
                        <Text style={[NewStyles.text10, { flex: 1 }]}>حساب کاربری شما در حال حاضر احراز هویت نشده است، برای ثبت درخواست ابتدا بایستی حساب کاربری خود را احراز هویت کنید.</Text>
                    </View>
                    <Button title={'احراز هویت'}
                        onPress={() => {
                            navigation.navigate('Verify')
                        }}
                    />
                </View>}
                {(user?.is_national_birth_verified && user?.is_phone_national_verified && !user?.is_bank_info_verified) && <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor6.bgColor(0.1), paddingHorizontal: '5%' }, NewStyles.border10]}>
                    <View style={[NewStyles.row, { gap: 10 }]}>
                        <Ionicons name="alert-circle-outline" size={24} color={themeColor6.bgColor(1)} />
                        <Text style={[NewStyles.text6, { flex: 1 }]}>برای ثبت درخواست باید ابتدا حساب بانکی خود را احراز کنید.</Text>
                    </View>
                    <Button title={'تکمیل اطلاعات حساب'}
                        onPress={() => {
                            navigation.navigate('EditCard')
                        }}
                    />
                </View>}
                <View style={{paddingHorizontal:'5%', gap:10}}>

                    <Text style={NewStyles.text10}>مبلغ مورد نظر خود را به تومان وارد کنید.</Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} maxLength={15} placeholder='مبلغ به تومان' value={amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChangeText={(text) => { setAmount(text?.replace(/,/g, "")) }} />
                    <Button title={'ثبت درخواست'} loading={loading} onPress={() => decreaseWallet()} />
                </View>

                <FlatList
                    contentContainerStyle={[styles.contentContainerStyle,]}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    
                    data={data}
                    keyExtractor={(item) => item?.id?.toString()}
                    ListHeaderComponent={data.length > 0 ? <Text style={NewStyles.title10}>درخواست‌های شما</Text> : null}
                    renderItem={({ item }) => {
                        return (
                            <WithdrawalItem item={item} />
                        )
                    }}
                />
            </ScrollView>
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