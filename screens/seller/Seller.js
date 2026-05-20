import { View, Text, Image } from 'react-native';
import { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';

import NewStyles from '../../styles/NewStyles';
import { themeColor12, themeColor10, themeColor5 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import Products from './Products';
import Gems from './Gems';
import { mainUri } from '../../services/URL';

const Top = createMaterialTopTabNavigator();

export default function Seller({ route }) {

    const [loading, setLoading] = useState(false);

    const sellerId = route?.params?.sellerId;
    const name = route?.params?.name;
    const image = route?.params?.image;

    return (
        <View style={[NewStyles.container, { backgroundColor: themeColor12.bgColor(1) }]}>
            <CustomStatusBar />
            {loading && <Loader />}
            <View style={[NewStyles.center, { padding: '5%' }]}>
                <Image style={{ width: 100, height: 100 }} resizeMode='contain' source={{ uri: `${mainUri}${image}` }} />
                {/* <Text style={NewStyles.text10}>گالری {name}</Text> */}
            </View>
            <Top.Navigator
                initialRouteName='Products'
                backBehavior='initialRoute'
                screenOptions={{
                    tabBarStyle: { backgroundColor: themeColor5.bgColor(1), elevation: 0, borderTopEndRadius: 25, borderTopStartRadius: 25 },
                    tabBarIndicatorStyle: { backgroundColor: themeColor10.bgColor(1) },
                    tabBarInactiveTintColor: themeColor10.bgColor(1),
                    tabBarActiveTintColor: themeColor10.bgColor(1),
                    tabBarShowLabel: false,
                }}>
                <Top.Screen options={{ tabBarIcon: ({ color, focused }) => { return <Ionicons name={focused ? "diamond" : "diamond-outline"} size={20} color={color} /> } }} initialParams={{ sellerId: sellerId }} name='Gems' component={Gems} />
                <Top.Screen options={{ tabBarIcon: ({ color, focused }) => { return <Ionicons name={focused ? "storefront" : "storefront-outline"} size={20} color={color} /> } }} initialParams={{ sellerId: sellerId }} name='Products' component={Products} />
            </Top.Navigator>
        </View>
    )
}