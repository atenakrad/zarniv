import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchToken = createAsyncThunk("user/fetchToken", async (token) => {
  return await axios
    .get(`${uri}/token/refresh/`, { headers: { "Content-Type": "application/json", Authorization: "Bearer " + token, }, })
    .then((response) => response?.data)
    .catch((error) => { console.log(error, "2"); });
});

const tokenSlice = createSlice({
  name: "token",
  initialState: {
    loading: false,
    accessToken: null,
    refreshToken: null,
    error: "",
  },
  extraReducers: (builder) => {
    builder.addCase(fetchToken.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchToken.fulfilled, (state, action) => {
      state.loading = false;
      state.accessToken = action.payload?.accessToken;
      state.refreshToken = action.payload?.refreshToken;
      state.error = "";
    });
    builder.addCase(fetchToken.rejected, (state, action) => {
      state.loading = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = action.error.message;
    });
  },
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    removeToken: (state, action) => {
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { setAccessToken, setRefreshToken, removeToken } = tokenSlice.actions;

export default tokenSlice.reducer;
