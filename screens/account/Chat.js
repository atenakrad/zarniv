import { View, TextInput, Pressable, ImageBackground, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native'
import { useCallback, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import CustomStatusBar from '../../components/CustomStatusBar';
import MessagesList from '../../components/MessagesList';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor12, themeColor5 } from '../../theme/Color';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { uri } from '../../services/URL';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Chat() {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState(null);
    const accessToken = useSelector((state) => state?.token?.accessToken)
    const [refreshing, setRefreshing] = useState(true)

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/tickets`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            setData(response?.data);
        } catch (error) {
            handleError(error, t)
        } finally {
            setRefreshing(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [refreshing]),
    );

    const submitTicket = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/tickets/create/`, { comment }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status === 201) {
                fetchData()
                setComment(null)
                // showToastOrAlert(response?.data?.message)
            }
        } catch (error) {
            const message = error?.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={[NewStyles.container, {
            // marginTop: insets.top,
            // marginBottom: insets.bottom * 3,
        }]}>
            <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={100} style={{ flex: 1 }} >
                {/* {loading && <Loader />} */}
                <CustomStatusBar />
                <ImageBackground resizeMode='cover' blurRadius={20} style={{ justifyContent: 'space-between', backgroundColor: themeColor5.bgColor(1), flex: 1, overflow: 'visible' }}>
                    <View style={{ flex: 1 }}>
                        <MessagesList messeges={data} refreshing={refreshing} onRefresh={() => { fetchData() }} />
                    </View>
                    <View style={{ elevation: 3 }}>
                        <View style={[{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: themeColor5.bgColor(1), paddingRight: 10, alignItems: 'flex-end', borderTopColor: themeColor0.bgColor(1), borderTopWidth: StyleSheet.hairlineWidth }]}>
                            <TextInput style={[{ flex: 1, marginHorizontal: 10 }, NewStyles.text10]} placeholderTextColor={themeColor10.bgColor(0.5)} placeholder='پیام خود را بنویسید.' value={comment} maxLength={800} onChangeText={(p) => { setComment(p) }} multiline={true} />
                            <View style={[NewStyles.rowWrapper, { paddingVertical: 5 }]}>
                                <Pressable style={[{ padding: 10, aspectRatio: 1, backgroundColor: themeColor10.bgColor(1), marginHorizontal: 2 }, NewStyles.center, NewStyles.border100]}
                                    onPress={() => {
                                        if (comment) {
                                            submitTicket()
                                        }
                                    }}>
                                    <Ionicons name="paper-plane-outline" size={15} color={themeColor5.bgColor(1)} />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}