import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSiteBankAccount } from '../slices/siteBankSlice'
import { themeColor0, themeColor12 } from '../theme/Color'
import NewStyles from '../styles/NewStyles'

const BankInfoComponent = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(fetchSiteBankAccount())
    }, [])
    const siteBank = useSelector(state => state.siteBank?.data) 

    return (
        <View style={[{backgroundColor: themeColor12.bgColor(1), padding: 10, gap: 10, }, NewStyles.border10]}>
             <Text style={NewStyles.title10}>{siteBank?.title}</Text>
             <View style={NewStyles.row}>
                <Text style={NewStyles.title10}>بانک: </Text>
                <Text style={NewStyles.text10}>{siteBank?.bank_name}</Text>
             </View>
             <View style={NewStyles.row}>
                <Text style={NewStyles.title10}>صاحب حساب: </Text>
                <Text style={NewStyles.text10}>{siteBank?.owner_name}</Text>
             </View>
             <View style={NewStyles.row}>
                <Text style={NewStyles.title10}>شماره کارت: </Text>
                <Text style={NewStyles.text10}>{siteBank?.card_number}</Text>
             </View>
             <View style={NewStyles.row}>
                <Text style={NewStyles.title10}>شماره حساب: </Text>
                <Text style={NewStyles.text10}>{siteBank?.bank_account_number}</Text>
             </View>
             <View style={NewStyles.row}>
                <Text style={NewStyles.title10}>شبا: </Text>
                <Text style={NewStyles.text10}>{siteBank?.iban}</Text>
             </View>
        </View>
    )
}

export default BankInfoComponent

const styles = StyleSheet.create({})