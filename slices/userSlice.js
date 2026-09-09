import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (token, { rejectWithValue }) => {
    if (!token) {
      return rejectWithValue("توکن دسترسی موجود نیست");
    }

    try {
      const response = await axios.get(`${uri}/fetch-user/`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      if (!response?.data) {
        return rejectWithValue("پاسخ اطلاعات کاربر نامعتبر است");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.message ||
        "خطا در دریافت اطلاعات کاربر"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    data: null,
    error: "",
    currentRequestId: null,
    lastUpdatedAt: null,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUser.pending, (state, action) => {
      state.loading = true;
      state.error = "";
      // آخرین درخواست، تنها درخواستی است که اجازه دارد state مالی را تغییر دهد.
      state.currentRequestId = action.meta.requestId;
    });
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      if (state.currentRequestId !== action.meta.requestId) return;

      state.loading = false;
      state.currentRequestId = null;
      // هیچ‌وقت داده معتبر قبلی را با undefined/null جایگزین نکن.
      if (action.payload) {
        state.data = action.payload;
        state.lastUpdatedAt = Date.now();
      }
      state.error = "";
    });
    builder.addCase(fetchUser.rejected, (state, action) => {
      if (state.currentRequestId !== action.meta.requestId) return;

      state.loading = false;
      state.currentRequestId = null;
      // روی خطای موقت شبکه، آخرین snapshot معتبر کاربر حفظ می‌شود.
      state.error = action.payload || action.error.message || "خطا در دریافت اطلاعات کاربر";
    });
  },
  reducers: {
    emptyUser: (state) => {
      state.loading = false;
      state.data = null;
      state.error = "";
      state.currentRequestId = null;
      state.lastUpdatedAt = null;
    },
  },
});

export const { emptyUser } = userSlice.actions;

export default userSlice.reducer;
