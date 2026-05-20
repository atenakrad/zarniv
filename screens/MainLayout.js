import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { themeColor0, themeColor1, themeColor10, themeColor4, themeColor5 } from "../theme/Color";

import NewStyles from "../styles/NewStyles";
import Wallet from "./wallet/Wallet";
import Rates from "./rate/Rates";
import Shop from "./shop/Shop";
import Cart from "./cart/Cart";
import { SafeAreaView } from "react-native-safe-area-context";
import Account from "./account/Account";
import { useSelector } from "react-redux";

const Tab = createBottomTabNavigator();

export default function MainLayout({ navigation }) {
  const user = useSelector(state => state.user?.data);
  const accessToken = useSelector(state => state.token?.accessToken);
  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>

      <Tab.Navigator
        initialRouteName="Shop"
        backBehavior="initialRoute"
        screenOptions={{
          headerTitle: "",
          headerTitleStyle: NewStyles.title10,
          headerStyle: { backgroundColor: themeColor5.bgColor(1), elevation: 0 },
          headerShown: true,
          tabBarShowLabel: false,
          tabBarIconStyle: { height: "100%", alignItems: "center" },
          headerLeftContainerStyle: { paddingLeft: "5%" },
          headerRightContainerStyle: { paddingRight: "5%" },
          headerTintColor: themeColor10.bgColor(1),
          tabBarActiveTintColor: themeColor0.bgColor(1),
          tabBarInactiveTintColor: themeColor0.bgColor(0.4),
          tabBarStyle: [styles.container, NewStyles.border100, NewStyles.shadow],
          headerRight: () => {
            return (
              <Image style={{ height: 40, width: 80, resizeMode: 'contain' }}
                source={require('../assets/images/logo.png')}
              />
            )
          },
          headerLeft: () => {
            return (
              <Text style={NewStyles.title}>فروشگاه</Text>
            )
          }

        }}
      >
        <Tab.Screen
          name="Account"
          component={Account}
          options={{
            headerShown: (accessToken && user) ? true : false,
            tabBarIcon: ({ color }) => {
              return <Ionicons name="person-outline" size={24} color={color} />;
            },
            headerLeft: () => {
              return (
                <Text style={NewStyles.title}>حساب کاربری</Text>
              )
            },
            headerStyle: { backgroundColor: themeColor1.bgColor(1), elevation:0 }
          }}
        />
        <Tab.Screen
          name="Rate"
          component={Rates}
          options={{
            tabBarIcon: ({ color }) => {
              return <Ionicons name="pulse" size={24} color={color} />;
            },
            headerLeft: () => {
              return (
                <Text style={NewStyles.title}>قیمت لحظه‌ای</Text>
              )
            }
          }}
        />
        <Tab.Screen
          name="Wallet"
          component={Wallet}
          options={{
            tabBarIcon: ({ color }) => {
              return <Ionicons name="card-outline" size={24} color={color} />;
            },
            headerLeft: () => {
              return (
                <Text style={NewStyles.title}>کیف‌پول</Text>
              )
            }
          }}
        />
        <Tab.Screen
          name="Cart"
          component={Cart}
          options={{
            tabBarIcon: ({ color }) => {
              return <Ionicons name="cart-outline" size={24} color={color} />;
            },
            headerLeft: () => {
              return (
                <Text style={NewStyles.title}>سبد خرید</Text>
              )
            }
          }}
        />

        <Tab.Screen
          name="Shop"
          component={Shop}
          options={{
            tabBarIcon: ({ color }) => {
              return <Ionicons name="storefront-outline" size={24} color={color} />;
            },
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  text: {
    fontFamily: 'VazirLight',
  },
  container: {
    height: 65,
    marginHorizontal: '5%',
    position: 'absolute',
    backgroundColor: themeColor1.bgColor(1),
    borderTopWidth: 0,
    bottom: 20,
    paddingBottom: 0
  }
})