import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor3, themeColor5 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import { Dropdown } from 'react-native-element-dropdown';

export default function Remittance({ navigation }) {

    const { t } = useTranslation()
    const accessToken = useSelector((state) => state?.token?.accessToken)
    const [refreshing, setRefreshing] = useState(true)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        product_id: null,
        phone: null,
        receiver: null,
        amount: null,
        description: null
    })

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/bullions/products`);
            setData(response.data);
        } catch (error) {
            const message = error?.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing]);

    const remittance = async () => {
        if (!form.product_id || !form.phone || !form.receiver || !form.amount) {
            showToastOrAlert(t('لطفاً تمام فیلدهای الزامی را پر کنید.'));
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/bullions/remittance`, form, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status == 200) {
                showToastOrAlert(response?.data?.message)
                setForm({
                    product_id: null,
                    phone: null,
                    receiver: null,
                    amount: null,
                    description: null
                })
            }
        } catch (error) {
            const message = error?.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={NewStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => setRefreshing(true)} />}>
                <Dropdown
                    style={[NewStyles.textInput, NewStyles.border5, { marginVertical: 10 }]}
                    placeholderStyle={[styles.textStyle, NewStyles.text10]}
                    selectedTextStyle={[styles.textStyle, NewStyles.text10]}
                    itemTextStyle={[styles.textStyle, NewStyles.text10]}
                    containerStyle={styles.containerStyle}
                    itemContainerStyle={styles.itemContainerStyle}
                    activeColor={themeColor3.bgColor(0.2)}
                    data={data}
                    inputSearchStyle={styles.inputSearchStyle}
                    search
                    autoScroll={false}
                    maxHeight={300}
                    labelField="name"
                    valueField="id"
                    placeholder={t("کالا را انتخاب کنید. *")}
                    searchPlaceholder={t("Search")}
                    showsVerticalScrollIndicator={false}
                    renderRightIcon={() => (
                        <Ionicons name='search-outline' size={24} color={themeColor0.bgColor(1)} />
                    )}
                    renderLeftIcon={() => (
                        <MaterialIcons name="keyboard-arrow-down" size={24} color={themeColor0.bgColor(1)} />
                    )}
                    value={data?.find(item => item?.id == form?.product_id)}
                    onChange={(item) => setForm((prev) => ({ ...prev, product_id: item?.id }))}
                />
                <Text style={NewStyles.text10}>تحویل گیرنده *</Text>
                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border5, { textAlign: 'auto' }]} placeholderTextColor={themeColor10.bgColor(0.5)} placeholder='تحویل گیرنده' value={form?.receiver} onChangeText={(text) => setForm((prev) => ({ ...prev, receiver: text }))} />
                <Text style={NewStyles.text10}>شماره تماس *</Text>
                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border5, { textAlign: 'auto' }]} placeholderTextColor={themeColor10.bgColor(0.5)} placeholder='شماره تماس' keyboardType='number-pad' value={form?.phone} onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))} />
                <Text style={NewStyles.text10}>مقدار *</Text>
                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border5, { textAlign: 'auto' }]} placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType='numeric' placeholder='مقدار' value={form?.amount} onChangeText={(text) => setForm((prev) => ({ ...prev, amount: text }))} />
                <Text style={NewStyles.text10}>توضیحات</Text>
                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border5, { textAlign: 'auto' }]} placeholderTextColor={themeColor10.bgColor(0.5)} placeholder='توضیحات' value={form?.description} onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))} />
                <Button title={'ثبت'} loading={loading} onPress={() => remittance()} />
            </ScrollView>
        </View>

    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        gap: 10,
    },
    textStyle: {
        paddingRight: 10,
        textAlign: 'right'
    },
    inputSearchStyle: {
        fontSize: 14,
        fontFamily: 'VazirLight',
        textAlign: 'right',
        color: themeColor10.bgColor(1),
        paddingHorizontal: 10,
        height: 50,
        borderWidth: 0,
        backgroundColor: themeColor5.bgColor(1),
        borderRadius: 8,
    },
    itemContainerStyle: {
        backgroundColor: themeColor5.bgColor(1),
        borderRadius: 8,
        margin: 2,
        borderCurve: 'continuous',
        overflow: 'hidden',
    },
    containerStyle: {
        backgroundColor: themeColor5.bgColor(1),
        borderRadius: 8,
        margin: 0,
        padding: 0,
        borderCurve: 'continuous',
        overflow: 'hidden',
    },
});