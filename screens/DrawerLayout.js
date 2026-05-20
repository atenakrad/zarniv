import { Text, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import NewStyles from '../styles/NewStyles';
import { themeColor10, themeColor4, themeColor5 } from '../theme/Color';
import CustomDrawerContent from './CustomDrawerContent';
import MainLayout from './MainLayout';
import Transactions from './account/Transactions';
import Remittance from './account/Remittance';
import Colleague from './account/Colleague';
import Chat from './account/Chat';
import { useSelector } from 'react-redux';
import Orders from './orders/Orders';
import { Image } from 'expo-image';

const Drawer = createDrawerNavigator();

export default function DrawerLayout() {

    const { t } = useTranslation();
    const user = useSelector(state => state.user?.data);
    const accessToken = useSelector(state => state?.token?.accessToken);

    const renderIcon = (iconName) => ({ color, focused }) => (
        <Ionicons name={focused ? iconName : `${iconName}-outline`} size={20} color={color} />
    );

    return (
        <Drawer.Navigator
            drawerContent={props => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerTitle: '',
                headerTitleStyle: NewStyles.title10,
                headerTintColor: themeColor10.bgColor(1),
                headerStyle: { backgroundColor: themeColor5.bgColor(1), elevation: 0 },
                headerRightContainerStyle: { paddingRight: '5%' },
                headerRight: () => (
                    <Text style={NewStyles.title10}>زرنیو</Text>
                    // <Image style={{ height: 25, aspectRatio: 1 }} contentFit='contain' source={require('../assets/images/logo.png')} />
                ),
                drawerType: 'slide',
                drawerActiveTintColor: themeColor10.bgColor(1),
                drawerInactiveTintColor: themeColor10.bgColor(0.5),
                drawerStyle: { backgroundColor: themeColor4.bgColor(1) },
                drawerLabelStyle: { fontFamily: 'VazirLight', textAlign: 'right' },
                swipeEnabled: false,
            }}
        >
            <Drawer.Screen name='MainLayout' component={MainLayout} options={{ headerTransparent: true, headerStyle: { backgroundColor: themeColor4.bgColor(0), elevation: 0 }, drawerLabel: t('Home'), drawerIcon: renderIcon("home") }} />
            {accessToken && <Drawer.Screen name='Orders' component={Orders} options={{ drawerLabel: t('Orders'), drawerIcon: renderIcon("cart") }} />}
            {accessToken && <Drawer.Screen name='Transactions' component={Transactions} options={{ drawerLabel: t('Transactions'), drawerIcon: renderIcon("receipt") }} />}
            {accessToken && <Drawer.Screen name='Chat' component={Chat} options={{ drawerLabel: t('پیام پشتیبانی'), drawerIcon: renderIcon("chatbox") }} />}
            {accessToken && user?.is_collaborator == 1 && <Drawer.Screen name='Remittance' component={Remittance} options={{ drawerLabel: t('حواله همکاران'), drawerIcon: renderIcon("document") }} />}
            {accessToken && user?.is_collaborator == 1 && <Drawer.Screen name='Colleague' component={Colleague} options={{ drawerLabel: t('خرید و فروش همکاران'), drawerIcon: renderIcon("people") }} />}
        </Drawer.Navigator>
    );
}