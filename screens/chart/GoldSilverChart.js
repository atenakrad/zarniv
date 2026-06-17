import { StyleSheet, Text, View, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles, { deviceWidth } from '../../styles/NewStyles'
import axios from 'axios'
import { uri } from '../../services/URL'
import { useSelector } from 'react-redux'
import { LineChart } from 'react-native-gifted-charts'
import { themeColor0, themeColor1, themeColor11, themeColor2, themeColor3, themeColor7 } from '../../theme/Color'
import { formatPrice } from '../../helpers/Common'
import Loader from '../../components/Loader'


const GoldSilverChart = ({ route }) => {

    const params = route?.params?.params


    const accessToken = useSelector(state => state.token?.accessToken);

    const [totalData, setTotalData] = useState([])
    const [realizedData, setRealizedData] = useState([])
    const [unrealizedData, setUnrealizedData] = useState([])
    const [loading, setLoading] = useState(true)
    const buildChartData = (arr) => {
        if (!arr) return []
        return arr.map((v) => ({
            value: Number(v),
            dataPointText: `${formatPrice(v)}`,
        }))
    }

    const getChart = () => {
        axios.post(
            `${uri}/gold-silver-chart/`,
            { metal: params?.metal },
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
            .then((res) => {

                const data = res?.data?.data?.datasets

                setTotalData(buildChartData(data?.total))
                setRealizedData(buildChartData(data?.realized))
                setUnrealizedData(buildChartData(data?.unrealized))

            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        getChart()
    }, [])
    if (loading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={NewStyles.container}>

            <View style={styles.contentContainerStyle}>
                <View style={NewStyles.center}>
                    <Text style={NewStyles.heading}> {params?.metal === 'gold' ? 'طلا' : 'نقره'}</Text>
                </View>
                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                <View style={styles.chartContainer}>


                    {totalData.length > 0 && (

                        <LineChart
                            areaChart
                            width={deviceWidth - 40}
                            height={260}
                            data={totalData}
                            data2={realizedData}
                            data3={unrealizedData}
                            spacing={90}
                            initialSpacing={10}
                            thickness={3}
                            color1={themeColor2.bgColor(1)}
                            color2={themeColor7.bgColor(1)}
                            color3={themeColor11.bgColor(1)}
                            startFillColor1="#3B82F6"
                            endFillColor1="#3B82F6"
                            startOpacity={0}
                            endOpacity={0}
                            dataPointsRadius={4}
                            dataPointsColor1={themeColor2.bgColor(1)}
                            dataPointsColor2={themeColor7.bgColor(1)}
                            dataPointsColor3={themeColor11.bgColor(1)}
                            showVerticalLines
                            verticalLinesColor="#E5E7EB"
                            yAxisColor="#E5E7EB"
                            xAxisColor="#E5E7EB"
                            yAxisTextStyle={[NewStyles.text3, { color: "#6B7280" }]}
                            xAxisLabelTextStyle={[NewStyles.text3, { color: "#6B7280", fontSize: 10 }]}
                            adjustToWidth={false}
                            scrollToEnd
                            isAnimated
                            endSpacing={100}

                            showPointerStrip
                            showPointerLabel
                            pointerConfig={{
                                pointerStripHeight: 260,
                                pointerStripColor: '#9CA3AF',
                                pointerStripWidth: 1,
                                activatePointersOnLongPress: true,
                                autoAdjustPointerLabelPosition: true,
                                pointerColor: themeColor2.bgColor(1),
                                radius: 6,
                                pointerLabelWidth: 0,
                                pointerLabelHeight: 0,
                                pointerLabelComponent: (items) => {
                                    return (
                                        <View
                                            style={{
                                                padding: 10,
                                                width: 170,
                                                backgroundColor: 'white',
                                                borderRadius: 12,
                                                borderWidth: 1,
                                                borderColor: '#E5E7EB',
                                                ...NewStyles.shadow,
                                            }}
                                        >
                                            <Text style={[NewStyles.text2, { color: themeColor2.bgColor(1) }]}>
                                                کل سود: {formatPrice(items?.[0]?.value || 0)}
                                            </Text>

                                            {items?.[1] && (
                                                <Text style={[NewStyles.text2, { color: themeColor7.bgColor(1) }]}>
                                                    تحقق یافته: {formatPrice(items?.[1]?.value || 0)}
                                                </Text>
                                            )}

                                            {items?.[2] && (
                                                <Text style={[NewStyles.text2, { color: themeColor11.bgColor(1) }]}>
                                                    تحقق نیافته: {formatPrice(items?.[2]?.value || 0)}
                                                </Text>
                                            )}
                                        </View>
                                    )
                                },
                            }}
                        />

                    )}

                    <View style={NewStyles.rowWrapper}>

                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <View style={[styles.legendColor, { backgroundColor: themeColor2.bgColor(1) }]} />
                            <Text style={NewStyles.text2}>کل سود</Text>
                        </View>

                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <View style={[styles.legendColor, { backgroundColor: themeColor7.bgColor(1) }]} />
                            <Text style={NewStyles.text7}>سود تحقق یافته</Text>
                        </View>

                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <View style={[styles.legendColor, { backgroundColor: themeColor11.bgColor(1) }]} />
                            <Text style={NewStyles.text11}>سود تحقق نیافته</Text>
                        </View>

                    </View>

                </View>
            </View>

        </SafeAreaView>
    )
}

export default GoldSilverChart

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingVertical: '5%',
        gap: 10,
    },
    chartContainer: {
        padding: 20,
        backgroundColor: "white",
        borderRadius: 16,
        width: '90%',
        alignSelf: 'center',
        overflow: 'hidden',
        ...NewStyles.shadow

    },

    title: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 20,
    },

    legendContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },

    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },

    legendText: {
        fontSize: 12,
        color: "#555",
    },

})
