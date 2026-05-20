import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchRate = createAsyncThunk("rate/fetchRate", async () => {
  return await axios
    .get(`${uri}/rates/new/`)
    .then((response) => response?.data)
    .catch((error) => { console.log(error, '3'); });
});

const rateSlice = createSlice({
  name: "rate",
  initialState: {
    loading: false,
    data: null,
    error: "",
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRate.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRate.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action?.payload;
      // state.data = [
      //   action.payload?.find(item => item?.slug == 'sekkeh'),
      //   action.payload?.find(item => item?.slug == 'bahar'),
      //   action.payload?.find(item => item?.slug == 'nim'),
      //   action.payload?.find(item => item?.slug == 'rob'),
      //   action.payload?.find(item => item?.slug == 'abshodeh'),
      //   action.payload?.find(item => item?.slug == '18ayar'),
      //   action.payload?.find(item => item?.slug == 'gerami'),
      //   action.payload?.find(item => item?.slug == 'usd'),
      //   action.payload?.find(item => item?.slug == 'eur'),
      //   action.payload?.find(item => item?.slug == 'rub'),
      //   action.payload?.find(item => item?.slug == 'try'),
      //   action.payload?.find(item => item?.slug == 'usdt'),
      //   action.payload?.find(item => item?.slug == 'btc'),
      // ]
      state.error = "";
    });
    builder.addCase(fetchRate.rejected, (state, action) => {
      state.loading = false;
      state.data = null;
      state.error = action.error.message;
    });
  },
});

export default rateSlice.reducer;