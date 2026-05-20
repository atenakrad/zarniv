import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor12, themeColor3, themeColor4, themeColor6 } from '../../theme/Color';
import Button from '../../components/Button';
import { mainUri, uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { fetchUser } from '../../slices/userSlice';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Verify({ navigation }) {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const accessToken = useSelector(state => state?.token?.accessToken);
  const user = useSelector(state => state.user?.data);
  const [refreshing, setRefreshing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nationalId, setNationalId] = useState(null);
  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);

  const verify = async () => {
    if (!nationalId || !day || !month || !year) {
      showToastOrAlert('لطفا ابتدا اطلاعات خود را تکمیل نمایید.');
      return;
    }

    const birthdate = `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
    setLoading(true);
    try {
      const response = await axios.post(`${uri}/shahkar/verify/`, { national_code: nationalId, birth_date: birthdate }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
      if (response.status == 200) {
        console.log(response?.data?.message);

        dispatch(fetchUser(accessToken));
        showToastOrAlert(response?.data?.message);
        navigation.goBack();
      }
    } catch (error) {
      // console.log(error?.response?.data);

      // const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
      // showToastOrAlert(message);
      console.log(error?.response?.data);
      
      handleError(error, t)
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={{ top: 'additive', bottom: 'additive' }} style={NewStyles.container}>
      <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false}>
        <View style={NewStyles.center}>
          <Text style={NewStyles.heading10}>تأیید هویت</Text>
        </View>
        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor10.bgColor(0.2) }} />
        <Text style={NewStyles.text10}>اطلاعات شناسایی خود را منطبق با کارت ملی وارد کنید. این اطلاعات باید متعلق به مالک شماره {user?.phone_number} باشد.</Text>
        <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} placeholderTextColor={themeColor10.bgColor(0.5)} maxLength={10} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} placeholder='کد ملی' value={nationalId} onChangeText={(text) => { setNationalId(text) }} />
        <Text style={NewStyles.text10}>تاریخ تولد</Text>

        <View style={[NewStyles.row, { gap: 10 }]}>
          <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]}  placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} maxLength={2} placeholder='روز' value={day} onChangeText={(text) => { setDay(text) }} />
          <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]} placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} maxLength={2} placeholder='ماه' value={month} onChangeText={(text) => { setMonth(text) }} />
          <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { flex: 1 }]} placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} maxLength={4} placeholder='سال' value={year} onChangeText={(text) => { setYear(text) }} />
        </View>
        <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor6.bgColor(0.1) }, NewStyles.border10]}>
          <View style={[NewStyles.row, { gap: 10 }]}>
            <Ionicons name="alert-circle-outline" size={24} color={themeColor6.bgColor(1)} />
            <Text style={[NewStyles.text6, { flex: 1 }]}>لطفا دقت کنید! درستی اطلاعات توسط سامانه‌ی ثبت احوال بررسی می‌شود و هر سال فقط 5 بار می‌توانید ثبت درخواست انجام دهید.</Text>
          </View>
        </View>
        <Button title={'احراز هویت'} loading={loading} onPress={() => verify()} />
        {/* <View style={[NewStyles.row, NewStyles.border10, { backgroundColor: themeColor3.bgColor(0.2) }]}>
          <TextInput style={[NewStyles.textInput, NewStyles.text4, NewStyles.border10, { flex: 1, backgroundColor: 'transparent' }]} placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} placeholder='کد پیامک شده' value={nationalId} onChangeText={(text) => { setNationalId(text) }} />
          <Pressable style={[styles.button, NewStyles.center, NewStyles.shadow, NewStyles.border10]} disabled={loading} onPress={() => decreaseWallet()}>
            {!loading && <Text style={NewStyles.title4}>دریافت پیامک</Text>}
            {loading && <ActivityIndicator color={themeColor4.bgColor(1)} size='small' />}
          </Pressable>
        </View> */}
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
  button: {
    flex: 1,
    backgroundColor: themeColor0.bgColor(1),
    height: 50
  },
});