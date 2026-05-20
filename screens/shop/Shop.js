import { View, Image, Text, Pressable, FlatList, StyleSheet, RefreshControl, BackHandler, AppState } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

import { mainUri, uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import NewStyles, { deviceHeight } from '../../styles/NewStyles';
import { themeColor0, themeColor12, themeColor10, themeColor5, themeColor3, themeColor1 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import CustomImageCarousal from '../../components/CustomImageCarousal';
import CategoryItem from '../../components/CategoryItem';
import ProductItem from '../../components/ProductItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import CollectionItem from '../../components/CollectionItem';
import { TouchableOpacity } from 'react-native';
import GemItem from '../../components/GemItem';

export default function Shop({ navigation }) {

    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(true);

    const [DATA, setDATA] = useState([]);
    const [collections, setCollections] = useState([]);
    const [gemProduct, setGemProduct] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const fetchData = async () => {
        try {
            const [response, response1, response2, response3, response4] = await Promise.all([
                axios.get(`${uri}/banners`),
                axios.get(`${uri}/categories/main`),
                axios.get(`${uri}/shop/products/main`),
                axios.get(`${uri}/collections`),
                axios.get(`${uri}/silver/shop/products/latest/?limit=${4}`),
            ]);
            setBanners(response.data);
            setCategories(response1.data);
            if (response2.data) {
                setDATA(response2.data);
            }
            setCollections(response3.data);
            setGemProduct(response4.data);
        } catch (error) {
            handleError(error, t)
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [])

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp(); // یا هر کاری که می‌خوای انجام بدی
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove(); // ✅ درست
        }, [])
    );
    const colors = [
        themeColor5.bgColor(1),
        themeColor5.bgColor(0.9),
        themeColor5.bgColor(0.8),
        themeColor5.bgColor(0.5),
        themeColor5.bgColor(0.2),
        themeColor5.bgColor(0.1),
        themeColor5.bgColor(0),
        themeColor5.bgColor(0.1),
        themeColor5.bgColor(0.2),
        themeColor5.bgColor(0.5),
        themeColor5.bgColor(0.8),
        themeColor5.bgColor(0.9),
        themeColor5.bgColor(1),
    ];

    const player = useVideoPlayer(require('../../assets/videos/video2.mp4'), (videoPlayer) => {
        videoPlayer.loop = true;
        videoPlayer.muted = true;
        videoPlayer.play();
    });

    const controlPlayerSafely = useCallback((action) => {
        try {
            if (!player) return;
            if (action === 'play') {
                player.play();
                return;
            }
            player.pause();
        } catch (error) {
            // Player ممکن است قبلاً release شده باشد
        }
    }, [player]);

    useFocusEffect(
        useCallback(() => {
            controlPlayerSafely('play');

            return () => {
                controlPlayerSafely('pause');
            };
        }, [controlPlayerSafely])
    );

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                controlPlayerSafely('play');
            }
        });

        return () => subscription.remove();
    }, [controlPlayerSafely]);

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <CustomStatusBar />
            <FlatList
                contentContainerStyle={styles.sectionListContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData() }} />}
                data={[{ id: 'collection' }]}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={() =>
                    <View style={{ gap: 10 }}>
                        <Pressable style={[styles.searchBar, NewStyles.row, NewStyles.border100]} onPress={() => navigation.navigate('Search')}>
                            <Ionicons name={'search'} size={20} color={themeColor0.bgColor(1)} />
                            <Text style={NewStyles.text10}>جستجو در<Text style={NewStyles.text}> زیورآلات</Text></Text>
                        </Pressable>
                        <CustomImageCarousal data={banners} />
                        <View>
                            <Text style={[NewStyles.title1, { paddingHorizontal: '5%' }]}>دسته بندی‌ها</Text>
                            <FlatList

                                contentContainerStyle={styles.flatListContainer}
                                showsHorizontalScrollIndicator={false}
                                horizontal inverted
                                data={categories}
                                keyExtractor={(item) => item?.id?.toString()}
                                renderItem={({ item }) => <CategoryItem item={item} navigation={navigation} />}
                            />
                        </View>
                        <View style={styles.mediaBackground}>
                            <VideoView
                                style={styles.mediaBackground}
                                player={player}
                                contentFit="cover"
                                nativeControls={false}
                                fullscreenOptions={{ enable: false }}
                                allowsPictureInPicture={false}
                            />
                            <LinearGradient style={styles.gradientOverlay} colors={colors}>
                                <Text style={[NewStyles.title1, { fontFamily: 'saye', fontSize: 30 }]}>درخششی ماندگار </Text>
                                <Text style={[NewStyles.text1, { fontFamily: 'saye', fontSize: 26 }]}>ظرافتی آشکار، ارزشی ماندگار </Text>
                            </LinearGradient>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <>
                        <View>
                            <View style={NewStyles.rowWrapper}>
                                <Text style={[NewStyles.title1, { paddingHorizontal: '5%' }]}>جدیدترین محصولات زرنیو</Text>
                                <TouchableOpacity style={{ padding: 10 }} onPress={() => {
                                    navigation.navigate('Products')
                                }}>
                                    <Text style={NewStyles.text1}>مشاهده همه</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={DATA}
                                showsHorizontalScrollIndicator={false}
                                horizontal
                                inverted
                                contentContainerStyle={{ gap: 10, paddingHorizontal: '5%', paddingVertical: 15 }}
                                keyExtractor={(item) => item?.id?.toString()}
                                renderItem={({ item }) => {
                                    return (
                                        <ProductItem item={item} navigation={navigation} />
                                    )
                                }}
                            />
                        </View>
                        <View>
                            <View style={NewStyles.rowWrapper}>
                                <Text style={[NewStyles.title1, { paddingHorizontal: '5%' }]}>محصولات نقره زرنیو</Text>
                                <TouchableOpacity style={{ padding: 10 }} onPress={() => {
                                    navigation.navigate('Gems')
                                }}>
                                    <Text style={NewStyles.text1}>مشاهده همه</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={gemProduct}
                                showsHorizontalScrollIndicator={false}
                                horizontal
                                inverted
                                contentContainerStyle={{ gap: 10, paddingHorizontal: '5%', paddingVertical: 15 }}
                                keyExtractor={(item) => item?.id?.toString()}
                                renderItem={({ item }) => {
                                    return (
                                        <GemItem item={item} navigation={navigation} />
                                    )
                                }}
                            />
                        </View>
                        <View style={{ gap: 10 }}>
                            <Text style={[NewStyles.title1, { paddingHorizontal: '5%' }]}>کالکشن‌ها</Text>
                            <FlatList
                                horizontal
                                inverted
                                showsHorizontalScrollIndicator={false}
                                data={collections}
                                keyExtractor={(item) => item?.id?.toString()}
                                contentContainerStyle={{ gap: 10, paddingHorizontal: '5%' }}
                                renderItem={({ item }) => {
                                    return (
                                        <CollectionItem item={item} />
                                    )
                                }}
                            />
                        </View>

                    </>
                )}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    sectionListContainer: {
        gap: 20,
        paddingBottom: 70
    },
    flatListContainer: {
        gap: 1,
        paddingHorizontal: '5%',
        paddingVertical: 20
    },
    searchBar: {
        height: 40,
        backgroundColor: themeColor3.bgColor(0.2),
        marginHorizontal: '5%',
        paddingHorizontal: '5%',
        gap: 5
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        padding: '5%',
        gap: 10,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    mediaBackground: {
        width: '100%',
        height: deviceHeight * 0.5,
        backgroundColor: themeColor5.bgColor(1)
    },
})
