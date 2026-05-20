import { KeyboardAvoidingView, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Image, ImageBackground } from 'expo-image';

import { mainUri, uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import NewStyles, { deviceHeight } from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor12, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import { showToastOrAlert, validateEmail } from '../../helpers/Common';

export default function Profile() {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector(state => state?.token?.accessToken);
    const user = useSelector(state => state.user?.data);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [email, setEmail] = useState(user?.email || '');

    const upload = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });
        if (result.canceled) {
            return;
        }
        let formData = new FormData();
        let localUri = result.assets[0].uri;
        let filename = localUri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        formData.append('image', { uri: localUri, name: filename, type });
        setLoading(true)
        await axios
            .post(`${uri}/upload/`, formData, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data' }, })
            .then(response => {
                const message = t('Your changes have been applied.');
                showToastOrAlert(message);
                dispatch(fetchUser(accessToken));
            })
            .catch(error => {
                const message = error.response
                    ? error.response.status === 401
                        ? t('Unauthorized access!')
                        : t('An unexpected error occurred!')
                    : t('Network error!');
                showToastOrAlert(message);
            }).finally(h => {
                dispatch(fetchUser(accessToken));
                setLoading(false);
                setRefreshing(false);
            })
    }

    const removeProfilePhotoPath = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(`${uri}/remove/`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status === 200) {
                const message = t('Your changes have been applied.')
                showToastOrAlert(message);
                dispatch(fetchUser(accessToken));
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const changeInformation = async () => {
        if(email && !validateEmail(email)?.isValid){
            showToastOrAlert('ایمیل وارد شده نامعتبر است.')
            return
        }
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/profile/edit/`, { firstName: firstName, lastName: lastName, email:email }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status === 200) {
                const message = t('Your changes have been applied.')
                showToastOrAlert(message);
            }
        } catch (error) {
            const message = error.response
                ? error.response.status === 401
                    ? t('Unauthorized access!')
                    : t('An unexpected error occurred!')
                : t('Network error!');
            showToastOrAlert(message);
        } finally {
            dispatch(fetchUser(accessToken));
            setLoading(false);
            setRefreshing(false);
        }
    }

    return (
        <View style={NewStyles.container}>
            <CustomStatusBar />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>

                <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { dispatch(fetchUser(accessToken)) }} />}>
                    <ImageBackground style={[styles.imageBackground, NewStyles.center]} blurRadius={5} contentFit="cover" transition={1000}>
                        <Pressable onPress={() => { upload() }}>
                            {user?.image ? (<Image style={[styles.profileImage, NewStyles.border100]} source={{ uri: `${mainUri}${user?.image}` }} contentFit="cover" transition={1000} />) : (<View style={[styles.profileImage, NewStyles.border100, NewStyles.center]}><Text style={[styles.profileImageThumbnail]}>{(user?.first_name || user?.last_name) ? `${user?.first_name?.[0]} ${user?.last_name?.[0]}` : 'کاربر زرنیو'}</Text></View>)}
                            {user?.image && <Pressable style={{ position: 'absolute' }} onPress={() => { removeProfilePhotoPath() }}>
                                <Ionicons name="close-circle-sharp" size={30} color={themeColor0.bgColor(1)} />
                            </Pressable>}
                            {!user?.image && <View style={{ position: 'absolute' }}>
                                <Ionicons name="add-circle" size={30} color={themeColor0.bgColor(1)} />
                            </View>}
                        </Pressable>
                    </ImageBackground>
                    <View style={styles.wrapper}>
                        <Text style={NewStyles.text10}>{t('You have entered with mobile number {{phone}}.', { phone: user?.phone_number })}</Text>
                        <Text style={NewStyles.text10}>{t('نام خود را وارد کنید.')}</Text>
                        <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border5]} keyboardType='default' placeholderTextColor={themeColor10.bgColor(0.5)} placeholder={`${t('First Name')}`} value={firstName} onChangeText={(text) => setFirstName(text)} />
                        <Text style={NewStyles.text10}>{t('نام خانوادگی خود را وارد کنید.')}</Text>
                        <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border5]} keyboardType='default' placeholderTextColor={themeColor10.bgColor(0.5)} placeholder={`${t('Last Name')}`} value={lastName} onChangeText={(text) => setLastName(text)} />
                        <Text style={NewStyles.text10}>{t('Please enter your Email Address.')}</Text>
                        <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border5]} keyboardType='default' placeholderTextColor={themeColor10.bgColor(0.5)} placeholder={`${t('Email Address')}`} value={email} onChangeText={(text) => setEmail(text)} />
                        {/*
                    <Text style={NewStyles.text10}>{t('Please select your Date Of Birth.')}</Text>
                    <Pressable style={[NewStyles.textInput, NewStyles.text10, NewStyles.border5, { justifyContent: 'center' }]} onPress={() => setDatePickerModal(true)}>
                        <Text style={NewStyles.text10}>{birthDate ? birthDate : t('Date Of Birth')}</Text>
                    </Pressable> */}
                        <Button title={`${t('Change Information')}`} loading={loading} onPress={() => { changeInformation() }} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    imageBackground: {
        width: '100%',
        height: deviceHeight * 0.25,
        backgroundColor: themeColor3.bgColor(0.2)
    },
    profileImage: {
        height: 100,
        width: 100,
        backgroundColor: themeColor12.bgColor(1),
    },
    profileImageThumbnail: {
        fontFamily: 'VazirBold',
        textAlign: 'center',
        textAlignVertical: 'center',
        color: themeColor0.bgColor(1),
    },
    wrapper: {
        paddingHorizontal: '5%',
        gap: 10,
        paddingVertical: 20
    }
})