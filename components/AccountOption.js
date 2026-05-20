import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { themeColor0, themeColor1, themeColor4 } from '../theme/Color'
import NewStyles from '../styles/NewStyles'
import { Ionicons } from '@expo/vector-icons';

const AccountOption = ({ title, onPress, iconName }) => {
    return (
        <View style={[{ width: '100%', borderColor: themeColor0.bgColor(0.5), borderWidth: StyleSheet.hairlineWidth, padding: 10 },   NewStyles.border10, NewStyles.rowWrapper]}>
            <View style={[NewStyles.row, { gap: 5 }]}>
                <Ionicons name={iconName} size={20} color={themeColor0.bgColor(1)} />
                <Text style={NewStyles.text}>{title}</Text>
            </View>
            <Ionicons
            name={'chevron-back'}
            size={20}
            color={themeColor0.bgColor(1)}
            />
        </View>
    )
}

export default AccountOption

const styles = StyleSheet.create({})