import { createSlice } from '@reduxjs/toolkit';

export const lastScreenSlice = createSlice({
    name: 'last',
    initialState: {
        screen: null,
        params: {}
    },
    reducers: {
        setLastScreen: (state, action) => {
            state.screen = action.payload;
        },
        setParams:(state, action)=>{
            state.params = action.payload;
        },
        removeLastScreen: (state) => {
            state.screen = null;
        },
        removeParams: (state) => {
            state.params = {};
        },
    }
});

export const { setLastScreen, removeLastScreen, setParams, removeParams } = lastScreenSlice.actions;

export default lastScreenSlice.reducer