import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchInformation = createAsyncThunk("information/fetchInformation", async () => {
  return await axios
    .get(`${uri}/cart-wallet-information/`)
    .then((response) => response?.data)
    .catch((error) => { console.log(error?.response?.data, '6') });
});

const informationSlice = createSlice({
  name: "info",
  initialState: {
    loading: false,
    data: null,
    error: "",
  },
  extraReducers: (builder) => {
    builder.addCase(fetchInformation.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchInformation.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = "";
    });
    builder.addCase(fetchInformation.rejected, (state, action) => {
      state.loading = false;
      state.data = null;
      state.error = action.error.message;
    });
  },
});


export default informationSlice.reducer;
