import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchInfoPrice = createAsyncThunk(
    "goldInfo/fetchInfoPrice",
    async ({ params }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${uri}/gold/calc/`, {
                params,
                timeout: 10000,
            });
            if (!response?.data) {
                return rejectWithValue("پاسخ محاسبه طلا نامعتبر است");
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "خطا در دریافت اطلاعات طلا"
            );
        }
    }
);

const goldInfoSlice = createSlice({
    name: "goldInfo",
    initialState: {
        loading: false,
        data: null,
        error: "",
        currentRequestId: null,
        lastUpdatedAt: null,
    },
    extraReducers: (builder) => {
        builder.addCase(fetchInfoPrice.pending, (state, action) => {
            const isBaseSnapshotRequest = !action.meta.arg?.params;
            if (!isBaseSnapshotRequest) return;

            state.loading = true;
            state.error = "";
            state.currentRequestId = action.meta.requestId;
        });
        builder.addCase(fetchInfoPrice.fulfilled, (state, action) => {
            const isBaseSnapshotRequest = !action.meta.arg?.params;
            // پاسخ‌های محاسبه تایپی برای همان caller برمی‌گردند، اما snapshot عمومی Redux را overwrite نمی‌کنند.
            if (!isBaseSnapshotRequest) return;
            if (state.currentRequestId !== action.meta.requestId) return;

            state.loading = false;
            state.currentRequestId = null;
            state.data = action.payload;
            state.error = "";
            state.lastUpdatedAt = Date.now();
        });
        builder.addCase(fetchInfoPrice.rejected, (state, action) => {
            const isBaseSnapshotRequest = !action.meta.arg?.params;
            if (!isBaseSnapshotRequest) return;
            if (state.currentRequestId !== action.meta.requestId) return;

            state.loading = false;
            state.currentRequestId = null;
            // روی خطای transient، آخرین قیمت معتبر حفظ می‌شود.
            state.error = action.payload || action.error.message || "خطا در دریافت اطلاعات طلا";
        });
    },
});

export default goldInfoSlice.reducer;
