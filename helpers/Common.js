import { Dimensions, Platform, ToastAndroid } from "react-native";
import Constants from "expo-constants";
var jalaali = require('jalaali-js');

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

export const appName = () => {
    return Constants?.expoConfig?.name;
}

export const appVersion = () => {
    return Constants?.expoConfig?.version;
}
export const validateEmail = (email) => {


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'فرمت ایمیل صحیح نیست' };
    }

    return { isValid: true, message: '' };
};
export const handleError = (error, t) => {
    try {
        if (error?.response?.status == 409 || error?.response?.status == 400) {
            if (error?.response?.message) {
                showToastOrAlert(`${t(error?.response?.message)}`);
            } else if (error?.response?.data?.message) {
                showToastOrAlert(`${t(error?.response?.data?.message)}`);
            } else {
                showToastOrAlert("خطایی رخ داد");
            }
        } else if (error?.response?.status == 401) {
            showToastOrAlert(`${t("Unauthorized access!")}`);
        } else {
            showToastOrAlert(`${t("An unexpected error occurred!")}`);
        }
    } catch (e) {
        showToastOrAlert(`${t("Network error!")}`);
    }
};

export const getColumnsCount = () => {
    if (deviceWidth >= 1024) {
        //desktop
        return 4;
    } else if (deviceWidth >= 768) {
        //tablet
        return 3;
    } else {
        //phone
        return 2;
    }
}

export const getImageSize = (height, width) => {
    if (height > width) {
        //portrait
        return 300;
    } else if (height < width) {
        //landscape
        return 250;
    } else {
        //square
        return 200;
    }
}

export const generateUniqueCode = () => {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 10000); // عدد تصادفی بین 0 تا 9999
    const uniqueCode = timestamp + randomPart;
    return uniqueCode.toString().slice(-10); // 10 رقم آخر را برمی‌گرداند
}

// Helper function to calculate contrast ratio
export const calculateContrastRatio = (bgColor, textColor) => {
    // Convert hex colors to RGB values
    const bgRgb = hexToRgb(bgColor);
    const textRgb = hexToRgb(textColor);
    // Calculate luminance for background and text
    const bgLum = (0.2126 * bgRgb.r + 0.7152 * bgRgb.g + 0.0722 * bgRgb.b) / 255;
    const textLum = (0.2126 * textRgb.r + 0.7152 * textRgb.g + 0.0722 * textRgb.b) / 255;
    // Calculate contrast ratio
    const contrastRatio = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);
    return contrastRatio;
}

// Helper function to convert hex color to RGB
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        g: parseInt(result[3], 16)
    } : null;
}

export const cleanText = (text) => text?.replace(/(<([^>]+)>)/gi, "")?.replace(/\&nbsp;/g, '')?.replace(/\&ldquo;/g, '')?.replace(/\&rdquo;/g, '')?.replace(/\&hellip;/g, '')?.replace(/\&zwnj;/g, '‌')?.replace(/\&raquo;/g, '')?.replace(/\&laquo;/g, '')?.replace(/\&quot;/g, '');

export const showToastOrAlert = (message) => {
    Platform.OS === 'android' ? ToastAndroid.show(message, ToastAndroid.SHORT) : alert(message);
};

export const formatPrice = (text) => text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const { jy, jm, jd } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());

    // گرفتن ساعت و دقیقه
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${jy}/${jm}/${jd} - ${hours}:${minutes}`;
};

export const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export function toLocal(phone) {
    if (!phone) return null;

    phone = phone.replace(/[\s()-]/g, '');

    if (phone.startsWith('+98')) {
        return '0' + phone.slice(3);
    } else if (phone.startsWith('0098')) {
        return '0' + phone.slice(4);
    } else if (phone.startsWith('9') && phone.length === 10) {
        return '0' + phone;
    } else if (phone.startsWith('0')) {
        return phone;
    } else {
        return null;
    }
}
export const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  // برای اضافه کردن صفر جلو
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};