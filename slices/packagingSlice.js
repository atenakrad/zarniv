import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchPackaging = createAsyncThunk("packaging/fetchPackaging", async (token) => {
  return await axios
    .get(`${uri}/packaging-option/`)
    .then((response) => response?.data)
    .catch((error) => { console.log(error, "fetchPackaging") });
});

const packagingSlice = createSlice({
  name: "packaging",
  initialState: {
    loading: false,
    data: null,
    error: "",
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPackaging.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchPackaging.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = "";
    });
    builder.addCase(fetchPackaging.rejected, (state, action) => {
      state.loading = false;
      state.data = null;
      state.error = action.error.message;
    });
  },
  reducers: {
    emptypackaging: (state) => {
      state.loading = false;
      state.data = null;
      state.error = "";
    },
  },
});

export const { emptypackaging } = packagingSlice.actions;

export default packagingSlice.reducer;
