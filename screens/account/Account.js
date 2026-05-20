import { ActivityIndicator, Image, Pressable, ScrollView, SectionList, Share, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles from '../../styles/NewStyles'
import { useDispatch, useSelector } from 'react-redux'
import LoginModal from '../auth/LoginModal'
import { LinearGradient } from 'expo-linear-gradient'
import { themeColor0, themeColor1, themeColor4 } from '../../theme/Color'
import { Ionicons } from '@expo/vector-icons';
import { mainUri } from '../../services/URL'
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next'
import { useVersionCheckContext } from '../../context/VersionCheckContext'
import { showToastOrAlert } from '../../helpers/Common'
import ConfirmationModal from '../../components/ConfirmationModal'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { emptyUser } from '../../slices/userSlice'
import { emptyCart } from '../../slices/cartSlice'
import { removeToken } from '../../slices/tokenSlice'
import axios from 'axios'

const Account = ({ navigation }) => {
  const user = useSelector(state => state.user?.data); 
  const accessToken = useSelector(state => state.token?.accessToken);
  const [logoutModal, setLogoutModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { recheckVersion, loading: versionLoading } = useVersionCheckContext();
  const currentVersion = Constants.expoConfig?.version || '1.0.0';
  const deleteAccount = async () => {
    try {
      const response = await axios.get(`${uri}/deleteAccount/`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
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
  const logout = async () => {
    await AsyncStorage.multiRemove(['refreshToken', 'accessToken']);
    dispatch(emptyUser());
    dispatch(emptyCart());
    dispatch(removeToken());
    navigation.reset({ index: 0, routes: [{ name: 'MainLayout' }] });
    const message = t('You have successfully logged out!');
    showToastOrAlert(message);
  };
  const onShare = async () => {
    try {
      await Share.share({ message: `دیگر نیازی به گشتن در بازارها و نگرانی از اصالت و قیمت طلا نیست! زرنیو، جامع‌ترین پلتفرم خرید و فروش طلای آنلاین، همراه همیشگی شما در دنیای درخشان طلا و سرمایه‌گذاری هوشمندانه است. \n کد معرف من: ${user?.referall_code} \nhttps://zarniv.com` });
    } catch {
      const message = t('An unexpected error occurred!');
      showToastOrAlert(message);
    }
  };
  const DATA = [
    {
      data: [
        { id: 1, title: 'سفارشات', icon: 'receipt-outline', navigation: 'Orders' },
        { id: 4, title: 'تراکنش‌ها', icon: 'swap-horizontal-outline', navigation: 'Transactions' },
        { id: 2, title: 'فیش‌های واریزی', icon: 'list-outline', navigation: 'RecieptLists' },
        { id: 5, title: 'چت پشتیبانی', icon: 'chatbubble-outline', navigation: 'Chat' },
        { id: 3, title: 'تغییر رمز عبور', icon: 'lock-closed-outline', navigation: 'ChangePassword' },
      ],
    }, 
    {
      data: [
        { id: 2, title: t('FAQ'), icon: 'help-circle-outline', navigation: 'Faq' },
        { id: 3, title: t('Terms & Conditions'), icon: 'document-text-outline', navigation: 'Terms' },
        { id: 5, title: t('Privacy Policy'), icon: 'shield-checkmark-outline', navigation: 'Privacy' },
        { id: 6, title: t('About Us'), icon: 'information-circle-outline', navigation: 'About' },
      ],
    },
    {
      data: [
        { id: 10, title: 'بررسی به‌روزرسانی', icon: 'cloud-download-outline', navigation: 'CheckUpdate' },
        { id: 7, title: t('Invite Friends'), icon: 'person-add-outline', navigation: 'InviteFriends' },
        { id: 8, title: t('Log Out'), icon: 'log-out-outline', navigation: 'Logout' },
        // { id: 9, title: t('Delete Account'), icon: 'trash-outline', navigation: 'DeleteAccount' },
      ],
    },
  ];
  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: (accessToken && user) ? 'additive' : 'off' }}>
      {
        (accessToken && user) ?
          <View style={{ flex: 1 }}>
            <View style={[{ width: '100%', paddingVertical: 20, backgroundColor: themeColor1.bgColor(1), }, NewStyles.center]}>
              <View style={[{ backgroundColor: themeColor4.bgColor(1), height: 90, width: 90 }, NewStyles.border100]}>
                <View style={[{ height: '100%', width: '100%', backgroundColor: themeColor0.bgColor(0.8) }, NewStyles.center, NewStyles.border100]}>
                  {user?.image ?
                    <Image
                      source={{ uri: `${mainUri}${user?.image}` }}
                      style={[{ height: '100%', width: '100%' }, NewStyles.border100]}
                    />
                    :

                    <Text style={NewStyles.title1}>{(user?.first_name || user?.last_name) ? `${user?.first_name?.[0]} ${user?.last_name?.[0]}` : 'کاربر زرنیو'}</Text>
                  }
                </View>
              </View>
              <Pressable style={[NewStyles.row, { gap: 10, paddingTop: 10 }]} onPress={() => {
                navigation.navigate('Profile')
              }}>
                <Text style={NewStyles.text4}>{(user?.first_name || user?.last_name) ? `${user?.first_name} ${user?.last_name}` : 'ویرایش حساب'}</Text>
                <Ionicons name={'pencil'} color={themeColor4.bgColor(1)} size={20} />
              </Pressable>
            </View>
            <SectionList
              contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]}
              showsVerticalScrollIndicator={false}
              stickyHeaderHiddenOnScroll
              sections={DATA}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ section, item, index }) => {

                return (
                  <>
                    <Pressable style={[styles.itemWrapper, NewStyles.rowWrapper, NewStyles.shadow, index != (section.data.length - 1) && styles.border, index === 0 && styles.borderTopRadius, index == (section.data.length - 1) && styles.borderBottomRadius]}
                      onPress={() => {
                        if (item.navigation === 'Logout') setLogoutModal(true);
                        else if (item.navigation === 'DeleteAccount') setDeleteAccountModal(true);
                        else if (item.navigation === 'InviteFriends') onShare();
                        else if (item.navigation === 'CheckUpdate') recheckVersion();
                        else navigation.navigate(item.navigation);
                      }}
                    >
                      <View style={[NewStyles.row, { flex: 1 }]}>
                        <Ionicons name={item.icon} size={22} color={themeColor0.bgColor(0.6)} style={{ marginHorizontal: 20 }} />
                        <Text style={[NewStyles.text10, { flex: 1 }]}>{item?.title}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 10 }}>

                        {item.navigation === 'CheckUpdate' && versionLoading ? (
                          <ActivityIndicator size="small" color={themeColor0.bgColor(0.6)} />
                        ) : (
                          <Ionicons name={'chevron-back'} size={18} color={themeColor0.bgColor(0.6)} />
                        )}
                      </View>
                    </Pressable>
                  </>
                )
              }}
              renderSectionFooter={() => <View style={styles.separator} />}
              ListFooterComponent={() => (
                <View style={NewStyles.center}>
                  <Text style={NewStyles.text10}>{currentVersion} V</Text>
                </View>
              )}
            />
          </View>
          :
          <LoginModal />
      }
      <ConfirmationModal confirmationModal={logoutModal} setConfirmationModal={setLogoutModal} title={`${t('Logout')}`} message={t('Are you sure you want to log out?')} action={logout} />

      <ConfirmationModal confirmationModal={deleteAccountModal} setConfirmationModal={setDeleteAccountModal} title={`${t('Delete Account')}`} message={t('Are you sure you want to delete your account?')} action={deleteAccount} />

    </SafeAreaView>
  )
}

export default Account

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 100,
    marginHorizontal: '5%'
  },
  itemWrapper: {
    backgroundColor: themeColor4.bgColor(1),
    paddingVertical: 15,
  },
  border: {
    borderBottomColor: themeColor0.bgColor(0.2),
    borderBottomWidth: StyleSheet.hairlineWidth * 1.1,
    marginBottom: StyleSheet.hairlineWidth * 1.1
  },
  borderTopRadius: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10
  },
  borderBottomRadius: {
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10
  },
  separator: {
    paddingVertical: 10,
  },
})