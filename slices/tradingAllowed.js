import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchTradingAllowed = createAsyncThunk(
    "tradingAllowed/fetchTradingAllowed",
    async (_, { getState }) => {
        const accessToken = getState()?.token?.accessToken;
        const headers = {
            Accept: "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        };

        const response = await axios.get(`${uri}/traiding-allowed/`, { headers });
        return response?.data;
    }
);

const tradingAllowedSlice = createSlice({
    name: "trading",
    initialState: {
        loading: false,
        data: null,
        error: "",
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTradingAllowed.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchTradingAllowed.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
            state.error = "";
        });
        builder.addCase(fetchTradingAllowed.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    },
});


export default tradingAllowedSlice.reducer;
