import "./gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import store from "./store";
import en from "./assets/locales/en.json";
import fa from "./assets/locales/fa.json";

import NewStyles from "./styles/NewStyles";
import { themeColor4, themeColor1, themeColor5 } from "./theme/Color";
import Landing from "./screens/Landing";
import DrawerLayout from "./screens/DrawerLayout";
import Increase from "./screens/wallet/Increase";
import Decrease from "./screens/wallet/Decrease";
import Purchase from "./screens/wallet/Purchase";
import EditCard from "./screens/wallet/EditCard";
import ProductDetail from "./screens/shop/ProductDetail";
import Products from "./screens/shop/Products";
import RateDetail from "./screens/rate/RateDetail";
import Profile from "./screens/account/Profile";
import Sell from "./screens/account/Sell";
import Buy from "./screens/account/Buy";
import History from "./screens/account/History";
import SubmitOrder from "./screens/cart/SubmitOrder";
import Address from "./screens/cart/Address";
import OrderDetail from "./screens/orders/OrderDetail";
import Seller from "./screens/seller/Seller";
import Search from "./screens/shop/Search";
import MainLayout from "./screens/MainLayout";
import {
  VersionCheckProvider,
  useVersionCheckContext,
} from "./context/VersionCheckContext";
import UpdateModal from "./components/UpdateModal";
import Orders from "./screens/orders/Orders";
import BackHeader from "./components/BackHeader";
import Transactions from "./screens/account/Transactions";
import About from "./screens/resources/About";
import Privacy from "./screens/resources/Privacy";
import Terms from "./screens/resources/Terms";
import Faq from "./screens/resources/Faq";
import Colleague from "./screens/account/Colleague";
import CommingSoon from "./screens/CommingSoon";
import Chat from "./screens/account/Chat";
import Gems from "./screens/gems/Gems";
import SearchGem from "./screens/gems/SearchGem";
import GemDetail from "./screens/gems/GemDetail";
import ProductsByCollection from "./screens/shop/ProductsByCollection";
import Verify from "./screens/wallet/Verify";
import DeliveryRequest from "./screens/wallet/DeliveryRequest";
import DeliveryRequestHistory from "./screens/wallet/DeliveryRequestHistory";
import GoldSellRequest from "./screens/wallet/GoldSellRequest";
import SellRequestHistory from "./screens/wallet/SellRequestHistory";
import ChargeSilverWallet from "./screens/wallet/ChargeSilverWallet";
import SilverDeliveryRequest from "./screens/wallet/SilverDeliveryRequest";
import SilverDeliveryRequestHistory from "./screens/wallet/SilverDeliveryRequestHistory";
import SilverSellRequest from "./screens/wallet/SilverSellRequest";
import SellSilverRequestHistory from "./screens/wallet/SellSilverRequestHistory";
import ChangePassword from "./screens/account/ChangePassword";
import RecieptLists from "./screens/wallet/RecieptLists";
import PayReserve from "./screens/orders/PayReserve";
import ShippingDeliveryPayment from "./screens/wallet/ShippingDeliveryPayment";
import ShippingDeliveryPaymentSilver from "./screens/wallet/ShippingDeliveryPaymentSilver";
import SilverConvert from "./screens/wallet/SilverConvert";
import GoldConvert from "./screens/wallet/GoldConvert";
import GoldSilverChart from "./screens/chart/GoldSilverChart";
import ForeignLayout from "./screens/Foreign";
// import * as Localization from "expo-localization";

function VersionCheckModal() {
  const { updateInfo, showModal, closeModal } = useVersionCheckContext();

  if (!updateInfo || !showModal) return null;

  return (
    <UpdateModal
      visible={showModal}
      onClose={closeModal}
      updateInfo={updateInfo}
    />
  );
}
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 2000,
  fade: true,
});

const Stack = createNativeStackNavigator();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng: "fa",
  fallbackLng: "fa",
  interpolation: {
    escapeValue: false,
  },
});

