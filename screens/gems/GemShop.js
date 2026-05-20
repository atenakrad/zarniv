import { View, Text, Pressable, FlatList, StyleSheet, RefreshControl, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mainUri, uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor12, themeColor4 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import GemItem from '../../components/GemItem';
import GemCategoryItem from '../../components/GemCategoryItem';
import Loader from '../../components/Loader';

export default function GemShop({ navigation }) {

    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(true);
    const [loading, setLoading] = useState(true);

    const [DATA, setDATA] = useState([]);
    const [categories, setCategories] = useState([]);
    const fetchData = async () => {
        try {
            const [response, response1] = await Promise.all([
                axios.get(`${uri}/gem/categories/main/`),
                axios.get(`${uri}/gem/shop/products/main/`),
            ]);
            setCategories(response.data);
            setDATA(response1.data);
            setLoading(false)
        } catch (error) {
            const message = error.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing])
    if (loading) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={NewStyles.container} mode='padding' edges={{ top: 'maximum', bottom: 'off' }}>
            <CustomStatusBar />
            <FlatList
                contentContainerStyle={styles.sectionListContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor1.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                data={DATA?.filter(item => item?.data?.length > 0)}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={() =>
                    <View style={{ gap: 10 }}>
                        <Pressable style={[styles.searchBar, NewStyles.row, NewStyles.border100]} onPress={() => navigation.navigate('SearchGem')}>
                            <Ionicons name={'search'} size={20} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.text10}>جستجو در<Text style={NewStyles.text}> سنگ‌های قیمتی</Text></Text>
                        </Pressable>
                        <FlatList
                            style={NewStyles.center}
                            contentContainerStyle={styles.flatListContainer}
                            showsVerticalScrollIndicator={false}
                            numColumns={3}
                            data={categories}
                            keyExtractor={(item) => item?.id?.toString()}
                            renderItem={({ item }) => <GemCategoryItem item={item} navigation={navigation} />}
                        />
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={{ gap: 10 }}>
                        <FlatList
                            style={{ paddingVertical: 10 }}
                            contentContainerStyle={styles.flatListContainer}
                            horizontal inverted showsHorizontalScrollIndicator={false}
                            data={item?.data}
                            keyExtractor={(subItem) => subItem.id.toString()}
                            ListHeaderComponent={() =>
                                <View style={[{ backgroundColor: themeColor12.bgColor(1), justifyContent: 'space-around', flex: 1, alignItems: 'center', paddingHorizontal: 20 }, NewStyles.border10]}>
                                    <Image style={{ width: '100%', flex: 2, resizeMode: 'contain' }} source={{ uri: `${mainUri}${item?.image}` }} />
                                    <View style={[NewStyles.center, { flex: 1 }]}>
                                        {/* <Text style={NewStyles.text4}>گالری {item?.name}</Text> */}
                                        <Pressable style={[NewStyles.row, NewStyles.border100]} onPress={() => { navigation.navigate('Seller', { sellerId: item?.id, name: item?.name, image: item?.image }) }}>
                                            <Text style={NewStyles.text4}>{t('مشاهده همه')}</Text>
                                            <Ionicons name="chevron-back" size={15} color={themeColor4.bgColor(1)} />
                                        </Pressable>
                                    </View>
                                </View>
                            }
                            renderItem={({ item: subItem }) => <GemItem item={subItem} navigation={navigation} />}
                            ListFooterComponent={() =>
                                <Pressable style={[{ backgroundColor: themeColor12.bgColor(1), justifyContent: 'space-around', flex: 1, alignItems: 'center', paddingHorizontal: 20 }, NewStyles.border10]} onPress={() => { navigation.navigate('Seller', { sellerId: item?.id, name: item?.name, image: item?.image }) }}>
                                    <Text style={NewStyles.text4}>{t('مشاهده همه')}</Text>
                                    <Ionicons name="arrow-back-circle-outline" size={24} color={themeColor4.bgColor(4)} />
                                </Pressable>
                            }
                        />
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    sectionListContainer: {
        paddingTop: 70,
        gap: 20,
    },
    flatListContainer: {
        gap: 5,
        paddingHorizontal: '5%',
    },
    searchBar: {
        height: 40,
        backgroundColor: themeColor4.bgColor(1),
        marginHorizontal: '5%',
        paddingHorizontal: '5%',
        gap: 5
    },
})