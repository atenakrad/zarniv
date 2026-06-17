import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
    Canvas,
    Circle,
    Line,
    Path,
    Rect,
    RoundedRect,
    Skia,
    Text as SkiaText,
    LinearGradient,
    vec,
    useFont,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { uri } from '../services/URL';
import { formatDate, formatPrice } from '../helpers/Common';
import Loader from './Loader';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor12, themeColor4 } from '../theme/Color';

const chartWidth = 340;
const chartHeight = 280;
const padding = { top: 30, bottom: 60, left: 50, right: 20 };
const innerWidth = chartWidth - padding.left - padding.right;
const innerHeight = chartHeight - padding.top - padding.bottom;
const smoothRadius = 8;
const maxRenderPoints = 500;

function colorWithAlpha(hexOrColor, alpha) {
    if (!hexOrColor) return hexOrColor;
    const hexMatch = String(hexOrColor).trim().match(/^#?([a-fA-F0-9]{6})$/);
    if (hexMatch) {
        const int = parseInt(hexMatch[1], 16);
        const r = (int >> 16) & 255;
        const g = (int >> 8) & 255;
        const b = int & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // If it's already rgba() or other format, try to inject alpha for rgba
    if (hexOrColor.startsWith('rgba')) {
        return hexOrColor.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/, `rgba($1,$2,$3,${alpha})`);
    }
    return hexOrColor;
}

function largestTriangleThreeBuckets(data, threshold) {
    if (threshold >= data.length || threshold < 3) {
        return data;
    }

    const sampled = [];
    const every = (data.length - 2) / (threshold - 2);
    let a = 0;
    sampled.push(data[a]);

    for (let i = 0; i < threshold - 2; i += 1) {
        const rangeStart = Math.floor((i + 1) * every) + 1;
        const rangeEnd = Math.min(Math.floor((i + 2) * every) + 1, data.length);

        let avgX = 0;
        let avgY = 0;
        const avgRangeLength = Math.max(1, rangeEnd - rangeStart);

        for (let j = rangeStart; j < rangeEnd; j += 1) {
            avgX += j;
            avgY += data[j].value;
        }

        avgX /= avgRangeLength;
        avgY /= avgRangeLength;

        const rangeOffs = Math.floor(i * every) + 1;
        const rangeTo = Math.min(Math.floor((i + 1) * every) + 1, data.length - 1);

        let maxArea = -1;
        let maxAreaIndex = rangeOffs;

        for (let j = rangeOffs; j < rangeTo; j += 1) {
            const area = Math.abs((a - avgX) * (data[j].value - data[a].value) - (a - j) * (avgY - data[a].value)) * 0.5;
            if (area > maxArea) {
                maxArea = area;
                maxAreaIndex = j;
            }
        }

        sampled.push(data[maxAreaIndex]);
        a = maxAreaIndex;
    }

    sampled.push(data[data.length - 1]);
    return sampled;
}

function getDisplayPoint(item, index, totalPoints, paddedMin, paddedRange) {
    const x = totalPoints === 1 ? padding.left + innerWidth / 2 : padding.left + (index / (totalPoints - 1)) * innerWidth;
    const y = padding.top + innerHeight - ((item.value - paddedMin) / paddedRange) * innerHeight;

    return {
        x,
        y,
        ...item,
        index,
    };
}

function buildSmoothPaths(points, baselineY) {
    const linePath = Skia.Path.Make();
    const areaPath = Skia.Path.Make();

    if (!points.length) {
        return { linePath, areaPath };
    }

    if (points.length === 1) {
        linePath.moveTo(points[0].x, points[0].y);
        areaPath.moveTo(points[0].x, points[0].y);
        areaPath.lineTo(points[0].x, baselineY);
        areaPath.lineTo(points[0].x, baselineY);
        areaPath.close();
        return { linePath, areaPath };
    }

    linePath.moveTo(points[0].x, points[0].y);
    areaPath.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i += 1) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];

        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;

        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;

        const radius = Math.min(smoothRadius, len1 / 2, len2 / 2);

        const x1 = curr.x - (dx1 / len1) * radius;
        const y1 = curr.y - (dy1 / len1) * radius;

        const x2 = curr.x + (dx2 / len2) * radius;
        const y2 = curr.y + (dy2 / len2) * radius;

        linePath.lineTo(x1, y1);
        linePath.quadTo(curr.x, curr.y, x2, y2);

        areaPath.lineTo(x1, y1);
        areaPath.quadTo(curr.x, curr.y, x2, y2);
    }

    linePath.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    areaPath.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    areaPath.lineTo(points[points.length - 1].x, baselineY);
    areaPath.lineTo(points[0].x, baselineY);
    areaPath.close();

    return { linePath, areaPath };
}

