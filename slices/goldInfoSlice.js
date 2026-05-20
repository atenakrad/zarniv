import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { uri } from "../services/URL";

export const fetchInfoPrice = createAsyncThunk("goldInfo/fetchInfoPrice", async ({ params }) => {
    
    
    return await axios
        .get(`${uri}/gold/calc/`, {params: params})
        .then((response) => response?.data)
        .catch((error) => { console.log(error, '4') });
});

const goldInfoSlice = createSlice({
    name: "goldInfo",
    initialState: {
        loading: false,
        data: null,
        error: "",
    },
    extraReducers: (builder) => {
        builder.addCase(fetchInfoPrice.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchInfoPrice.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
            state.error = "";
        });
        builder.addCase(fetchInfoPrice.rejected, (state, action) => {
            state.loading = false;
            state.data = null;
            state.error = action.error.message;
        });
    },
});


export default goldInfoSlice.reducer;
