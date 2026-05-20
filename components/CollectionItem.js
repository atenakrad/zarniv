import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { mainUri } from '../services/URL'
import NewStyles from '../styles/NewStyles'
import { LinearGradient } from 'expo-linear-gradient'
import { themeColor0, themeColor1, themeColor5 } from '../theme/Color'

const CollectionItem = ({ item }) => {
    const navigation = useNavigation()
    return (
        <Pressable onPress={() => {
            navigation.navigate('ProductsByCollection', { id: item?.id, name: item?.name })
        }}>
            <ImageBackground source={{ uri: `${mainUri}${item?.image}` }} style={{ width: 150, height: 150 }} imageStyle={[NewStyles.border10]}>
                <LinearGradient colors={[themeColor1.bgColor(0), themeColor1.bgColor(0), themeColor5.bgColor(1)]} style={[{ height: '100%', width: '100%', justifyContent: 'flex-end', padding: 10 }, NewStyles.border10]}>
                    <Text style={NewStyles.title1} numberOfLines={1}>{item?.name}</Text>
                </LinearGradient>
            </ImageBackground>
        </Pressable>
    )
}

export default CollectionItem

const styles = StyleSheet.create({})