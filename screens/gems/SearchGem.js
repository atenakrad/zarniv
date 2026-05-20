import { View, Pressable, FlatList, StyleSheet, RefreshControl, Platform, ToastAndroid, TextInput, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

import { uri } from '../../services/URL';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor4 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import BlankScreen from '../../components/BlankScreen';
import GemItem2 from '../../components/GemItem2';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchGem({ navigation }) {

    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchFor, setSearchFor] = useState(null);
    const [searchResult, setSearchResult] = useState([]);

    const search = async () => {
        if (!searchFor || searchFor?.trim()?.length == 0) {
            setSearchResult([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/shop/search/silvers/`, { searchFor });
            setSearchResult(response.data);
        } catch (error) {
            const errorMessage = error.response ? t('An unexpected error occurred!') : t('Network error!');
            Platform.OS === 'android' ? ToastAndroid.show(errorMessage, ToastAndroid.SHORT) : alert(errorMessage);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }
    useFocusEffect(
        useCallback(() => {
            search();
        }, [searchFor, refreshing])
    );

    return (
        <SafeAreaView edges={{top:'off', bottom:'additive'}} style={NewStyles.container}>
            <CustomStatusBar />
            <Pressable style={[styles.searchBar, NewStyles.row, NewStyles.border100]}>
                {!loading ? <Ionicons name={'search'} size={20} color={themeColor0.bgColor(1)} /> : <ActivityIndicator color={themeColor0.bgColor(1)} size='small' />}
                <TextInput style={[NewStyles.textInput, NewStyles.text, { flex: 1, color: themeColor10.bgColor(1), backgroundColor: themeColor4.bgColor(1), paddingHorizontal: 0 }]} autoFocus={true} keyboardType='default' placeholderTextColor={themeColor10.bgColor(1)} placeholder={'جستجو در سنگ های قیمتی'} value={searchFor} onChangeText={(text) => setSearchFor(text)} />
            </Pressable>
            <FlatList
                contentContainerStyle={styles.contentContainerStyle}
                ListEmptyComponent={() => <BlankScreen />}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                keyExtractor={(item) => item?.id?.toString()}
                data={searchResult}
                renderItem={({ item }) => (
                    <GemItem2 item={item} navigation={navigation} />
                )}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingTop: 20,
        // paddingBottom: 100,
    },
    searchBar: {
        // marginTop: 20,
        height: 40,
        backgroundColor: themeColor4.bgColor(1),
        marginHorizontal: '5%',
        paddingHorizontal: '5%',
        gap: 5
    },
    contentContainerStyle1: {
        gap: 20,
        paddingHorizontal: '5%',
    },
})