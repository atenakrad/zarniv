import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useCallback, useEffect, useState, useRef } from 'react'
import * as Linking from 'expo-linking';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor12, themeColor3, themeColor4, themeColor5, themeColor6 } from '../../theme/Color';
import Button from '../../components/Button';
import { formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import { uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import { fetchRate } from '../../slices/rateSlice';
import { fetchGoldPrice } from '../../slices/goldPriceSlice';
import { useTranslation } from 'react-i18next';
import { fetchInfoPrice } from '../../slices/goldInfoSlice';
import Loader from './../../components/Loader';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';

export default function GoldConvert({ navigation }) {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state?.token?.accessToken);
  const goldInfo = useSelector(state => state.goldInfo?.data);

  const trading = useSelector((state) => state?.trading)
  const tradingData = trading?.data
  const goldPrice = goldInfo?.gold_price_per_gram;
  const editingField = useRef(null);

  useEffect(() => {
    dispatch(fetchInfoPrice({ params: null }))
    dispatch(fetchTradingAllowed())
  }, []);

  const user = useSelector((state) => state.user?.data);
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false);

  const [weight, setWeight] = useState("")
  const [price, setPrice] = useState("")
  const [silverGram, setSilverGram] = useState("")

  const weightTimeoutRef = useRef(null);
  const priceTimeoutRef = useRef(null);

  const formatNumber = (num) => {
    if (!num && num !== 0) return "";
    return num.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (str) => {
    if (!str) return 0;
    return Number(str?.replace(/,/g, "")?.replace(/[^0-9]/g, ""));
  };

  const calculatePriceFromWeight = async (numericWeight) => {
    if (!numericWeight || !goldPrice) return "";
    const payload = {
      mode: 'price',
      weight: numericWeight,
      way: 'sell'

    }
    try {
      const response = await dispatch(fetchInfoPrice({ params: payload }))
      console.log(response?.payload);
      
      return ({
        calculatedPrice: formatNumber(Math.round(response?.payload?.price)),
        final_silver_gram: response?.payload?.final_silver_gram
      });
    } catch (error) {
      showToastOrAlert('خطا در محاسبه قیمت طلا')
      return '0';
    }


  };

  const handleWeightChange = (text) => {
    editingField.current = "weight";

    const onlyNumbers = text.replace(/[^0-9]/g, "");
    setWeight(onlyNumbers);

    if (weightTimeoutRef.current) {
      clearTimeout(weightTimeoutRef.current);
    }

    if (!onlyNumbers) {
      setPrice("");
      setSilverGram("");
      return;
    }

    weightTimeoutRef.current = setTimeout(async () => {

      if (editingField.current !== "weight") return;

      const numericWeight = parseInt(onlyNumbers, 10);

      const { calculatedPrice, final_silver_gram } = await calculatePriceFromWeight(numericWeight);

      setPrice(calculatedPrice);
      setSilverGram(final_silver_gram);

    }, 1000);
  };


  useEffect(() => {
    return () => {
      if (weightTimeoutRef.current) {
        clearTimeout(weightTimeoutRef.current);
      }
      if (priceTimeoutRef.current) {
        clearTimeout(priceTimeoutRef.current);
      }
    };
  }, []);


  const purchase = async () => {
    if (!weight || parseInt(weight, 10) < 1) {
      showToastOrAlert("لطفاً مقدار معتبری برای خرید وارد کنید");
      return;
    }
    if (!Number.isInteger(parseFloat(weight))) {
      showToastOrAlert("مقدار میلی‌گرم باید عدد صحیح باشد.");
      return;
    }
    setLoading(true);
    const cleanWeight = parseNumber(weight);
    const cleanPrice = parseNumber(price);
    const payload = {
      mode: 'price',
      weight: cleanWeight,
      way: 'sell',
      gold: cleanWeight,
      silver: silverGram,
      price: cleanPrice,

    }
    try {
      const response = await axios.post(`${uri}/gold-to-sliver/`, payload, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } });
      dispatch(fetchUser(accessToken));
      setPrice("")
      setSilverGram("")
      setWeight("")
      console.log(response?.data);
      
    } catch (error) {
      console.log(error?.response?.data);
      
      handleError(error, t)
    } finally {
      dispatch(fetchTradingAllowed())
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'additive', bottom: 'additive' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
        {
          tradingData?.allowed ?
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => {
              dispatch(fetchRate(accessToken));
              dispatch(fetchUser(accessToken));
              dispatch(fetchInfoPrice({ params: null }))
              dispatch(fetchTradingAllowed())
            }} />}>
              <View style={NewStyles.center}>
                <Text style={NewStyles.title10}>تبدیل طلا به نقره</Text>
              </View>
              <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />

              {(!user?.is_national_birth_verified || !user?.is_phone_national_verified) && <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                <View style={[NewStyles.row, { gap: 10 }]}>
                  <Ionicons name="alert-circle-outline" size={24} color={themeColor0.bgColor(1)} />
                  <Text style={[NewStyles.text, { flex: 1 }]}>حساب کاربری شما در حال حاضر احراز هویت نشده است، برای شروع خرید و فروش ابتدا بایستی حساب کاربری خود را احراز هویت کنید.</Text>
                </View>
                <Button title={'احراز هویت'}
                  onPress={() => {
                    navigation.navigate('Verify')
                  }}
                />
              </View>}
              <View style={[{ backgroundColor: themeColor6.bgColor(0.2), padding: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: themeColor6.bgColor(1) }, NewStyles.border10]}>
                <Text style={[NewStyles.text6, { textAlign: 'center' }]}>تبدیل طلا به نقره با قیمت فروش طلا و قیمت خرید نقره انجام می‌شود.</Text>
              </View>
              <View style={{}}>
                <Text style={NewStyles.text6}>توجه</Text>
                <Text style={NewStyles.text10}>وزن را بر حسب میلی‌گرم وارد کنید. (1 گرم = 1000 میلی‌گرم)</Text>
              </View>

              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                placeholderTextColor={themeColor10.bgColor(0.5)}
                keyboardType={'number-pad'}
                placeholder='مقدار بر حسب میلی گرم'
                value={weight}
                maxLength={5}
                onChangeText={handleWeightChange}
              />




              <Button
                title={'تبدیل به نقره'}
                loading={loading}
                onPress={purchase}
              />

              <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                <View style={NewStyles.rowWrapper}>
                  <Text style={NewStyles.text10}>موجودی کیف پول</Text>
                  <Text style={NewStyles.text10}>{formatPrice(user?.wallet?.gold_balance) || '0'} گرم</Text>
                </View>
                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                <View style={NewStyles.rowWrapper}>
                  <Text style={NewStyles.text10}>جایزه تبدیل فعال</Text>
                  <Text style={NewStyles.text10}>{goldInfo?.gold_to_silver}%</Text>
                </View>
                {price && <>
                  <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                  <View style={NewStyles.rowWrapper}>
                    <Text style={NewStyles.text10}>مبلغ فروش</Text>
                    <Text style={NewStyles.text10}>{formatPrice(price)} تومان</Text>
                  </View>
                </>}
                {silverGram && <>
                  <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                  <View style={NewStyles.rowWrapper}>
                    <Text style={NewStyles.text10}>گرم معادل با نقره</Text>
                    <Text style={NewStyles.text10}>{silverGram} میلی گرم</Text>
                  </View>
                </>}

              </View>

            </ScrollView>
            :
            <View style={[{ flex: 1 }, NewStyles.center]} >
              <VoteTimerDisplay
                competitionStartAt={tradingData?.start}
                durationMinutes={null}
                nowDate={tradingData?.now}
                initialRemainingSeconds={tradingData?.remaining_seconds}
                title={'تا باز شدن خرید'}
                onTimeExpired={() => {
                  dispatch(fetchTradingAllowed())
                }}
              />
            </View>
        }
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
});