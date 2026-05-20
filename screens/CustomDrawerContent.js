import { Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useDispatch, useSelector } from 'react-redux';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { mainUri } from '../services/URL';
import { emptyUser } from '../slices/userSlice';
import { removeToken } from '../slices/tokenSlice';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor12, themeColor10, themeColor5, themeColor4 } from '../theme/Color';
import { appVersion, showToastOrAlert } from '../helpers/Common';
import ConfirmationModal from '../components/ConfirmationModal';
import { emptyCart } from '../slices/cartSlice';
import LoginModal from './auth/LoginModal';

export default function CustomDrawerContent(props) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const user = useSelector(state => state.user?.data);

    const accessToken = useSelector(state => state?.token?.accessToken);

    const handleShare = async () => {
        try {
            await Share.share({ message: t('message') });
        } catch {
            const message = t('An unexpected error occurred!');
            showToastOrAlert(message);
        }
    };

    const [logoutModal, setLogoutModal] = useState(false);
    const logout = async () => {
        await AsyncStorage.multiRemove(['refreshToken', 'accessToken']);
        dispatch(emptyUser());
        dispatch(emptyCart());
        dispatch(removeToken());
        props.navigation.reset({ index: 0, routes: [{ name: 'DrawerLayout' }] });
        const message = t('You have successfully logged out!');
        showToastOrAlert(message);
    };

    const [deleteAccountModal, setDeleteAccountModal] = useState(false);
    const deleteAccount = async () => {
        try {
            const response = await axios.get(`${uri}/deleteAccount`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status === 200) {
                await AsyncStorage.multiRemove(['refreshToken', 'accessToken']);
                dispatch(emptyUser());
                dispatch(emptyCart());
                dispatch(removeToken());
                navigation.reset({ index: 0, routes: [{ name: 'DrawerLayout' }] });
                const message = t('Your account has been deleted successfully!');
                showToastOrAlert(message);
            }
        } catch (error) {
            const message = error.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        }
    };

    const renderIcon = (iconName) => ({ color, focused }) => (
        <Ionicons name={focused ? iconName : `${iconName}-outline`} size={20} color={color} />
    );

    const [loginModal, setLoginModal] = useState(false);

    return (
        <View style={{ flex: 1 }}>
            {accessToken && <View style={[{ backgroundColor: themeColor12.bgColor(1), paddingHorizontal: '5%', paddingVertical: '10%', gap: 10 }, NewStyles.row]} >
                {user?.image ? (<Image style={[styles.profileImage, NewStyles.border100]} source={{ uri: `${mainUri}${user?.image}` }} contentFit="cover" transition={1000} />) : (<View style={[styles.profileImage, NewStyles.border100, NewStyles.center]}><Text style={styles.profileImageThumbnail}>{user?.first_name?.[0] || 'ک'}{user?.last_name?.[0] || 'ج'}</Text></View>)}
                <Pressable style={[NewStyles.row, { gap: 5 }]} onPress={() => { props.navigation.navigate('Profile') }}>
                    <Text style={[NewStyles.title10, { textTransform: 'capitalize' }]}>{(!user?.first_name && !user?.last_name) ? 'کاربر زرنیو' : user?.first_name + ' ' + user?.last_name}</Text>
                    <MaterialIcons name="edit" size={15} color={themeColor10.bgColor(1)} style={{ transform: [{ rotateY: '180deg' }] }} />
                </Pressable>
            </View>}
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
                <DrawerItem
                    label={t('FAQ')}
                    icon={renderIcon("help-circle")}
                    activeTintColor={themeColor10.bgColor(1)}
                    inactiveTintColor={themeColor10.bgColor(0.5)}
                    labelStyle={{ fontFamily: 'VazirLight', textAlign: 'right' }}
                    onPress={() => Linking.openURL(`${mainUri}/faqs/`)}
                />
                <DrawerItem
                    label={t('Terms & Conditions')}
                    icon={renderIcon("shield-checkmark")}
                    activeTintColor={themeColor10.bgColor(1)}
                    inactiveTintColor={themeColor10.bgColor(0.5)}
                    labelStyle={{ fontFamily: 'VazirLight', textAlign: 'right' }}
                    onPress={() => Linking.openURL(`${mainUri}/terms/`)}
                />
                <DrawerItem
                    label={t('Privacy Policy')}
                    icon={renderIcon("shield-half")}
                    activeTintColor={themeColor10.bgColor(1)}
                    inactiveTintColor={themeColor10.bgColor(0.5)}
                    labelStyle={{ fontFamily: 'VazirLight', textAlign: 'right' }}
                    onPress={() => Linking.openURL(`${mainUri}/privacy/`)}
                />
                <DrawerItem
                    label={t('About Us')}
                    icon={renderIcon("information-circle")}
                    activeTintColor={themeColor10.bgColor(1)}
                    inactiveTintColor={themeColor10.bgColor(0.5)}
                    labelStyle={{ fontFamily: 'VazirLight', textAlign: 'right' }}
                    onPress={() => Linking.openURL(`${mainUri}/about/`)}
                />
                <DrawerItem
                    label={t('Contact Us')}
                    icon={renderIcon("help-buoy")}
                    activeTintColor={themeColor10.bgColor(1)}
                    inactiveTintColor={themeColor10.bgColor(0.5)}
                    labelStyle={{ fontFamily: 'VazirLight', textAlign: 'right' }}
                    onPress={() => Linking.openURL(`${mainUri}/contact/`)}
                />
                <DrawerItem
                    label={t('Invite Friends')}
                    icon={renderIcon("share-social")}
                    activeTintColor={themeColor10.bgColor(1)}
                    inactiveTintColor={themeColor10.bgColor(0.5)}
                    labelStyle={{ fontFamily: 'VazirLight', textAlign: 'right' }}
                    onPress={() => handleShare()}
                />
                {accessToken ?
                    <DrawerItem
                        label={t('Log Out')}
                        icon={renderIcon("log-out")}
                        activeTintColor={themeColor10.bgColor(1)}
                        inactiveTintColor={themeColor10.bgColor(0.5)}
                        labelStyle={{ fontFamily: 'VazirLight', textAlign: 'right' }}
                        onPress={() => setLogoutModal(true)}
                    />
                    :
                    <DrawerItem
                        label={t('Sign In')}
                        icon={renderIcon("enter")}
                        activeTintColor={themeColor10.bgColor(1)}
                        inactiveTintColor={themeColor10.bgColor(0.5)}
                        labelStyle={{ fontFamily: 'VazirLight', textAlign: 'right' }}
                        onPress={() => setLoginModal(true)}
                    />
                }
            </DrawerContentScrollView>
            <View style={[NewStyles.center, { paddingVertical: '5%' }]}>
                <Text style={NewStyles.text10}>{appVersion()} V</Text>
            </View>
            <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
            <ConfirmationModal confirmationModal={logoutModal} setConfirmationModal={setLogoutModal} title={`${t('Logout')}`} message={t('Are you sure you want to log out?')} action={logout} />
            <ConfirmationModal confirmationModal={deleteAccountModal} setConfirmationModal={setDeleteAccountModal} title={`${t('Delete Account')}`} message={t('Are you sure you want to delete your account?')} action={deleteAccount} />
        </View>
    )
}

const styles = StyleSheet.create({
    profileImage: {
        height: 70,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themeColor4.bgColor(1),
    },

    profileImageThumbnail: {
        fontFamily: 'VazirLight',
        fontSize: 25,
        textAlign: 'center',
        textAlignVertical: 'center',
        textTransform: 'uppercase',
        color: themeColor10.bgColor(1),
    },
})