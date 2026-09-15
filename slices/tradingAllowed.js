import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchTradingAllowed = createAsyncThunk(
    "tradingAllowed/fetchTradingAllowed",
    async (_, { getState, rejectWithValue }) => {
        try {
            const accessToken = getState()?.token?.accessToken;
            const response = await axios.get(`${uri}/traiding-allowed/`, {
                headers: {
                    Accept: "application/json",
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                timeout: 10000,
            });

            if (typeof response?.data?.allowed !== "boolean") {
                return rejectWithValue("پاسخ وضعیت معاملات نامعتبر است");
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "خطا در دریافت وضعیت معاملات"
            );
        }
    }
);

const tradingAllowedSlice = createSlice({
    name: "trading",
    initialState: {
        loading: false,
        data: null,
        error: "",
        currentRequestId: null,
        lastUpdatedAt: null,
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTradingAllowed.pending, (state, action) => {
            state.loading = true;
            state.error = "";
            state.currentRequestId = action.meta.requestId;
        });
        builder.addCase(fetchTradingAllowed.fulfilled, (state, action) => {
            if (state.currentRequestId !== action.meta.requestId) return;

            state.loading = false;
            state.currentRequestId = null;
            state.data = action.payload;
            state.error = "";
            state.lastUpdatedAt = Date.now();
        });
        builder.addCase(fetchTradingAllowed.rejected, (state, action) => {
            if (state.currentRequestId !== action.meta.requestId) return;

            state.loading = false;
            state.currentRequestId = null;
            // داده قبلی را null نمی‌کنیم؛ خطای شبکه نباید UI را به «بازار بسته» تبدیل کند.
            state.error = action.payload || action.error.message || "خطا در دریافت وضعیت معاملات";
        });
    },
});

export default tradingAllowedSlice.reducer;
