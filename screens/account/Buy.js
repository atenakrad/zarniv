import { StyleSheet, Text, TextInput, View } from 'react-native'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import NewStyles from '../../styles/NewStyles';
import { themeColor10, themeColor3 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import { fetchUser } from '../../slices/userSlice';

export default function Buy({ route, navigation }) {

    const dispatch = useDispatch()
    const { t } = useTranslation();

    const accessToken = useSelector((state) => state?.token?.accessToken)
    const [refreshing, setRefreshing] = useState(true)
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(null)
    const [description, setDescription] = useState(null)

    const item = route?.params?.item

    const buy = async () => {
        if (!amount) {
            showToastOrAlert(t('لطفاً تمام فیلدهای الزامی را پر کنید.'));
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/bullions/buy`, { amount, detail: description, product_id: item?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status === 201) {
                dispatch(fetchUser(accessToken))
                showToastOrAlert(response?.data?.message)
            }
        } catch (error) {
            const message = error?.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
            navigation.goBack();
        }
    }

    return (
        <View style={[NewStyles.container, styles.contentContainerStyle]}>
            <View style={NewStyles.center}>
                <Text style={NewStyles.heading10}>درخواست خرید</Text>
            </View>
            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
            <Text style={NewStyles.text10}>مقدار مورد نظر خود را به {item?.unit} وارد کنید. *</Text>
            <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border5, { textAlign: 'auto' }]} placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType='number-pad' maxLength={15} placeholder={`مقدار به ${item?.unit}`} value={amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChangeText={(text) => { setAmount(text?.replace(/,/g, "")) }} />
            <Text style={NewStyles.text10}>توضیحات</Text>
            <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border5, { textAlign: 'auto' }]} placeholderTextColor={themeColor10.bgColor(0.5)} placeholder='توضیحات' value={description} onChangeText={(text) => { setDescription(text) }} />
            <Button title={'ثبت درخواست'} loading={loading} onPress={() => buy()} />
        </View>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        gap: 10,
    },
});