export default function App() {
  const [loaded, error] = useFonts({
    VazirBold: require("./assets/fonts/Vazir-Bold-FD.ttf"),
    VazirLight: require("./assets/fonts/Vazir-Light-FD.ttf"),
    viaoda: require("./assets/fonts/viaoda.ttf"),
    DimaShekasteh: require("./assets/fonts/DimaShekasteh.ttf"),
    IranNastaliq: require("./assets/fonts/IranNastaliq.ttf"),
    ShekastehV2001: require("./assets/fonts/ShekastehV2001.ttf"),
    saye: require("./assets/fonts/saye.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  function isUserIranian() {
    // return false;
    const locales = Localization.getLocales();

    const hasIranRegion = locales.some((locale) => locale.regionCode === "IR");
    const hasPersianLanguage = locales.some(
      (locale) => locale.languageCode === "fa"
    );
    const isTehranTimezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Tehran";

    return hasIranRegion || isTehranTimezone;
  }


  const isIranian = isUserIranian();
  const initialRoute = isIranian ? "Landing" : "ForeignLayout";


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <VersionCheckProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: Platform.OS == "android" ? false : false,
                headerBackButtonMenuEnabled: false,
                headerBackTitle: "بازگشت",
                headerTitleStyle: NewStyles.text10,
                headerTintColor: themeColor1.bgColor(1),
                headerStyle: {
                  backgroundColor: themeColor1.bgColor(1),
                  elevation: 0,
                },
                headerShadowVisible: false,
              }}
            >
              {isIranian ? (
                <>
                  <Stack.Screen
                    name="Landing"
                    component={Landing}
                    options={{ gestureEnabled: false }}
                  />
                  <Stack.Screen
                    name="MainLayout"
                    component={MainLayout}
                    options={{ gestureEnabled: false }}
                  />

                  {/* Wallet */}

                  <Stack.Screen name="EditCard" component={EditCard} />
                  <Stack.Screen name="Decrease" component={Decrease} />
                  <Stack.Screen name="Increase" component={Increase} />
                  {/* Wallet */}

                  <Stack.Screen name="Rate Detail" component={RateDetail} />

                  <Stack.Screen
                    name="ProductsByCollection"
                    component={ProductsByCollection}
                    options={{
                      headerShown: true,
                      header: ({ route }) => {
                        const params = route?.params;
                        return <BackHeader title={`${params?.name}`} />;
                      },
                    }}
                  />
                  <Stack.Screen name="Buy" component={Buy} />
                  <Stack.Screen name="Sell" component={Sell} />
                  <Stack.Screen name="History" component={History} />
                  <Stack.Screen name="Address" component={Address} />
                  <Stack.Screen
                    name="RecieptLists"
                    component={RecieptLists}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"فیش‌های واریزی"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="PayReserve"
                    component={PayReserve}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"پرداخت باقی مبلغ"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="ShippingDeliveryPayment"
                    component={ShippingDeliveryPayment}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"پرداخت هزینه ارسال"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="ShippingDeliveryPaymentSilver"
                    component={ShippingDeliveryPaymentSilver}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"پرداخت هزینه ارسال"} />;
                      },
                    }}
                  />
                  <Stack.Screen name="Order Detail" component={OrderDetail} />
                  <Stack.Screen name="Verify" component={Verify} />
                  <Stack.Screen name="Purchase" component={Purchase} />
                  <Stack.Screen
                    name="ChargeSilverWallet"
                    component={ChargeSilverWallet}
                  />
                  <Stack.Screen
                    name="SilverConvert"
                    component={SilverConvert}
                  />
                  <Stack.Screen name="GoldConvert" component={GoldConvert} />
                  <Stack.Screen
                    name="SilverDeliveryRequest"
                    component={SilverDeliveryRequest}
                  />
                  <Stack.Screen
                    name="GoldSellRequest"
                    component={GoldSellRequest}
                  />
                  <Stack.Screen
                    name="SilverSellRequest"
                    component={SilverSellRequest}
                  />
                  <Stack.Screen
                    name="SellSilverRequestHistory"
                    component={SellSilverRequestHistory}
                  />
                  <Stack.Screen
                    name="SellRequestHistory"
                    component={SellRequestHistory}
                  />
                  <Stack.Screen
                    name="SilverDeliveryRequestHistory"
                    component={SilverDeliveryRequestHistory}
                  />

                  {/* Account */}
                  <Stack.Screen name="Profile" component={Profile} />
                  <Stack.Screen
                    name="Orders"
                    component={Orders}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"سفارشات"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="GoldSilverChart"
                    component={GoldSilverChart}
                    options={{
                      headerShown: false,
                      header: () => {
                        return <BackHeader title={"سود و زیان"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="ChangePassword"
                    component={ChangePassword}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"تغییر رمز عبور"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="Transactions"
                    component={Transactions}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"تراکنش‌ها"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="About"
                    component={About}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"درباره زرنیو"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="DeliveryRequest"
                    component={DeliveryRequest}
                  />
                  <Stack.Screen
                    name="DeliveryRequestHistory"
                    component={DeliveryRequestHistory}
                  />
                  <Stack.Screen
                    name="Privacy"
                    component={Privacy}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"حریم خصوصی"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="Terms"
                    component={Terms}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"قوانین و مقررات"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="Faq"
                    component={Faq}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"سوالات متداول"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="Colleague"
                    component={Colleague}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"خرید و فروش طلا"} />;
                      },
                    }}
                  />
                  <Stack.Screen name="Seller" component={Seller} />
                  <Stack.Screen name="CommingSoon" component={CommingSoon} />
                  <Stack.Screen
                    name="Chat"
                    component={Chat}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"چت پشتیبانی"} />;
                      },
                    }}
                  />
                  {/* Account */}

                  {/* Shop */}
                  <Stack.Screen
                    name="Product Detail"
                    component={ProductDetail}
                  />
                  <Stack.Screen
                    name="Search"
                    component={Search}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"جستجو"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="SearchGem"
                    component={SearchGem}
                    options={{
                      headerShown: true,
                      header: () => {
                        return <BackHeader title={"جستجو"} />;
                      },
                    }}
                  />
                  <Stack.Screen
                    name="Gem Detail"
                    component={GemDetail}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen name="Submit Order" component={SubmitOrder} />
                  <Stack.Screen name="Gems" component={Gems} />
                  <Stack.Screen name="Products" component={Products} />
                  {/* Shop */}
                </>
              ) : (
                <Stack.Screen
                  name="ForeignLayout"
                  component={ForeignLayout}
                  options={{ headerShown: false }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
          <VersionCheckModal />
        </VersionCheckProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
