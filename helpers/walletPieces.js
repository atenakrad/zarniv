const METAL_META = {
    gold: { balanceField: 'gold_balance', label: 'طلا' },
    silver: { balanceField: 'silver_balance', label: 'نقره' },
};

export const getWalletPieceBreakdown = (wallet, metal) => {
    if (!wallet || !METAL_META[metal]) return null;
    return wallet?.piece_breakdowns?.[metal] || null;
};

export const getWalletGramText = (wallet, metal) => {
    const meta = METAL_META[metal];
    if (!wallet || !meta) return null;

    const breakdown = getWalletPieceBreakdown(wallet, metal);
    if (breakdown?.balance_gram !== undefined && breakdown?.balance_gram !== null) {
        return `${breakdown.balance_gram} گرم`;
    }

    const rawBalance = wallet?.[meta.balanceField];
    if (rawBalance === undefined || rawBalance === null || rawBalance === '') return null;
    return `${rawBalance} گرم`;
};

export const getWalletPieceSummary = (wallet, metal) => {
    const breakdown = getWalletPieceBreakdown(wallet, metal);
    const summary = String(breakdown?.summary_text || '').trim();
    return summary || null;
};

export const getWalletMetalLabel = (metal) => METAL_META[metal]?.label || '';
