import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor3, themeColor12, themeColor7 } from '../theme/Color';

const fallbackMask = (value) => {
    const text = String(value || '').replace(/\s/g, '');
    if (!text) return '-';
    if (text.length <= 8) return text;
    return `${text.slice(0, 4)}…${text.slice(-4)}`;
};

export default function BankAccountSelector({
    title,
    accounts = [],
    selectedId,
    onSelect,
    emptyText = 'حساب بانکی قابل استفاده‌ای وجود ندارد.',
    siteMode = false,
}) {
    return (
        <View style={{ gap: 8 }}>
            {!!title && <Text style={NewStyles.title10}>{title}</Text>}

            {accounts.length === 0 ? (
                <View style={[styles.emptyBox, NewStyles.border10]}>
                    <Text style={NewStyles.text10}>{emptyText}</Text>
                </View>
            ) : (
                accounts.map((account) => {
                    const selected = String(selectedId || '') === String(account?.id || '');
                    const identifier = siteMode
                        ? fallbackMask(account?.card_number || account?.iban || account?.bank_account_number)
                        : (account?.masked_identifier || fallbackMask(account?.card_number || account?.iban || account?.bank_account_number));

                    return (
                        <TouchableOpacity
                            key={account?.id}
                            activeOpacity={0.8}
                            onPress={() => onSelect?.(account?.id)}
                            style={[
                                styles.card,
                                NewStyles.border10,
                                selected && styles.cardSelected,
                            ]}
                        >
                            <View style={[NewStyles.rowWrapper, { alignItems: 'center' }]}>
                                <Text style={NewStyles.title10}>
                                    {account?.title || account?.bank_name || 'حساب بانکی'}
                                </Text>
                                <View style={[NewStyles.row, { gap: 6 }]}>
                                    {!siteMode && account?.is_default ? (
                                        <View style={[{ paddingVertical: 5, paddingHorizontal: 10, backgroundColor: themeColor0.bgColor(0.1), borderColor: themeColor0.bgColor(1), borderWidth: StyleSheet.hairlineWidth }, NewStyles.border100]}>
                                            <Text style={styles.badge}>پیش‌فرض</Text>
                                        </View>
                                    ) : null}
                                    {selected ?
                                        <View style={[{ paddingVertical: 5, paddingHorizontal: 10, backgroundColor: themeColor7.bgColor(0.1), borderColor: themeColor7.bgColor(1), borderWidth: StyleSheet.hairlineWidth }, NewStyles.border100]}>
                                            <Text style={styles.selectedBadge}>انتخاب شده</Text> 
                                        </View>
                                        : null
                                    }
                                </View>
                            </View>

                            {!!account?.bank_name && (
                                <Text style={NewStyles.text10}>بانک: {account.bank_name}</Text>
                            )}
                            <Text style={NewStyles.text10}>شناسه حساب: {identifier}</Text>
                            {!!(account?.bank_owner_name || account?.owner_name) && (
                                <Text style={NewStyles.text10}>
                                    صاحب حساب: {account?.bank_owner_name || account?.owner_name}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderWidth: 1,
        borderColor: themeColor3.bgColor(0.18),
        backgroundColor: themeColor12.bgColor(1),
        gap: 6,
    },
    cardSelected: {
        borderColor: themeColor0.bgColor(1),
        backgroundColor: themeColor0.bgColor(0.06),
    },
    badge: {
        ...NewStyles.text
    },
    selectedBadge: {
        ...NewStyles.text7
    },
    emptyBox: {
        padding: 12,
        backgroundColor: themeColor12.bgColor(1),
    },
});
