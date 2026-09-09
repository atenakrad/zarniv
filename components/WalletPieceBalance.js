import React from 'react';
import { Text, View } from 'react-native';

import NewStyles from '../styles/NewStyles';
import { themeColor3 } from '../theme/Color';
import { getWalletGramText, getWalletPieceSummary } from '../helpers/walletPieces';

export default function WalletPieceBalance({
    wallet,
    metal,
    label,
    textStyle,
    summaryStyle,
    hideRaw = false,
}) {
    const gramText = getWalletGramText(wallet, metal);
    const summaryText = getWalletPieceSummary(wallet, metal);

    return (
        <View style={{ gap: 4, flex: 1 }}>
            {!hideRaw && (
                <View style={NewStyles.rowWrapper}>
                    {!!label && <Text style={textStyle || NewStyles.text10}>{label}</Text>}
                    <Text style={textStyle || NewStyles.text10}>{gramText || '0 گرم'}</Text>
                </View>
            )}
            {!!summaryText && (
                <Text
                    style={[
                        NewStyles.text4,
                        {
                            color: themeColor3.bgColor(0.75),
                            textAlign: 'right',
                            lineHeight: 22,
                            flexShrink: 1,
                        },
                        summaryStyle,
                    ]}
                >
                    معادل: {summaryText}
                </Text>
            )}
        </View>
    );
}
