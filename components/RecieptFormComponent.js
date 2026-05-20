import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import NewStyles from '../styles/NewStyles'
import { themeColor0, themeColor12, themeColor3 } from '../theme/Color'
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import TransparentButton from './TransparentButton';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { uri } from '../services/URL';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { handleError, showToastOrAlert } from '../helpers/Common';
import { useTranslation } from 'react-i18next';

const RecieptFormComponent = ({ title, request_type, order_id, transaction_id, physical_delivery_request_id }) => {
    const navigation = useNavigation()
    const [priceReciep, setPriceReciep] = useState('')
    const [description, setDescription] = useState('')
    const [reciepCover, setReciepCover] = useState({
        uri: '', name: '', type: ''
    })
    const [loadingReciep, setLoadingReciep] = useState(false)
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const { t } = useTranslation()
    const pickReciepFile = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });
        if (result.canceled) {
            return;
        }
        let localUri = result.assets[0].uri;
        let filename = localUri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        setReciepCover({
            uri: localUri,
            name: filename,
            type: type
        })
    }

    const submitReciep = () => {
        setLoadingReciep(true)
        const formData = new FormData();
        formData.append('amount', priceReciep);
        formData.append('description', description);
        formData.append('request_type', request_type);

        if (order_id) {
            formData.append('order', order_id);
        }
        if (physical_delivery_request_id) {
            formData.append('physical_delivery_request', physical_delivery_request_id);
        } 
        formData.append('receipt', {
            uri: reciepCover.uri,
            name: reciepCover.name,
            type: reciepCover.type,
        });
        axios.post(`${uri}/manual-payment-request/`, formData, { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data' } })
            .then((res) => {
                console.log(res?.data);
                showToastOrAlert(res?.data?.message)
                setPriceReciep('')
                setReciepCover({
                    uri: '', name: '', type: ''
                })
                setDescription('')
            })
            .catch(err => {
                handleError(err, t)
                console.log(err?.response?.data);
            })
            .finally(() => {
                setLoadingReciep(false)
            })
    }
    return (
        <View style={[{ backgroundColor: themeColor12.bgColor(1), padding: 10, gap: 10 }, NewStyles.border5]}>
            <Text style={NewStyles.title10}>{title}</Text>
            <View style={{ gap: 5 }}>
                <Text style={NewStyles.text10}>مبلغ واریزی به تومان<Text style={NewStyles.title6}>*</Text></Text>
                <TextInput
                    style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10,]}
                    placeholder='مبلغ واریزی'
                    keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'}
                    placeholderTextColor={themeColor3.bgColor(1)}
                    value={priceReciep?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    onChangeText={(p) => {
                        setPriceReciep(p?.replace(/,/g, ""))
                    }}
                />
            </View>
            <View style={{ gap: 5 }}>
                <Text style={NewStyles.text10}>توضیحات</Text>
                <TextInput
                    style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { height: 100 }]}
                    verticalAlign='top'
                    textAlignVertical='top'
                    placeholder='توضیحات'
                    maxLength={255}
                    placeholderTextColor={themeColor3.bgColor(1)}
                    value={description}
                    onChangeText={(p) => {
                        setDescription(p)
                    }}
                    multiline={true}
                />
            </View>
            <View style={{ gap: 5 }}>
                <Text style={NewStyles.text10}>تصویر فیش<Text style={NewStyles.title6}>*</Text></Text>

                <TouchableOpacity style={[{ borderWidth: 1, borderColor: themeColor0.bgColor(1), height: 40, gap: 10, }, NewStyles.row, NewStyles.border10, NewStyles.center]} onPress={pickReciepFile}>
                    <Ionicons name={reciepCover?.uri ? 'checkmark-circle' : 'cloud-upload'} size={20} color={themeColor0.bgColor(1)} />
                    {<Text style={NewStyles.title}>{reciepCover?.uri ? 'فیش بارگذاری شد' : 'بارگذاری فیش'}</Text>}
                </TouchableOpacity>
            </View>
            <Button
                title={'ثبت فیش'}
                style={{ marginVertical: 0 }}
                onPress={() => {
                    // if (!priceReciep) {

                    // }
                    if(!priceReciep){
                        showToastOrAlert('وارد کردن مبلغ الزامی است')
                        return
                    }else if(!reciepCover?.uri){
                        showToastOrAlert('بارگذاری تصویر فیش الزامی است.')
                        return
                    }
                    submitReciep()
                }}
                loading={loadingReciep}

            />
            <TransparentButton
                title={'مشاهده تاریخچه'}
                style={{ marginVertical: 0 }}
                onPress={() => {
                    navigation.navigate('RecieptLists')
                }}
            />
        </View>
    )
}

export default RecieptFormComponent

const styles = StyleSheet.create({})