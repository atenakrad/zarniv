import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/userSlice";
import tokenSlice from "./slices/tokenSlice";
import languageSlice from "./slices/languageSlice";
import cartSlice from "./slices/cartSlice";
import rateSlice from "./slices/rateSlice";
import addressSlice from "./slices/addressSlice";
import goldPriceSlice from "./slices/goldPriceSlice";
import shippingSlice from './slices/shippingSlice';
import goldInfoSlice from "./slices/goldInfoSlice";
import silverInfoSlice from "./slices/silverInfoSlice";
import tradingAllowedSlice from "./slices/tradingAllowed";
import lastScreenSlice from "./slices/lastScreenSlice";
import informationSlice from "./slices/informationSlice";
import packagingSlice from './slices/packagingSlice';
import siteBankSlice from './slices/siteBankSlice';

export default configureStore({
  reducer: {
    token: tokenSlice,
    lang: languageSlice,
    user: userSlice,
    cart: cartSlice,
    rate: rateSlice,
    address: addressSlice,
    goldPrice: goldPriceSlice,
    shipping: shippingSlice,
    goldInfo: goldInfoSlice,
    silverInfo: silverInfoSlice,
    trading: tradingAllowedSlice,
    last: lastScreenSlice,
    info: informationSlice,
    packaging: packagingSlice,
    siteBank: siteBankSlice,
  },
});
