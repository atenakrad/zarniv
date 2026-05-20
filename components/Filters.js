import { FlatList, StyleSheet } from 'react-native';
import FilterItem from './FilterItem';

export default function Filters({ data, activeFilter, setActiveFilter }) {
    return (
        <FlatList
            contentContainerStyle={styles.contentContainerStyle}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={data}
            inverted
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item, index }) => <FilterItem index={index} item={item} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />}
        />
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 10,
        paddingHorizontal: 15,
    },
})