import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchGoldPrice = createAsyncThunk("goldPrice/fetchGoldPrice", async (token) => {
  return await axios
    .get(`${uri}/gold/price/`)
    .then((response) => response?.data)
    .catch((error) => { console.log(error?.response?.data, '4') });
});

const goldPriceSlice = createSlice({
  name: "goldPrice",
  initialState: {
    loading: false,
    data: null,
    error: "",
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGoldPrice.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchGoldPrice.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = "";
    });
    builder.addCase(fetchGoldPrice.rejected, (state, action) => {
      state.loading = false;
      state.data = null;
      state.error = action.error.message;
    });
  },
});


export default goldPriceSlice.reducer;
