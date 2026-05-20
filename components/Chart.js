import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

import {
    Canvas,
    Path,
    Skia,
    LinearGradient,
    vec,
    Circle,
    Line,
    Text as SkiaText,
    useFont,
    RoundedRect,
} from '@shopify/react-native-skia';

import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';

import {
    useSharedValue,
} from 'react-native-reanimated';

const width = Dimensions.get('window').width - 40;
const height = 280;

const padding = {
    top: 30,
    bottom: 50,
    left: 40,
    right: 20,
};

const innerWidth = width - padding.left - padding.right;
const innerHeight = height - padding.top - padding.bottom;

function downsample(data, maxPoints = 250) {
    if (data.length <= maxPoints) return data;

    const bucket = Math.ceil(data.length / maxPoints);

    return data.filter((_, i) => i % bucket === 0);
}

export default function ChartSkia({
    data = [],
    title = 'Chart',
}) {

    const font = useFont(
        require('../assets/fonts/Vazir-Light-FD.ttf'),
        11
    );

    const tooltipFont = useFont(
        require('../assets/fonts/Vazir-Bold-FD.ttf'),
        14
    );

    const tooltipX = useSharedValue(0);
    const activeIndex = useSharedValue(-1);

    const sampledData = useMemo(() => {
        return downsample(data, 300);
    }, [data]);

    const {
        points,
        linePath,
        areaPath,
        minValue,
        maxValue,
    } = useMemo(() => {

        if (!sampledData.length) {
            return {
                points: [],
                linePath: null,
                areaPath: null,
                minValue: 0,
                maxValue: 0,
            };
        }

        const values = sampledData.map(i => i.value);

        const min = Math.min(...values);
        const max = Math.max(...values);

        const range = max - min || 1;

        const paddedMin = min - range * 0.1;
        const paddedMax = max + range * 0.1;
        const paddedRange = paddedMax - paddedMin;

        const pts = sampledData.map((item, index) => {

            const x =
                padding.left +
                (index / (sampledData.length - 1)) * innerWidth;

            const y =
                padding.top +
                innerHeight -
                ((item.value - paddedMin) / paddedRange) * innerHeight;

            return {
                x,
                y,
                ...item,
            };
        });

        const path = Skia.Path.Make();

        path.moveTo(pts[0].x, pts[0].y);

        for (let i = 1; i < pts.length; i++) {

            const prev = pts[i - 1];
            const curr = pts[i];

            const midX = (prev.x + curr.x) / 2;

            path.cubicTo(
                midX,
                prev.y,
                midX,
                curr.y,
                curr.x,
                curr.y
            );
        }

        const fillPath = path.copy();

        fillPath.lineTo(
            pts[pts.length - 1].x,
            height - padding.bottom
        );

        fillPath.lineTo(
            pts[0].x,
            height - padding.bottom
        );

        fillPath.close();

        return {
            points: pts,
            linePath: path,
            areaPath: fillPath,
            minValue: min,
            maxValue: max,
        };

    }, [sampledData]);

    const gesture = Gesture.Pan()
        .onBegin((e) => {
            findClosest(e.x);
        })
        .onUpdate((e) => {
            findClosest(e.x);
        })
        .onEnd(() => {
            activeIndex.value = -1;
        });

    const findClosest = (x) => {

        'worklet';

        if (!points.length) return;

        let closestIndex = 0;
        let minDistance = Math.abs(points[0].x - x);

        for (let i = 1; i < points.length; i++) {

            const distance = Math.abs(points[i].x - x);

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }

        activeIndex.value = closestIndex;
        tooltipX.value = points[closestIndex].x;
    };

    if (!linePath || !font || !tooltipFont) {
        return null;
    }

    const tooltipPoint =
        activeIndex.value >= 0
            ? points[activeIndex.value]
            : null;

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                {title}
            </Text>

            <GestureDetector gesture={gesture}>

                <Canvas
                    style={{
                        width,
                        height,
                    }}
                >

                    {/* Grid */}

                    {[0, 1, 2, 3, 4].map((i) => {

                        const y =
                            padding.top +
                            (innerHeight / 4) * i;

                        return (
                            <Line
                                key={i}
                                p1={vec(padding.left, y)}
                                p2={vec(width - padding.right, y)}
                                color="#e5e5e5"
                                strokeWidth={1}
                            />
                        );
                    })}

                    {/* Area */}

                    <Path path={areaPath}>

                        <LinearGradient
                            start={vec(0, 0)}
                            end={vec(0, height)}
                            colors={[
                                'rgba(0,122,255,0.3)',
                                'rgba(0,122,255,0.02)',
                            ]}
                        />

                    </Path>

                    {/* Line */}

                    <Path
                        path={linePath}
                        color="#007AFF"
                        style="stroke"
                        strokeWidth={3}
                    />

                    {/* Labels */}

                    {[0, 1, 2, 3, 4].map((i) => {

                        const value =
                            maxValue -
                            ((maxValue - minValue) / 4) * i;

                        const y =
                            padding.top +
                            (innerHeight / 4) * i;

                        return (
                            <SkiaText
                                key={i}
                                x={0}
                                y={y + 4}
                                text={Math.round(value).toString()}
                                font={font}
                                color="#666"
                            />
                        );
                    })}

                    {/* Tooltip */}

                    {tooltipPoint && (
                        <>
                            <Line
                                p1={vec(tooltipPoint.x, padding.top)}
                                p2={vec(tooltipPoint.x, height - padding.bottom)}
                                color="#007AFF"
                                strokeWidth={1}
                            />

                            <Circle
                                cx={tooltipPoint.x}
                                cy={tooltipPoint.y}
                                r={5}
                                color="#007AFF"
                            />

                            <RoundedRect
                                x={
                                    tooltipPoint.x > width / 2
                                        ? tooltipPoint.x - 110
                                        : tooltipPoint.x + 10
                                }
                                y={tooltipPoint.y - 60}
                                width={100}
                                height={50}
                                r={10}
                                color="white"
                            />

                            <SkiaText
                                x={
                                    tooltipPoint.x > width / 2
                                        ? tooltipPoint.x - 95
                                        : tooltipPoint.x + 20
                                }
                                y={tooltipPoint.y - 30}
                                text={tooltipPoint.value.toString()}
                                font={tooltipFont}
                                color="#007AFF"
                            />
                        </>
                    )}

                </Canvas>

            </GestureDetector>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },

    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});