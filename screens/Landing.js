import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18next";

import NewStyles from "../styles/NewStyles";
import CustomStatusBar from "../components/CustomStatusBar";
import { setLanguage } from "../slices/languageSlice";
import { setAccessToken, setRefreshToken } from "../slices/tokenSlice";
import { fetchUser } from "../slices/userSlice";
import { fetchCart } from "../slices/cartSlice";
import { fetchRate } from "../slices/rateSlice";
import { fetchTradingAllowed } from "../slices/tradingAllowed";

export default function Landing() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const refreshToken = useSelector((state) => state?.token?.refreshToken);
  const accessToken = useSelector((state) => state?.token?.accessToken);

  const loadLanguage = async () => {
    try {
      const language = await AsyncStorage.getItem("lang");
      if (language) {
        dispatch(setLanguage(language));
        i18n.changeLanguage(language);
      } else {
        i18n.changeLanguage("fa");
      }
    } catch (error) {
      console.error("Error loading language", error);
    }
  };

  const fetchUserToken = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      dispatch(setAccessToken(accessToken));
      dispatch(setRefreshToken(refreshToken));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadLanguage();
    fetchUserToken();
    navigation.navigate("MainLayout");
  }, []);
  
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchUser(accessToken));
      dispatch(fetchCart(accessToken));
      dispatch(fetchRate(accessToken));
    }
    dispatch(fetchTradingAllowed())
  }, [accessToken]);

  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar />
    </SafeAreaView>
  );
}