import { FlatList, StyleSheet } from 'react-native';
import React from 'react';

import VarietyItem from './VarietyItem';

export default function Varieties({ data, activeVariety, setActiveVariety }) {
    return (
        <FlatList
            contentContainerStyle={styles.contentContainerStyle}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={data}
            inverted
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item, index }) => <VarietyItem item={item} index={index} activeVariety={activeVariety} setActiveVariety={setActiveVariety} />}
        />
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 10,
    },
})