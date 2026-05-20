import { View, Pressable, FlatList, StyleSheet, RefreshControl, Platform, ToastAndroid, TextInput, ActivityIndicator } from 'react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

import { uri } from '../../services/URL';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor3, themeColor5 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import ProductItem2 from '../../components/ProductItem2';
import BlankScreen from '../../components/BlankScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { handleError } from '../../helpers/Common';

export default function Search({ navigation }) {

    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchFor, setSearchFor] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const search = async () => {
        if (!searchFor || searchFor?.trim()?.length == 0) {
            setSearchResult([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/shop/search/products/`, { searchFor });
            setSearchResult(response.data);
        } catch (error) {
            handleError(error)
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            search();
        }, [searchFor])
    );

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <CustomStatusBar />
            <Pressable style={[styles.searchBar, NewStyles.row, NewStyles.border100]}>
                {!loading ? <Ionicons name={'search'} size={20} color={themeColor0.bgColor(1)} /> : <ActivityIndicator color={themeColor0.bgColor(1)} size={20} />}
                <TextInput style={[NewStyles.textInput, NewStyles.text10, { flex: 1, color: themeColor10.bgColor(1), backgroundColor: themeColor3.bgColor(0), paddingHorizontal: 0 }]} autoFocus={true} keyboardType='default' placeholderTextColor={themeColor10.bgColor(0.5)} placeholder={'جستجو...'} value={searchFor} onChangeText={(text) => setSearchFor(text)} />
            </Pressable>

            <View>
                <FlatList
                    contentContainerStyle={styles.contentContainerStyle}
                    ListEmptyComponent={() => <BlankScreen />}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true); search() }} />}
                    keyExtractor={(item) => item?.id?.toString()}
                    data={searchResult}
                    renderItem={({ item }) => (
                        <ProductItem2 item={item} navigation={navigation} />
                    )}
                />
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingTop: 20,
        paddingBottom: 100,
    },
    searchBar: {
        height: 40,
        backgroundColor: themeColor3.bgColor(0.2),
        marginHorizontal: '5%',
        paddingHorizontal: '5%',
        gap: 5
    },
})