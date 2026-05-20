import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor4 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePassword() {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken)
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const validatePassword = () => {
        const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
        if (password.match(pattern)) {
            return true;
        } else {
            return false;
        }
    };

    const changePassword = async () => {
        if (password !== passwordConfirmation) {
            const message = t('Password and password confirmation do not match.');
            showToastOrAlert(message);
            return;
        }
        if (!validatePassword()) {
            const message = t('Password is not Valid.');
            showToastOrAlert(message);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/change/password/`, { password, passwordConfirmation }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status == 200) {
                const message = t('Your changes have been applied.');
                showToastOrAlert(message);
                dispatch(fetchUser(accessToken));
                setPassword('')
                setPasswordConfirmation('')
            }
        } catch (error) {
            handleError(error);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }

    return (
        <SafeAreaView edges={{top:'off', bottom:'additive'}} style={NewStyles.container}>
            <CustomStatusBar />
            <ScrollView contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor1.bgColor(1)} refreshing={refreshing} onRefresh={() => { dispatch(fetchUser(accessToken)); }} />}>
                <Text style={NewStyles.text1}>{t('8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.')}</Text>
                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} secureTextEntry={true} keyboardType='default' placeholderTextColor={themeColor10.bgColor(1)} placeholder={t('Password')} value={password} onChangeText={setPassword} />
                <Text style={NewStyles.text1}>{t('Enter Password Confirmation.')}</Text>
                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} secureTextEntry={true} keyboardType='default' placeholderTextColor={themeColor10.bgColor(1)} placeholder={t('Password Confirmation')} value={passwordConfirmation} onChangeText={setPasswordConfirmation} />
                <Button title={t('Change Password')} loading={loading} onPress={changePassword} />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        padding: '5%',
        gap: 5,
    }
})