import React, { useEffect, useMemo, useState } from 'react';
import { ImageBackground, Platform, RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { imageUri, mainUri, uri } from '../../services/URL';
import { appVersion, cleanText } from '../../helpers/Common';
import Loader from '../../components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10 } from '../../theme/Color';

export default function Privacy() {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const lang = useSelector(state => state?.lang?.lang);
    const user = useSelector(state => state?.user?.data);
    const [data, setData] = useState({});
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/pages/privacy/`);
            setData(response?.data);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing]);

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            {loading && <Loader />}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}>
                
                <View style={[{ paddingHorizontal: '5%' }, NewStyles.center]}>
                    <Text style={[NewStyles.text10, { textAlign: 'justify', direction: 'rtl' }]}>{cleanText(data?.content)}</Text>
                    <Text style={NewStyles.text3}>{appVersion()} V</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingBottom: 20,
        gap: 20
    },
    imageBackground: {
        width: '100%',
        height: 250,
    },
})