import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchSilverInfoPrice = createAsyncThunk("silverInfo/fetchSilverInfoPrice", async ({ params }) => {
    
    
    return await axios
        .get(`${uri}/silver/calc/`, {params: params})
        .then((response) => response?.data)
        .catch((error) => { console.log(error, 'silver') });
});

const silverInfoSlice = createSlice({
    name: "silverInfo",
    initialState: {
        loading: false,
        data: null,
        error: "",
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSilverInfoPrice.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchSilverInfoPrice.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
            state.error = "";
        });
        builder.addCase(fetchSilverInfoPrice.rejected, (state, action) => {
            state.loading = false;
            state.data = null;
            state.error = action.error.message;
        });
    },
});


export default silverInfoSlice.reducer;
