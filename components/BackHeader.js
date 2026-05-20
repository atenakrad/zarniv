import { Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { themeColor0, themeColor5 } from '../theme/Color'
import NewStyles from '../styles/NewStyles'
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'

const BackHeader = ({ title }) => {
    const navigation = useNavigation()
    return (
        <SafeAreaView style={[{ paddingVertical: 10, backgroundColor: themeColor5.bgColor(1) }, NewStyles.rowWrapper]} edges={{ top: Platform.OS === 'ios' ? 'off' : 'additive', bottom: 'off' }}>
            <Text style={[NewStyles.title, { paddingHorizontal: 20, paddingVertical: 10, flex:1 }]}>{title}</Text>
            <TouchableOpacity style={{ paddingHorizontal: 20, paddingVertical: 10 }} onPress={() => {
                navigation.goBack()
            }}>
                <Ionicons name={'arrow-back'} size={20} color={themeColor0.bgColor(1)} />
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default BackHeader

const styles = StyleSheet.create({})