export default function Chart({ slug, title }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [filterType, setFilterType] = useState('daily');
    const [allData, setAllData] = useState(null);
    const [tooltipIndex, setTooltipIndex] = useState(null);
    const tooltipIndexRef = useRef(null);
    const lightFont = useFont(require('../assets/fonts/Vazir-Light-FD.ttf'), 10);
    const boldFont = useFont(require('../assets/fonts/Vazir-Bold-FD.ttf'), 15);
    const gestureX = useSharedValue(0);
    const gestureActive = useSharedValue(false);

    const fetchData = async () => {
        try {
            const response = await axios.post(`${uri}/chart/new/`, { slug: slug });
            setAllData(response?.data);
            processData(response?.data, 'daily');
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (sourceData, type) => {
        const selectedData = sourceData?.[type] || [];

        const processedData = selectedData.map((item) => {
            const formattedDate = formatDate(item.label).slice(5, 9);

            return {
                value: Number(item.value),
                date: formattedDate,
                fullDate: formattedDate,
                hour: new Date(item.label).getHours(),
                label: item.label,
            };
        });

        setData([...processedData].reverse());
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (allData) {
            processData(allData, filterType);
        }
    }, [filterType]);

    const stats = useMemo(() => {
        if (data.length === 0) {
            return null;
        }

        const values = data.map((item) => item.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue;
        const safeRange = valueRange === 0 ? Math.max(Math.abs(maxValue) * 0.1, 1) : valueRange;
        const paddedMin = minValue - (safeRange * 0.1);
        const paddedMax = maxValue + (safeRange * 0.1);
        const paddedRange = Math.max(paddedMax - paddedMin, 1);

        return {
            minValue,
            maxValue,
            valueRange: safeRange,
            paddedMin,
            paddedMax,
            paddedRange,
        };
    }, [data]);

    const renderData = useMemo(() => {
        if (data.length <= maxRenderPoints) {
            return data;
        }

        return largestTriangleThreeBuckets(data, maxRenderPoints);
    }, [data]);

    const indexByItem = useMemo(() => new Map(data.map((item, index) => [item, index])), [data]);

    const rawPoints = useMemo(() => {
        if (!stats) {
            return [];
        }

        return data.map((item, index) => getDisplayPoint(item, index, data.length, stats.paddedMin, stats.paddedRange));
    }, [data, stats]);

    const renderPoints = useMemo(() => {
        if (!stats) {
            return [];
        }

        return renderData.map((item) => {
            const index = indexByItem.get(item) ?? 0;
            return getDisplayPoint(item, index, data.length, stats.paddedMin, stats.paddedRange);
        });
    }, [renderData, indexByItem, data.length, stats]);

    const xLabels = useMemo(() => {
        if (!rawPoints.length) {
            return [];
        }

        const labels = [];
        const step = Math.max(1, Math.ceil(data.length / 6));

        for (let i = 0; i < rawPoints.length; i += step) {
            labels.push({ x: rawPoints[i].x, label: rawPoints[i].date });
        }

        return labels;
    }, [rawPoints, data.length]);

    const yLabels = useMemo(() => {
        if (!stats) {
            return [];
        }

        const labels = [];
        const yStep = Math.max(1, Math.ceil((stats.valueRange / 5) / 10000) * 10000);
        const yMin = Math.floor(stats.minValue / 10000) * 10000;
        const yMax = Math.ceil(stats.maxValue / 10000) * 10000;

        for (let value = yMin; value <= yMax; value += yStep) {
            const y = chartHeight - padding.bottom - ((value - stats.paddedMin) / stats.paddedRange) * innerHeight;
            if (y >= padding.top && y <= chartHeight - padding.bottom) {
                labels.push({ y, label: value });
            }
        }

        return labels;
    }, [stats]);

    const chartPaths = useMemo(() => {
        if (!renderPoints.length) {
            return null;
        }

        return buildSmoothPaths(renderPoints, chartHeight - padding.bottom);
    }, [renderPoints]);

    const tooltipPoint = tooltipIndex === null ? null : rawPoints[tooltipIndex] || null;

    const tooltipLayout = useMemo(() => {
        if (!tooltipPoint) {
            return null;
        }

        const boxWidth = 100;
        const boxHeight = 70;
        const boxX = tooltipPoint.x > chartWidth / 2 ? tooltipPoint.x - 110 : tooltipPoint.x + 10;
        const boxY = Math.max(padding.top, Math.min(tooltipPoint.y - 50, chartHeight - padding.bottom - boxHeight));
        const textX = tooltipPoint.x > chartWidth / 2 ? tooltipPoint.x - 60 : tooltipPoint.x + 60;

        return {
            boxX,
            boxY,
            textX,
            boxWidth,
            boxHeight,
        };
    }, [tooltipPoint]);

    const updateTooltipFromTouch = (touchX) => {
        if (!data.length) {
            return;
        }

        const clampedX = Math.max(padding.left, Math.min(touchX, chartWidth - padding.right));
        const targetIndex = data.length === 1
            ? 0
            : Math.round(((clampedX - padding.left) / innerWidth) * (data.length - 1));
        const clampedIndex = Math.max(0, Math.min(data.length - 1, targetIndex));

        if (tooltipIndexRef.current !== clampedIndex) {
            tooltipIndexRef.current = clampedIndex;
            setTooltipIndex(clampedIndex);
        }
    };

    const clearTooltip = () => {
        tooltipIndexRef.current = null;
        setTooltipIndex(null);
    };

    useAnimatedReaction(
        () => (gestureActive.value ? gestureX.value : null),
        (currentX) => {
            if (currentX === null) {
                return;
            }

            const clampedX = Math.max(padding.left, Math.min(currentX, chartWidth - padding.right));
            runOnJS(updateTooltipFromTouch)(clampedX);
        }
    );

    const panGesture = useMemo(
        () => Gesture.Pan()
            .minDistance(0)
            .onBegin((event) => {
                'worklet';
                gestureActive.value = true;
                gestureX.value = event.x;
                runOnJS(updateTooltipFromTouch)(event.x);
            })
            .onUpdate((event) => {
                'worklet';
                gestureX.value = event.x;
            })
            .onFinalize(() => {
                'worklet';
                gestureActive.value = false;
                runOnJS(clearTooltip)();
            }),
        [gestureActive, gestureX]
    );

    if (loading || !lightFont || !boldFont) return <Loader />;
    if (data.length === 0 || !stats || !chartPaths) return null;

    const linePath = chartPaths.linePath;
    const areaPath = chartPaths.areaPath;

    const measureLabelWidth = (font, label) => {
        if (!font) {
            return 0;
        }

        return font.measureText(String(label)).width;
    };

    const renderTooltipGuide = (tooltipPointValue) => {
        const guideSegments = [];
        const dashLength = 4;
        const gapLength = 4;

        for (let y = padding.top; y < chartHeight - padding.bottom; y += dashLength + gapLength) {
            guideSegments.push(
                <Line
                    key={`guide-${y}`}
                    p1={vec(tooltipPointValue.x, y)}
                    p2={vec(tooltipPointValue.x, Math.min(y + dashLength, chartHeight - padding.bottom))}
                    color={themeColor0.bgColor(1)}
                    style="stroke"
                    strokeWidth={1}
                />
            );
        }

        return guideSegments;
    };

    return (
        <View style={styles.chart}>
            <Text style={styles.title}>{title}</Text>
            <View style={[NewStyles.row, { gap: 10 }, NewStyles.center]}>
                <TouchableOpacity onPress={() => setFilterType('daily')} style={[styles.filterItem, filterType === 'daily' && { backgroundColor: themeColor0.bgColor(1) }]}>
                    <Text style={[NewStyles.text10, filterType === 'daily' && NewStyles.text4]}>
                        روزانه
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setFilterType('weekly')} style={[styles.filterItem, filterType === 'weekly' && { backgroundColor: themeColor0.bgColor(1) }]}>
                    <Text style={[NewStyles.text10, filterType === 'weekly' && NewStyles.text4]}>
                        هفتگی
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setFilterType('monthly')} style={[styles.filterItem, filterType === 'monthly' && { backgroundColor: themeColor0.bgColor(1) }]}>
                    <Text style={[NewStyles.text10, filterType === 'monthly' && NewStyles.text4]}>
                        ماهانه
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setFilterType('yearly')} style={[styles.filterItem, filterType === 'yearly' && { backgroundColor: themeColor0.bgColor(1) }]}>
                    <Text style={[NewStyles.text10, filterType === 'yearly' && NewStyles.text4]}>
                        سالانه
                    </Text>
                </TouchableOpacity>
            </View>
            <GestureDetector gesture={panGesture}>
                <View style={{ width: chartWidth, height: chartHeight }}>
                    <Canvas style={{ width: chartWidth, height: chartHeight }}>
                        <Rect x={0} y={0} width={chartWidth} height={chartHeight} color="transparent" />

                        {yLabels.map((label, i) => (
                            <Line
                                key={`grid-${i}`}
                                p1={vec(padding.left, label.y)}
                                p2={vec(chartWidth - padding.right, label.y)}
                                color="#e8e8e8"
                                style="stroke"
                                strokeWidth={1}
                            />
                        ))}

                        <Path path={areaPath} style="fill">
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(0, chartHeight)}
                                colors={[
                                    colorWithAlpha(themeColor0.bgColor(1), 0.3),
                                    colorWithAlpha(themeColor0.bgColor(1), 0.05),
                                ]}
                                positions={[0, 1]}
                            />
                        </Path>

                        <Path
                            path={linePath}
                            style="stroke"
                            color={themeColor0.bgColor(1)}
                            strokeWidth={2.5}
                            strokeCap="round"
                            strokeJoin="round"
                        />

                        {yLabels.map((label, i) => (
                            <SkiaText
                                key={`y-${i}`}
                                x={0}
                                y={label.y + 4}
                                text={formatPrice(label.label)}
                                font={lightFont}
                                color="#666"
                            />
                        ))}

                        {xLabels.map((label, i) => {
                            const labelWidth = measureLabelWidth(lightFont, label.label);
                            return (
                                <SkiaText
                                    key={`x-${i}`}
                                    x={label.x - (labelWidth / 2)}
                                    y={chartHeight - padding.bottom + 20}
                                    text={label.label}
                                    font={lightFont}
                                    color="#666"
                                />
                            );
                        })}

                        {tooltipPoint && tooltipLayout && (
                            <>
                                {renderTooltipGuide(tooltipPoint)}

                                <Circle
                                    cx={tooltipPoint.x}
                                    cy={tooltipPoint.y}
                                    r={5}
                                    color={themeColor0.bgColor(1)}
                                    style="fill"
                                    stroke="#fff"
                                    strokeWidth={2}
                                />

                                <RoundedRect
                                    x={tooltipLayout.boxX}
                                    y={tooltipLayout.boxY}
                                    width={tooltipLayout.boxWidth}
                                    height={tooltipLayout.boxHeight}
                                    r={8}
                                    color="#fff"
                                    style="fill"
                                />
                                <RoundedRect
                                    x={tooltipLayout.boxX}
                                    y={tooltipLayout.boxY}
                                    width={tooltipLayout.boxWidth}
                                    height={tooltipLayout.boxHeight}
                                    r={8}
                                    color="#e0e0e0"
                                    style="stroke"
                                    strokeWidth={1}
                                    opacity={0.98}
                                />

                                <SkiaText
                                    x={tooltipLayout.textX}
                                    y={tooltipLayout.boxY + 22}
                                    text={`${tooltipPoint.hour}:00`}
                                    font={lightFont}
                                    color="#999"
                                />

                                <SkiaText
                                    x={tooltipLayout.textX}
                                    y={tooltipLayout.boxY + 38}
                                    text={tooltipPoint.fullDate}
                                    font={lightFont}
                                    color="#999"
                                />

                                <SkiaText
                                    x={tooltipLayout.textX}
                                    y={tooltipLayout.boxY + 58}
                                    text={formatPrice(tooltipPoint.value)}
                                    font={boldFont}
                                    color={themeColor0.bgColor(1)}
                                />
                            </>
                        )}
                    </Canvas>
                </View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    chart: {
        marginHorizontal: '5%',
        backgroundColor: themeColor4.bgColor(1),
        padding: '4%',
        borderRadius: 12,
        ...NewStyles.shadow,
    },
    title: {
        ...NewStyles.title,
        fontSize: 16,
        marginBottom: 15,
    },
    filterItem: {
        backgroundColor: themeColor12.bgColor(1),
        paddingHorizontal: 10,
        paddingVertical: 5,
        ...NewStyles.border10,
    },
});
