import { Linking, View, Text, Modal, StyleSheet, TouchableWithoutFeedback, TextInput, Platform, ToastAndroid, Pressable, TouchableOpacity, ImageBackground, KeyboardAvoidingView, ScrollView, } from "react-native";
import React, { useEffect, useState } from "react";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell, } from "react-native-confirmation-code-field";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";

import { mainUri, uri } from "../../services/URL";
import { fetchUser } from "../../slices/userSlice";

import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4, themeColor5 } from "../../theme/Color";
import Button from "../../components/Button";
import TransparentButton from "../../components/TransparentButton";
import { setAccessToken, setRefreshToken } from "../../slices/tokenSlice";
import { useTranslation } from "react-i18next";
import NewStyles, { deviceHeight } from "../../styles/NewStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { formatTime, handleError, showToastOrAlert } from "../../helpers/Common";
import { removeLastScreen, removeParams } from "../../slices/lastScreenSlice";
import RegisterScreen from "./RegisterScreen";

export default function LoginModal() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loginWithPassword, setLoginWithPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(false);
  const [error, setError] = useState("");
  const lastScreen = useSelector(state => state.last)
  const [tab, setTab] = useState("login")
  const [timer, setTimer] = useState(120);

  const ref = useBlurOnFulfill({ value, cellCount: 6 });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const validatePhone = () => {
    if (phone.match(/^09\d{9}$/)) {
      return true;
    } else {
      return false;
    }
  };

  const validatePassword = () => {
    const pattern =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    if (password.match(pattern)) {
      return true;
    } else {
      return false;
    }
  };

  const sendVerificationCode = async () => {

    try {
      const response = await axios.post(`${uri}/send-otp/`, { phone });
      if (response?.data?.success == "success") {
        setCode(true);
        setTab('login')
        setError("");
        setTimer(120)
      } else if (response?.data?.error == "error") {
        setError(`${t("Failed to send code. Please make sure the phone number you entered is correct.")}`);
      } else if (response?.data?.message) {
        showToastOrAlert(response?.data?.message)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const codeVerification = async () => {
    try {
      const response = await axios.post(
        `${uri}/verify-otp/`,
        {
          phone: phone,
          code: value,
        }
      );
      if (response?.data?.success) {
        const accessToken = response?.data?.access?.replace('"', "");
        const refreshToken = response?.data?.refresh?.replace('"', "");
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);
        dispatch(setAccessToken(accessToken));
        dispatch(setRefreshToken(refreshToken));
        dispatch(fetchUser(accessToken));
        setPhone("");
        setValue("");
        setCode(false);
        setError("");
        if (lastScreen?.screen) {
          navigation.navigate(lastScreen?.screen, lastScreen?.params);
          dispatch(removeLastScreen())
          dispatch(removeParams())
        }
      } else {
        setValue("");
        setError(response?.data?.message);
      }
    } catch (error) {
      console.log(error?.response?.data);

      handleError(error, t)
    } finally {
      setLoading(false);
    }
  };

  const passwordVerification = async () => {
    try {
      const response = await axios.post(`${uri}/verify/password/`, {
        phone: phone,
        password: password,
      });

      if (response?.data?.success) {
        const accessToken = response?.data?.access?.replace('"', "");
        const refreshToken = response?.data?.refresh?.replace('"', "");
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);
        dispatch(setAccessToken(accessToken));
        dispatch(setRefreshToken(refreshToken));
        dispatch(fetchUser(accessToken));
        setPhone("");
        setValue("");
        setCode(false);
        setError("");
        if (lastScreen?.screen) {
          navigation.navigate(lastScreen?.screen, lastScreen?.params);
          dispatch(removeLastScreen())
          dispatch(removeParams())
        }
      } else {
        setValue("");
        setError(response?.data?.message);
      }
    } catch (error) {
      console.log(error);

      handleError(error, t)
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (code) {

      if (timer === 0) return;

      const intervalId = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [timer, code]);
  return (
    <ImageBackground style={{ flex: 1 }} source={require('../../assets/images/back4.jpg')} >
      <LinearGradient colors={[themeColor1.bgColor(0.1), themeColor5.bgColor(1)]} style={[styles.container, NewStyles.center]}>
        <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior="padding">
          <ScrollView contentContainerStyle={[NewStyles.center, tab == 'login' ? { flex: 1 } : { paddingTop: 80 }]} showsVerticalScrollIndicator={false}>

            {
              tab == 'login' ?
                <View style={[styles.modalView, NewStyles.border5]}>
                  <Text style={NewStyles.title10}>{t("Login | Register")}</Text>
                  {!code ? (
                    <View style={styles.wrapper}>
                      <Text style={NewStyles.text10}>{t("Please enter your phone number. A verification code will be sent to your phone number.")}</Text>
                      <TextInput style={[NewStyles.textInput, NewStyles.text1, NewStyles.border5, { textAlign: 'auto', backgroundColor: themeColor4.bgColor(0.4) }]} keyboardType="number-pad" placeholderTextColor={themeColor10.bgColor(0.5)} maxLength={11} placeholder={`${t("Phone Number")}`} value={phone} onChangeText={(text) => { setPhone(text); if (error) { setError('') } }} />
                      <View style={[NewStyles.row, { flexWrap: 'wrap', flexDirection: 'row-reverse' }]}>
                        <Text style={NewStyles.text10}>ورود شما به معنای موافقت شما با </Text>
                        <Pressable onPress={() => { navigation.navigate('Terms') }}><Text style={NewStyles.text2}>قوانین و مقررات</Text></Pressable>
                        <Text style={NewStyles.text10}> و </Text>
                        <Pressable onPress={() => { navigation.navigate('Privacy') }}><Text style={NewStyles.text2}>سیاست های حفظ حریم خصوصی</Text></Pressable>
                        <Text style={NewStyles.text10}> ما می‌باشد.</Text>
                      </View>
                      {error && <Text style={NewStyles.text6}>{error}</Text>}
                      <View style={{ gap: 10, marginTop: 10 }}>
                        <Button
                          title={`${t("Send code")}`}
                          loading={loading}
                          onPress={() => {
                            if (!phone) {
                              setError('ابتدا شماره موبایل خود را وارد نمایید');
                            } else if (validatePhone()) {
                              setLoading(true);
                              sendVerificationCode();
                            } else {
                              setError(
                                `${t("The mobile number you entered is not valid.")}`
                              );
                            }
                          }}
                          style={{ marginVertical: 0 }}
                        />

                        <TransparentButton title={`${t('Login With Password')}`} style={{ marginVertical: 0, }} onPress={() => {
                          if (!phone) {
                            setError('ابتدا شماره موبایل خود را وارد نمایید');
                          } else if (validatePhone()) { setCode(true); setLoginWithPassword(true) } else { setError(`${t('The mobile number you entered is not valid.')}`) }
                        }} />

                      </View>
                      <TouchableOpacity style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor1.bgColor(1), paddingVertical: 5, alignSelf: 'center', paddingHorizontal: 10 }} onPress={() => { setTab('Register') }}>
                        <Text style={[NewStyles.text1, { textAlign: 'center' }]}>حساب کاربری ندارید؟ ثبت نام کنید</Text>
                      </TouchableOpacity>
                    </View>
                  ) : loginWithPassword ? (
                    <View style={styles.wrapper}>
                      <Text style={NewStyles.text10}>
                        {t("Please enter your password.")}
                      </Text>
                      <TextInput
                        style={[
                          NewStyles.textInput,
                          NewStyles.text10,
                          NewStyles.border5,
                          { backgroundColor: themeColor4.bgColor(0.4) }
                        ]}
                        keyboardType="default"
                        placeholderTextColor={themeColor10.bgColor(0.5)}
                        secureTextEntry
                        maxLength={18}
                        placeholder={`${t("Password")}`}
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                      />
                      {error && <Text style={NewStyles.text6}>{error}</Text>}
                      <Button
                        title={`${t("Submit")}`}
                        loading={loading}
                        onPress={() => {
                          if (validatePassword()) {
                            setLoading(true);
                            passwordVerification();
                          } else {
                            setError(
                              `${t("The Password you entered is not valid.")}`
                            );
                          }
                        }}
                      />
                      <View style={NewStyles.center}>
                        <Text style={NewStyles.text}>
                          {t("Forgot your password?")}
                        </Text>
                        <View style={NewStyles.rowWrapper}>
                          <TransparentButton
                            title={`${t("Change Phone Number")}`}
                            onPress={() => {
                              setError("");
                              setValue("");
                              setPhone("");
                              setCode(false);
                              setLoginWithPassword(false);
                              setPassword("");
                            }}
                          />
                          <Text style={NewStyles.text3}> {t("or")} </Text>
                          <TransparentButton
                            title={`${t("Login With Code")}`}
                            onPress={() => {
                              if (!phone) {
                                setError('ابتدا شماره موبایل خود را وارد نمایید');
                              } else if (validatePhone()) {
                                setLoading(true);
                                setLoginWithPassword(false);
                                sendVerificationCode();
                              } else {
                                setError(
                                  `${t(
                                    "The mobile number you entered is not valid."
                                  )}`
                                );
                              }
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.wrapper}>
                      <Text style={NewStyles.text10}>
                        {t("A verification code has been sent to")} {phone}.
                      </Text>
                      <CodeField
                        ref={ref}
                        {...props}
                        value={value}
                        onChangeText={(text) => {
                          setValue(text);
                          if (error) { setError('') }
                        }}
                        cellCount={6}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        autoComplete={Platform.select({
                          android: "sms-otp",
                          default: "one-time-code",
                        })}
                        renderCell={({ index, symbol, isFocused }) => (
                          <Text
                            key={index}
                            style={[styles.cell, NewStyles.border5]}
                            onLayout={getCellOnLayoutHandler(index)}
                          >
                            {symbol || (isFocused ? <Cursor /> : null)}
                          </Text>
                        )}
                      />
                      {error && <Text style={NewStyles.text6}>{error}</Text>}
                      <Button
                        title={`${t("Submit")}`}
                        loading={loading}
                        onPress={() => {
                          if (timer <= 0) {

                            showToastOrAlert('کد شما منقضی شده است.')
                            return;
                          }
                          if (value?.length === 6) {
                            setLoading(true);
                            codeVerification();
                          } else {
                            setError(`${t("Please enter the code correctly.")}`);
                          }
                        }}
                      />
                      {timer > 0 && <View style={[NewStyles.center, { marginBottom: 10 }]}>
                        <Text style={[NewStyles.text1, { fontFamily: 'VazirBold' }]}>{formatTime(timer)} <Text style={{ color: themeColor3.bgColor(1), fontFamily: 'VazirLight' }}>باقی مانده</Text></Text>
                      </View>}
                      {<View style={NewStyles.center}>
                        {timer <= 0 && <Text style={NewStyles.text1}>
                          {t("Didn't you receive a verification code?")}
                        </Text>}
                        <View style={NewStyles.rowWrapper}>
                          <TransparentButton
                            title={`${t("Change Phone Number")}`}
                            onPress={() => {
                              setError("");
                              setValue("");
                              setPhone("");
                              setCode(false);
                            }}
                          />
                          <Text style={NewStyles.text10}> {t("or")} </Text>
                          <TransparentButton
                            title={`${t("Resend Code")}`}
                            onPress={() => {
                              if (timer > 0) {
                                showToastOrAlert(`لطفا ${formatTime(timer)} دیگر تلاش کنید`);
                                return
                              } else {

                                setLoading(true);
                                setValue("");
                                sendVerificationCode();
                              }
                            }}
                          />
                        </View>
                      </View>}
                    </View>
                  )}
                </View>
                :
                <View style={[styles.modalView, NewStyles.border5]}>
                  <Text style={NewStyles.title10}>{t("Login | Register")}</Text>
                  <RegisterScreen phone={phone}
                    setPhone={setPhone}
                    error={error}
                    onOk={sendVerificationCode}
                    setError={setError} />
                  <TouchableOpacity style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor1.bgColor(1), paddingVertical: 5, alignSelf: 'center', paddingHorizontal: 10 }} onPress={() => { setTab('login') }}>
                    <Text style={[NewStyles.text1, { textAlign: 'center' }]}>قبلا ثبت نام کرده‌اید؟ وارد شوید</Text>
                  </TouchableOpacity>
                </View>

            }
          </ScrollView>

        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColor1.bgColor(0.5),
  },
  modalView: {
    // height: "40%",
    minHeight: 400,
    width: "85%",
    padding: 15,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: themeColor4.bgColor(0.3),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: themeColor4.bgColor(1)
  },
  wrapper: {
    width: "100%",
    gap: 10,
    // flex: 1,
    // justifyContent: 'space-between'
  },
  cell: {
    width: 40,
    height: 40,
    backgroundColor: themeColor1.bgColor(0.2),
    fontSize: 20,
    color: themeColor1.bgColor(1),
    fontFamily: "VazirLight",
    textAlign: "center",
    lineHeight: 40,
  },
});
