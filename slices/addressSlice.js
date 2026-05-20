import { createSlice } from '@reduxjs/toolkit'

export const addressSlice = createSlice({
    name: 'address',
    initialState: {
        full_name: null,
        phone: '',
        address: null,
        city: null,
        postalcode: null,
        number: null,
        unit: null,
        description: null,
        package: null,
        package_price: null,
        shippingMethods: {},
    },
    reducers: {
        setFullName: (state, action) => {
            state.full_name = action.payload;
        },
        setPhone: (state, action) => {
            state.phone = action.payload;
        },
        setAddress: (state, action) => {
            state.address = action.payload;
        },
        setCity: (state, action) => {
            state.city = action.payload;
        },
        setPostalcode: (state, action) => {
            state.postalcode = action.payload;
        },
        setNumber: (state, action) => {
            state.number = action.payload;
        },
        setUnit: (state, action) => {
            state.unit = action.payload;
        },
        setDescription: (state, action) => {
            state.description = action.payload;
        },
        setShippingMethod: (state, action) => {
            const { seller_id, send_method_id, price } = action.payload;
            const key = String(seller_id);
            if (state.shippingMethods[key]?.methodId == send_method_id) {
                delete state.shippingMethods[key];
            } else {
                state.shippingMethods[key] = { methodId: send_method_id, price: Number(price) || 0, type: 'post' };
            }
        },
        // جایگزینی کامل مپ روش‌های ارسال (استفاده برای همگام‌سازی بعد از حذف فروشنده از سبد)
        setShippingMethods: (state, action) => {
            state.shippingMethods = action.payload || {};
        },
        setPackage: (state, action) => {
            state.package = action.payload;
        },
        setPackagePrice: (state, action) => {
            state.package_price = action.payload;
        },
        emptyAddress: (state) => {
            state.full_name = null,
                state.phone = null,
                state.address = null,
                state.city = null,
                state.postalcode = null,
                state.number = null,
                state.unit = null,
                state.description = null,
                state.package = null,
                state.package_price = null,
                state.shippingMethods = {}
        }
    },
})

export const {
    setFullName,
    setPhone,
    setAddress,
    setCity,
    setPostalcode,
    setNumber,
    setUnit,
    setDescription,
    setShippingMethod,
    setShippingMethods,
    emptyAddress,
    setPackage,
    setPackagePrice
} = addressSlice.actions;

export default addressSlice.reducer;