import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Svg, { Path, Line, Text as SvgText, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { uri } from '../services/URL';
import { formatDate, formatPrice } from '../helpers/Common';
import Loader from './Loader';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1, themeColor12, themeColor4 } from '../theme/Color';
import { TouchableOpacity } from 'react-native';

export default function Chart({ slug, title }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [tooltip, setTooltip] = useState(null);
    const [filterType, setFilterType] = useState('daily');
    const [allData, setAllData] = useState(null); // همه دیتا رو نگه می‌داریم
    const pointsRef = useRef([]); 
    const fetchData = async () => {
        try {
            const response = await axios.post(`${uri}/chart/new/`, { slug: slug }); 
            setAllData(response?.data); // ذخیره کل دیتا
            processData(response?.data, 'daily'); // پردازش اولیه با daily
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (sourceData, type) => {
        const selectedData = sourceData?.[type] || [];

        const processedData = selectedData.map((item) => {
            return {
                value: Number(item.value),
                date: formatDate(item.label).slice(5, 9),
                fullDate: formatDate(item.label).slice(5, 9),
                hour: new Date(item.label).getHours(),
                label: item.label
            }
        });

        setData([...processedData].reverse());
    };

    useEffect(() => {
        fetchData();
    }, []); // فقط یک بار

    useEffect(() => {
        if (allData) {
            processData(allData, filterType); // فقط پردازش می‌کنیم
        }
    }, [filterType]);

    const handleTouch = (touchX) => {
        if (!pointsRef.current || pointsRef.current.length === 0) return;

        const closest = pointsRef.current.reduce((prev, curr) => {
            return Math.abs(curr.x - touchX) < Math.abs(prev.x - touchX) ? curr : prev;
        });

        setTooltip(closest);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent.locationX),
            onPanResponderMove: (evt) => handleTouch(evt.nativeEvent.locationX),
            onPanResponderRelease: () => setTooltip(null),
        })
    ).current;

    if (loading) return <Loader />;
    if (data.length === 0) return null;

    const chartWidth = 340;
    const chartHeight = 280;
    const padding = { top: 30, bottom: 60, left: 50, right: 20 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const valueRange = maxValue - minValue;

    const paddedMin = minValue - (valueRange * 0.1);
    const paddedMax = maxValue + (valueRange * 0.1);
    const paddedRange = paddedMax - paddedMin;

    const points = data.map((item, index) => {
        const x = padding.left + (index / (data.length - 1)) * innerWidth;
        const y = padding.top + innerHeight - ((item.value - paddedMin) / paddedRange) * innerHeight;
        return { x, y, ...item, index };
    });

    pointsRef.current = points;

    let linePath = `M ${points[0].x} ${points[0].y}`;
    const radius = 8;

    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];

        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        const r = Math.min(radius, len1 / 2, len2 / 2);

        const x1 = curr.x - (dx1 / len1) * r;
        const y1 = curr.y - (dy1 / len1) * r;

        const x2 = curr.x + (dx2 / len2) * r;
        const y2 = curr.y + (dy2 / len2) * r;

        linePath += ` L ${x1} ${y1} Q ${curr.x} ${curr.y} ${x2} ${y2}`;
    }

    linePath += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`;

    const xLabels = [];
    const step = Math.max(1, Math.ceil(data.length / 6));
    for (let i = 0; i < points.length; i += step) {
        xLabels.push({ x: points[i].x, label: points[i].date });
    }

    const yLabels = [];
    const yStep = Math.ceil(valueRange / 5 / 10000) * 10000;
    const yMin = Math.floor(minValue / 10000) * 10000;
    const yMax = Math.ceil(maxValue / 10000) * 10000;

    for (let val = yMin; val <= yMax; val += yStep) {
        const y = chartHeight - padding.bottom - ((val - paddedMin) / paddedRange) * innerHeight;
        if (y >= padding.top && y <= chartHeight - padding.bottom) {
            yLabels.push({ y, label: (val) });
        }
    }

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
            <View {...panResponder.panHandlers} style={{}}>
                <Svg width={chartWidth} height={chartHeight}>
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={themeColor0.bgColor(1)} stopOpacity="0.3" />
                            <Stop offset="1" stopColor={themeColor0.bgColor(1)} stopOpacity="0.05" />
                        </LinearGradient>
                    </Defs>

                    <Rect
                        x="0"
                        y="0"
                        width={chartWidth}
                        height={chartHeight}
                        fill="transparent"
                    />

                    {yLabels.map((label, i) => (
                        <Line
                            key={`grid-${i}`}
                            x1={padding.left}
                            y1={label.y}
                            x2={chartWidth - padding.right}
                            y2={label.y}
                            stroke="#e8e8e8"
                            strokeWidth="1"
                        />
                    ))}

                    <Path
                        d={areaPath}
                        fill="url(#grad)"
                    />

                    <Path
                        d={linePath}
                        stroke={themeColor0.bgColor(1)}
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {yLabels.map((label, i) => (
                        <SvgText
                            key={`y-${i}`}
                            x={0}
                            y={label.y + 4}
                            fontSize="10"
                            fill="#666"
                            fontFamily="VazirLight"
                        >
                            {formatPrice(label.label)}
                        </SvgText>
                    ))}

                    {xLabels.map((label, i) => (
                        <SvgText
                            key={`x-${i}`}
                            x={label.x}
                            y={chartHeight - padding.bottom + 20}
                            fontSize="10"
                            fill="#666"
                            textAnchor="middle"
                            fontFamily="VazirLight"
                        >
                            {label.label}
                        </SvgText>
                    ))}

                    {tooltip && (
                        <G>
                            <Line
                                x1={tooltip.x}
                                y1={padding.top}
                                x2={tooltip.x}
                                y2={chartHeight - padding.bottom}
                                stroke={themeColor0.bgColor(1)}
                                strokeWidth="1"
                                strokeDasharray="4,4"
                            />

                            <Circle
                                cx={tooltip.x}
                                cy={tooltip.y}
                                r="5"
                                fill={themeColor0.bgColor(1)}
                                stroke="#fff"
                                strokeWidth="2"
                            />

                            <Rect
                                x={tooltip.x > chartWidth / 2 ? tooltip.x - 110 : tooltip.x + 10}
                                y={Math.max(padding.top, Math.min(tooltip.y - 50, chartHeight - padding.bottom - 70))}
                                width="100"
                                height="70"
                                fill="#fff"
                                rx="8"
                                stroke="#e0e0e0"
                                strokeWidth="1"
                                opacity="0.98"
                            />

                            <SvgText
                                x={tooltip.x > chartWidth / 2 ? tooltip.x - 60 : tooltip.x + 60}
                                y={Math.max(padding.top, Math.min(tooltip.y - 50, chartHeight - padding.bottom - 70)) + 22}
                                fontSize="11"
                                fill="#999"
                                textAnchor="middle"
                                fontFamily="VazirLight"
                            >
                                {`${tooltip.hour}:00`}
                            </SvgText>

                            <SvgText
                                x={tooltip.x > chartWidth / 2 ? tooltip.x - 60 : tooltip.x + 60}
                                y={Math.max(padding.top, Math.min(tooltip.y - 50, chartHeight - padding.bottom - 70)) + 38}
                                fontSize="11"
                                fill="#999"
                                textAnchor="middle"
                                fontFamily="VazirLight"
                            >
                                {tooltip.fullDate}
                            </SvgText>

                            <SvgText
                                x={tooltip.x > chartWidth / 2 ? tooltip.x - 60 : tooltip.x + 60}
                                y={Math.max(padding.top, Math.min(tooltip.y - 50, chartHeight - padding.bottom - 70)) + 58}
                                fontSize="15"
                                fill={themeColor0.bgColor(1)}
                                textAnchor="middle"
                                fontFamily="VazirBold"
                            >
                                {formatPrice(tooltip.value)}
                            </SvgText>
                        </G>
                    )}
                </Svg>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    chart: {
        marginHorizontal: '5%',
        backgroundColor: themeColor4.bgColor(1),
        padding: '4%',
        borderRadius: 12,
        ...NewStyles.shadow
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
        ...NewStyles.border10
    }
});
