import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { uri } from '../services/URL';

export const fetchCart = createAsyncThunk('items/fetchCart', async (token) => {
    return await axios
        .get(`${uri}/fetchCart/`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
        .then(response => response?.data)
        .catch(error => { console.log(error?.response?.data, '5'); })
})

export const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        loading: false,
        items: [],
        error: '',
        totalPrice: 0,
        totalDiscountedPrice: 0,
        shippingPostPrice: 0,
    },
    extraReducers: builder => {
        builder.addCase(fetchCart.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchCart.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload?.cart
            state.totalPrice = action.payload?.total_price
            state.totalDiscountedPrice = action.payload?.total_discounted_price
            state.shippingPostPrice = action.payload?.shippingPost?.price
            state.error = ''
        })
        builder.addCase(fetchCart.rejected, (state, action) => {
            state.loading = false
            state.items = []
            state.error = action.error.message
            state.totalPrice = 0
            state.totalDiscountedPrice = 0
            state.shippingPostPrice = 0
        })
    },
    reducers: {
        emptyCart: (state, action) => {
            state.loading = false
            state.items = []
            state.error = ''
            state.totalPrice = 0
            state.totalDiscountedPrice = 0
            state.shippingPostPrice = 0
        },
    }
})

export const { emptyCart } = cartSlice.actions;

export const selectCartItemById = (state, sellerId, productVarietyId) => state.cart?.items?.find(item => item?.product_variety_id == productVarietyId);
export const selectGemCartItemById = (state, sellerId, SilverVarietyId) => state.cart?.items?.find(item => item?.silver_variety_id == SilverVarietyId);

export default cartSlice.reducer;