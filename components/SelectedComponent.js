import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { themeColor0 } from '../theme/Color'
import NewStyles from '../styles/NewStyles'

const SelectedComponent = ({ selected = false }) => {
    return (
        <View style={[{ height: 25, width: 25, borderWidth: 2, borderColor: themeColor0.bgColor(1) }, NewStyles.border100, NewStyles.center]}>
            {selected && <View style={[{ backgroundColor: themeColor0.bgColor(1), width: 15, height: 15 }, NewStyles.border100]} />}
        </View>
    )
}

export default SelectedComponent

const styles = StyleSheet.create({})