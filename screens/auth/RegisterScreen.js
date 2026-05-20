import { Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import NewStyles from '../../styles/NewStyles';
import { themeColor10, themeColor4 } from '../../theme/Color';
import Button from '../../components/Button';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';

const RegisterScreen = ({ phone, setPhone, error, setError, onOk }) => {

  const { t } = useTranslation();

  const [name, setName] = useState('')
  const [errorName, setErrorName] = useState('')
  const [lastName, setLastName] = useState('')
  const [errorLastName, setErrorLastName] = useState('')
  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [nationalId, setNationalId] = useState(null);
  const [referallCode, setReferallCode] = useState(null);
  const [loader, setLoader] = useState(false)
  const register = () => {
    if (!(name && lastName && phone && nationalId && day && year && month)) {
      showToastOrAlert('تمامی فیلدهای ستاره دار باید تکمیل شوند.')
      return;
    }
    setLoader(true)
    const birthdate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    axios.post(`${uri}/register/`, {
      first_name: name,
      last_name: lastName,
      phone_number: phone,
      national_code: nationalId,
      birth_date: birthdate,
      referral_code: referallCode
    })
      .then((res) => {
        console.log(res?.status);

        console.log(res?.data);
        if (onOk) {
          onOk()
        }
      })
      .catch(err => {
        handleError(err, t)

      }).finally(() => {
        setLoader(false)
      })
  }
  return (
    <View style={{ width: '100%', gap: 10 }}>
      <View style={[NewStyles.row, { gap: 5 }]}>
        <View style={{ flex: 1 }}>
          <Text style={NewStyles.text10}>نام <Text style={NewStyles.title6}>*</Text></Text>
          <TextInput style={[NewStyles.textInput, { backgroundColor: themeColor4.bgColor(0.4) }, NewStyles.text1, NewStyles.border5,]} placeholderTextColor={themeColor10.bgColor(0.5)} placeholder={'نام'} value={name} onChangeText={(text) => { setName(text); if (errorName) { setErrorName('') } }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={NewStyles.text10}>نام خانوادگی <Text style={NewStyles.title6}>*</Text></Text>
          <TextInput style={[NewStyles.textInput, { backgroundColor: themeColor4.bgColor(0.4) }, NewStyles.text1, NewStyles.border5,]} placeholderTextColor={themeColor10.bgColor(0.5)} placeholder={'نام'} value={lastName} onChangeText={(text) => { setLastName(text); if (errorLastName) { setErrorLastName('') } }} />
        </View>
      </View>
      <View style={[NewStyles.row, { gap: 5 }]}>
        <View style={{ flex: 1 }}>
          <Text style={NewStyles.text10}>کدملی خود را وارد کنید <Text style={NewStyles.title6}>*</Text></Text>
          <TextInput style={[NewStyles.textInput, { backgroundColor: themeColor4.bgColor(0.4) }, NewStyles.text10, NewStyles.border10]} placeholderTextColor={themeColor10.bgColor(0.5)} maxLength={10} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} placeholder='کد ملی' value={nationalId} onChangeText={(text) => { setNationalId(text) }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={NewStyles.text10}>کد معرف (اختیاری)</Text>
          <TextInput style={[NewStyles.textInput, { backgroundColor: themeColor4.bgColor(0.4) }, NewStyles.text10, NewStyles.border10]} placeholderTextColor={themeColor10.bgColor(0.5)} maxLength={10} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} placeholder='کد معرف' value={referallCode} onChangeText={(text) => { setReferallCode(text) }} />
        </View>
      </View>
      <Text style={NewStyles.text10}>شماره موبایل <Text style={NewStyles.title6}>*</Text></Text>
      <TextInput style={[NewStyles.textInput, NewStyles.text1, NewStyles.border5, { backgroundColor: themeColor4.bgColor(0.4) }]} keyboardType="number-pad" placeholderTextColor={themeColor10.bgColor(0.5)} maxLength={11} placeholder={`${t("Phone Number")}`} value={phone} onChangeText={(text) => { setPhone(text); if (error) { setError('') } }} />
      <Text style={NewStyles.text10}>تاریخ تولد خود را وارد کنید <Text style={NewStyles.title6}>*</Text></Text>

      <View style={[NewStyles.row, { gap: 5 }]}>
        <TextInput style={[NewStyles.textInput, { backgroundColor: themeColor4.bgColor(0.4) }, NewStyles.text10, NewStyles.border10, { flex: 1 }]} placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} maxLength={2} placeholder='روز' value={day} onChangeText={(text) => { setDay(text) }} />
        <TextInput style={[NewStyles.textInput, { backgroundColor: themeColor4.bgColor(0.4) }, NewStyles.text10, NewStyles.border10, { flex: 1 }]} placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} maxLength={2} placeholder='ماه' value={month} onChangeText={(text) => { setMonth(text) }} />
        <TextInput style={[NewStyles.textInput, { backgroundColor: themeColor4.bgColor(0.4) }, NewStyles.text10, NewStyles.border10, { flex: 1 }]} placeholderTextColor={themeColor10.bgColor(0.5)} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} maxLength={4} placeholder='سال' value={year} onChangeText={(text) => { setYear(text) }} />
      </View>
      <Button
        title={`${t("Send code")}`}
        onPress={register}
        loading={loader}
      />

    </View>
  )
}

export default RegisterScreen

const styles = StyleSheet.create({})