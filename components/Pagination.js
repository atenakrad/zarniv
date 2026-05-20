import { StyleSheet, View } from 'react-native';
import React from 'react';

import NewStyles from '../styles/NewStyles';
import Dot from './Dot';
import { themeColor10 } from '../theme/Color';

export default function Pagination({ data, x, size }) {
    return (
        <View style={[styles.paginationContainer, NewStyles.center, NewStyles.border100]}>
            {data.map((_, i) => {
                return <Dot key={i} x={x} index={i} size={size} />;
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    paginationContainer: {
        // backgroundColor: themeColor10.bgColor(0.4),
        padding: 3,
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        flexDirection: 'row',
        left: 40
    },
})
