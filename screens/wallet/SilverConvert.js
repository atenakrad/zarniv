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
import { fetchSilverInfoPrice } from '../../slices/silverInfoSlice';

export default function SilverConvert({ navigation }) {

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
  const [goldGeram, setGoldGram] = useState("")

  const weightTimeoutRef = useRef(null);
  const priceTimeoutRef = useRef(null);

  const formatNumber = (num) => {
    if (!num && num !== 0) return "";
    return num.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseMoney = (str) => {
    if (!str) return 0;
    return Number(String(str).replace(/[^0-9]/g, ""));
  };

  const parseWeight = (str) => {
    if (!str) return 0;
    return Number(String(str).replace(",", "."));
  };

  const sanitizeWeightInput = (text) => {
    const normalized = String(text ?? "")
      .replace(/,/g, ".")
      .replace(/[^0-9.]/g, "");

    const dotIndex = normalized.indexOf(".");
    if (dotIndex === -1) return normalized;

    const integerPart = normalized.slice(0, dotIndex).replace(/\./g, "") || "0";
    const decimalPart = normalized
      .slice(dotIndex + 1)
      .replace(/\./g, "")
      .slice(0, 3);

    return `${integerPart}.${decimalPart}`;
  };

  const calculatePriceFromWeight = async (numericWeight) => {
    if (!numericWeight) return "";
    const payload = {
      mode: 'price',
      weight: numericWeight,
      way: 'sell'

    }
    try {
      const response = await dispatch(fetchSilverInfoPrice({ params: payload }))
      console.log(response?.payload);
      
      return ({
        calculatedPrice: formatNumber(Math.round(response?.payload?.price)),
        final_gold_gram: response?.payload?.final_gold_gram
      });
    } catch (error) {
      showToastOrAlert('خطا در محاسبه قیمت نقره')
      return '0';
    }


  };

  const handleWeightChange = (text) => {
    editingField.current = "weight";

    const onlyNumbers = sanitizeWeightInput(text);
    setWeight(onlyNumbers);

    if (weightTimeoutRef.current) {
      clearTimeout(weightTimeoutRef.current);
    }

    if (!onlyNumbers) {
      setPrice("");
      setGoldGram("");
      return;
    }

    weightTimeoutRef.current = setTimeout(async () => {

      if (editingField.current !== "weight") return;

      const numericWeight = parseWeight(onlyNumbers);

      const { calculatedPrice, final_gold_gram } = await calculatePriceFromWeight(numericWeight);

      setPrice(calculatedPrice);
      setGoldGram(final_gold_gram);

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
    const cleanWeight = parseWeight(weight);
    const cleanPrice = parseMoney(price);

    if (!Number.isFinite(cleanWeight) || cleanWeight < 0.001) {
      showToastOrAlert("حداقل مقدار تبدیل 0.001 گرم است");
      return;
    }

    if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
      showToastOrAlert("مبلغ محاسبه‌شده معتبر نیست");
      return;
    }

    setLoading(true);
    const payload = {
      // تنها ورودی قابل اعتماد برای تبدیل: وزن نقره بر حسب گرم
      silver: cleanWeight,
    }
    try {
      const response = await axios.post(`${uri}/silver-to-gold/`, payload, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } });
      dispatch(fetchUser(accessToken));
      setPrice("")
      setGoldGram("")
      setWeight("")
      console.log(response?.data);
      
    } catch (error) {
      console.log(error?.response?.status, `${uri}/silver-to-gold/`);
      
      handleError(error, t)
    } finally {
      dispatch(fetchTradingAllowed())
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
        {
          tradingData?.allowed ?
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => {
              dispatch(fetchRate(accessToken));
              dispatch(fetchUser(accessToken));
              dispatch(fetchSilverInfoPrice({ params: null }))
              dispatch(fetchTradingAllowed())
            }} />}>
               
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
                <Text style={[NewStyles.text6, { textAlign: 'center' }]}>تبدیل نقره به طلا با قیمت فروش نقره و قیمت خرید طلا انجام می‌شود.</Text>
              </View>
              <View style={{}}>
                <Text style={NewStyles.text6}>توجه</Text>
                <Text style={NewStyles.text10}>وزن را بر حسب گرم وارد کنید. حداکثر ۳ رقم اعشار مجاز است.</Text>
              </View>

              <TextInput
                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                placeholderTextColor={themeColor10.bgColor(0.5)}
                keyboardType={'decimal-pad'}
                placeholder='مقدار بر حسب گرم'
                value={weight}
                maxLength={10}
                onChangeText={handleWeightChange}
              />




              <Button
                title={'تبدیل به طلا'}
                loading={loading}
                onPress={purchase}
              />

              <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                <View style={NewStyles.rowWrapper}>
                  <Text style={NewStyles.text10}>موجودی کیف پول</Text>
                  <Text style={NewStyles.text10}>{formatPrice(user?.wallet?.silver_balance) || '0'} گرم</Text>
                </View>
                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                <View style={NewStyles.rowWrapper}>
                  <Text style={NewStyles.text10}>جایزه تبدیل فعال</Text>
                  <Text style={NewStyles.text10}>{goldInfo?.silver_to_gold}%</Text>
                </View>
                {price && <>
                  <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                  <View style={NewStyles.rowWrapper}>
                    <Text style={NewStyles.text10}>مبلغ فروش</Text>
                    <Text style={NewStyles.text10}>{formatPrice(price)} تومان</Text>
                  </View>
                </>}
                {goldGeram && <>
                  <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                  <View style={NewStyles.rowWrapper}>
                    <Text style={NewStyles.text10}>گرم معادل با طلا</Text>
                    <Text style={NewStyles.text10}>{goldGeram} گرم</Text>
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
    paddingBottom: '5%',
    gap: 10,
  },
});