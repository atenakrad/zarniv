import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchTradingAllowed = createAsyncThunk("tradingAllowed/fetchTradingAllowed", async () => {
    
    
    return await axios
        .get(`${uri}/traiding-allowed/`)
        .then((response) => response?.data)
        .catch((error) => { console.log(error, '4') });
});

const tradingAllowedSlice = createSlice({
    name: "trading",
    initialState: {
        loading: false,
        data: null,
        error: "",
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTradingAllowed.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchTradingAllowed.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
            state.error = "";
        });
        builder.addCase(fetchTradingAllowed.rejected, (state, action) => {
            state.loading = false;
            state.data = null;
            state.error = action.error.message;
        });
    },
});


export default tradingAllowedSlice.reducer;
