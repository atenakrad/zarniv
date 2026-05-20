import { View, useWindowDimensions } from 'react-native';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedRef, configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

import Pagination from './Pagination';
import CustomImage from './CustomImage';

// This is the default configuration
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false, // Reanimated runs in strict mode by default
});

export default function CustomImageCarousal({ data }) {

    const scrollViewRef = useAnimatedRef(null);
    const interval = useRef();
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const newData = useMemo(() => ([
        { key: 'spacer-left' },
        ...data,
        { key: 'spacer-right' },
    ]), [data]);
    const { width } = useWindowDimensions();
    const SIZE = width * 0.9;
    const SPACER = (width - SIZE) / 2;
    const x = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler({
        onScroll: event => {
            x.value = event.contentOffset.x;
        },
    });

    useEffect(() => {
        if (isAutoPlay === true && data.length > 1) {
            interval.current = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = prevIndex >= data.length - 1 ? 0 : prevIndex + 1;
                    scrollViewRef.current?.scrollTo({ x: Math.floor(nextIndex * SIZE), y: 0, animated: true });
                    return nextIndex;
                });
            }, 7000);
        }

        return () => {
            clearInterval(interval.current);
        };
    }, [SIZE, isAutoPlay, data.length, scrollViewRef]);

    useEffect(() => {
        if (currentIndex > data.length - 1) {
            setCurrentIndex(0);
            scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
        }
    }, [currentIndex, data.length, scrollViewRef]);

    return (
        <View>
            <Animated.ScrollView
                ref={scrollViewRef}
                onScroll={onScroll}
                onScrollBeginDrag={e => {
                    setIsAutoPlay(false);
                }}
                onMomentumScrollEnd={(event) => {
                    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SIZE);
                    const safeIndex = Math.max(0, Math.min(nextIndex, Math.max(data.length - 1, 0)));
                    setCurrentIndex(safeIndex);
                    setIsAutoPlay(true);
                }}
                scrollEventThrottle={16}
                decelerationRate='fast'
                snapToInterval={SIZE}
                disableIntervalMomentum={true}
                snapToAlignment={"start"}
                horizontal
                bounces={false}
                showsHorizontalScrollIndicator={false}>
                {newData.map((item, index) => {
                    return (
                        <CustomImage key={item?.id?.toString?.() || item?.key || index.toString()} index={index} item={item} x={x} size={SIZE} spacer={SPACER} />
                    );
                })}
            </Animated.ScrollView>
            <Pagination data={data} x={x} size={SIZE} />
        </View>
    );
};
