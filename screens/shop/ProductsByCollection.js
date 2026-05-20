import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles from '../../styles/NewStyles'
import axios from 'axios'
import { uri } from '../../services/URL'
import { useTranslation } from 'react-i18next'
import { handleError } from '../../helpers/Common'
import Loader from '../../components/Loader'
import ProductItem from '../../components/ProductItem'
import ProductItem2 from '../../components/ProductItem2'
import { RefreshControl } from 'react-native'

const ProductsByCollection = ({ route, navigation }) => {
    const params = route?.params;
    const { t } = useTranslation();
    const [loader, setLoader] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [data, setData] = useState([])
    const fetchProducts = () => {
        axios.post(`${uri}/collections/products/`, { collectionId: params?.id })
            .then((res) => { 
                setData(res?.data)
            })
            .catch((err)=>{
                handleError(err, t)
            })
            .finally(()=>{
                setLoader(false)
                setRefreshing(false)
            })
    }
    useEffect(()=>{
        fetchProducts()
    },[])
    if(loader){
        return(
            <Loader/>
        )
    }
    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <FlatList
            data={data}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{
                setRefreshing(true);
                fetchProducts()
            }} />}
            renderItem={({item})=>{
                return(
                    <ProductItem2 item={item} navigation={navigation}/>
                )
            }}
            />
        </SafeAreaView>
    )
}

export default ProductsByCollection

const styles = StyleSheet.create({})