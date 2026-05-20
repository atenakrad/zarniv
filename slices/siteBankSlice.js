import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchSiteBankAccount = createAsyncThunk("shipping/fetchSiteBankAccount", async (token) => {
  return await axios
    .get(`${uri}/site-bank-account/`)
    .then((response) => response?.data)
    .catch((error) => { console.log(error, "fetchSiteBankAccount") });
});

const siteBankSlice = createSlice({
  name: "siteBank",
  initialState: {
    loading: false,
    data: null,
    error: "",
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSiteBankAccount.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSiteBankAccount.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = "";
    });
    builder.addCase(fetchSiteBankAccount.rejected, (state, action) => {
      state.loading = false;
      state.data = null;
      state.error = action.error.message;
    });
  },
  reducers: {
    emptyBank: (state) => {
      state.loading = false;
      state.data = null;
      state.error = "";
    },
  },
});

export const { emptyBank } = siteBankSlice.actions;

export default siteBankSlice.reducer;
