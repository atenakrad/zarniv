import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchSilverInfoPrice = createAsyncThunk(
    "silverInfo/fetchSilverInfoPrice",
    async ({ params }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${uri}/silver/calc/`, {
                params,
                timeout: 10000,
            });
            if (!response?.data) {
                return rejectWithValue("پاسخ محاسبه نقره نامعتبر است");
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "خطا در دریافت اطلاعات نقره"
            );
        }
    }
);

const silverInfoSlice = createSlice({
    name: "silverInfo",
    initialState: {
        loading: false,
        data: null,
        error: "",
        currentRequestId: null,
        lastUpdatedAt: null,
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSilverInfoPrice.pending, (state, action) => {
            const isBaseSnapshotRequest = !action.meta.arg?.params;
            if (!isBaseSnapshotRequest) return;

            state.loading = true;
            state.error = "";
            state.currentRequestId = action.meta.requestId;
        });
        builder.addCase(fetchSilverInfoPrice.fulfilled, (state, action) => {
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
        builder.addCase(fetchSilverInfoPrice.rejected, (state, action) => {
            const isBaseSnapshotRequest = !action.meta.arg?.params;
            if (!isBaseSnapshotRequest) return;
            if (state.currentRequestId !== action.meta.requestId) return;

            state.loading = false;
            state.currentRequestId = null;
            // روی خطای transient، آخرین قیمت معتبر حفظ می‌شود.
            state.error = action.payload || action.error.message || "خطا در دریافت اطلاعات نقره";
        });
    },
});

export default silverInfoSlice.reducer;
