export const DEFAULT_TRADE_MIN_GRAM = 0.001;
export const TRADE_CALCULATION_DEBOUNCE_MS = 180;

const toPositiveNumber = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const toNonNegativeNumber = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
};

const toMilliGram = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return Math.round(numeric * 1000);
};

export const formatGramLimit = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "";

    return numeric
        .toFixed(3)
        .replace(/\.0+$/, "")
        .replace(/(\.\d*?)0+$/, "$1");
};

export const getTradeLimits = (source, operation, metal, fallbackSource = null) => {
    // Backward compatible with both API contracts:
    // 1) old calc API: trade_limits.buy.{min_gram,max_gram}
    // 2) team backend: trade_limits.gold.buy_gram / trade_limits.silver.buy_gram
    const hasApiValue = (value) => value !== undefined && value !== null && value !== '';

    const readLimits = (candidate) => {
        const legacyLimits = candidate?.trade_limits?.[operation] || {};
        const metalLimits = metal ? (candidate?.trade_limits?.[metal] || {}) : {};
        const operationKey = operation === 'delivery'
            ? 'physical_delivery_gram'
            : `${operation}_gram`;

        const dynamicMin = operation === 'delivery' && metal
            ? candidate?.physical_delivery_min_gram?.[metal]
            : metalLimits?.[`min_${operation}_gram`];

        const legacyMaxRaw = legacyLimits?.max_gram;
        const metalMaxRaw = metalLimits?.[operationKey];
        const hasMax = hasApiValue(legacyMaxRaw) || hasApiValue(metalMaxRaw);
        const maxRaw = hasApiValue(legacyMaxRaw) ? legacyMaxRaw : metalMaxRaw;
        // مقدار صفر در قرارداد بک‌اند یعنی نامحدود؛ وجود صفر با نبودن فیلد فرق دارد.
        const max = hasMax ? toPositiveNumber(maxRaw) : null;

        const holdingRaw = metalLimits?.holding_max_gram;
        const hasHoldingMax = hasApiValue(holdingRaw) || (operation === 'buy' && hasMax);
        const holdingMax = hasApiValue(holdingRaw)
            ? toPositiveNumber(holdingRaw)
            : (operation === 'buy' ? max : null);

        const pendingRaw = metalLimits?.pending_gateway_buy_gram;
        const pendingAdminRaw = metalLimits?.pending_admin_approval_gram;
        const remainingRaw = metalLimits?.remaining_buy_capacity_gram;

        return {
            min: toPositiveNumber(legacyLimits?.min_gram) || toPositiveNumber(dynamicMin),
            max,
            hasMax,
            holdingMax,
            hasHoldingMax,
            pendingGateway: toNonNegativeNumber(pendingRaw),
            hasPendingGateway: hasApiValue(pendingRaw),
            pendingAdmin: toNonNegativeNumber(pendingAdminRaw),
            hasPendingAdmin: hasApiValue(pendingAdminRaw),
            serverRemainingCapacity: toNonNegativeNumber(remainingRaw),
            hasServerRemainingCapacity: hasApiValue(remainingRaw),
        };
    };

    const primary = readLimits(source);
    const fallback = readLimits(fallbackSource);

    return {
        min: primary.min || fallback.min || DEFAULT_TRADE_MIN_GRAM,
        max: primary.hasMax ? primary.max : (fallback.hasMax ? fallback.max : null),
        holdingMax: primary.hasHoldingMax
            ? primary.holdingMax
            : (fallback.hasHoldingMax ? fallback.holdingMax : null),
        pendingGateway: primary.hasPendingGateway
            ? (primary.pendingGateway ?? 0)
            : (fallback.pendingGateway ?? 0),
        pendingAdmin: primary.hasPendingAdmin
            ? (primary.pendingAdmin ?? 0)
            : (fallback.pendingAdmin ?? 0),
        serverRemainingCapacity: primary.hasServerRemainingCapacity
            ? primary.serverRemainingCapacity
            : (fallback.serverRemainingCapacity ?? null),
    };
};

export const getTradeWeightError = (weight, limits, operationLabel) => {
    const numericWeight = Number(weight);
    const min = toPositiveNumber(limits?.min) || DEFAULT_TRADE_MIN_GRAM;
    const max = toPositiveNumber(limits?.max);

    if (!Number.isFinite(numericWeight) || numericWeight < min) {
        return `حداقل مقدار ${operationLabel} ${formatGramLimit(min)} گرم است`;
    }

    if (max && numericWeight > max) {
        return `حداکثر مقدار ${operationLabel} ${formatGramLimit(max)} گرم است`;
    }

    return "";
};

export const getTradableBalance = (balance, limits) => {
    const numericBalance = Number(balance);
    if (!Number.isFinite(numericBalance) || numericBalance <= 0) return 0;

    const roundedDownBalance = Math.floor((numericBalance + Number.EPSILON) * 1000) / 1000;
    const max = toPositiveNumber(limits?.max);

    if (!max) return roundedDownBalance;
    return Math.min(roundedDownBalance, max);
};

export const getRemainingBuyCapacity = (currentBalance, limits) => {
    const max = toPositiveNumber(limits?.holdingMax) || toPositiveNumber(limits?.max);
    if (!max) return null;

    const maxMg = toMilliGram(max);
    const currentMg = Math.max(0, toMilliGram(currentBalance) ?? 0);
    const pendingGatewayMg = Math.max(0, toMilliGram(limits?.pendingGateway) ?? 0);
    const pendingAdminMg = Math.max(0, toMilliGram(limits?.pendingAdmin) ?? 0);
    const localRemainingMg = Math.max(0, maxMg - currentMg - pendingGatewayMg - pendingAdminMg);

    const serverRemaining = toNonNegativeNumber(limits?.serverRemainingCapacity);
    if (serverRemaining === null) return localRemainingMg / 1000;

    const serverRemainingMg = Math.max(0, toMilliGram(serverRemaining) ?? 0);
    return Math.min(localRemainingMg, serverRemainingMg) / 1000;
};

export const getMetalBalanceLimitError = (addedWeight, currentBalance, limits, metalLabel, actionLabel = 'این عملیات') => {
    const max = toPositiveNumber(limits?.holdingMax) || toPositiveNumber(limits?.max);
    if (!max) return "";

    const pendingGatewayMg = Math.max(0, toMilliGram(limits?.pendingGateway) ?? 0);
    const pendingAdminMg = Math.max(0, toMilliGram(limits?.pendingAdmin) ?? 0);
    const pendingMg = pendingGatewayMg + pendingAdminMg;
    const remainingCapacity = getRemainingBuyCapacity(currentBalance, limits);
    const remainingMg = Math.max(0, toMilliGram(remainingCapacity) ?? 0);

    if (remainingMg <= 0) {
        return `موجودی ${metalLabel} شما به سقف مجاز ${formatGramLimit(max)} گرم رسیده است و امکان افزایش موجودی وجود ندارد`;
    }

    const addedMg = toMilliGram(addedWeight);
    if (addedMg !== null && addedMg > 0 && addedMg > remainingMg) {
        const pendingText = pendingMg > 0
            ? ` با احتساب ${formatGramLimit(pendingMg / 1000)} گرم خرید/درخواست در انتظار،`
            : '';
        return `${actionLabel} باعث می‌شود موجودی ${metalLabel} از سقف مجاز ${formatGramLimit(max)} گرم بیشتر شود.${pendingText} ظرفیت باقی‌مانده ${formatGramLimit(remainingMg / 1000)} گرم است`;
    }

    return "";
};

export const getBuyBalanceLimitError = (weight, currentBalance, limits, metalLabel) =>
    getMetalBalanceLimitError(weight, currentBalance, limits, metalLabel, 'این خرید');

export const hasReachedBuyBalanceLimit = (currentBalance, limits) => {
    const remaining = getRemainingBuyCapacity(currentBalance, limits);
    return remaining !== null && remaining <= 0;
};

export const getMaximumTradeAmount = (limits, pricePerGram, currentBalance = 0) => {
    const numericPricePerGram = toPositiveNumber(pricePerGram);
    if (!numericPricePerGram) return null;

    const remainingCapacity = getRemainingBuyCapacity(currentBalance, limits);
    if (remainingCapacity === null) return null;
    if (remainingCapacity <= 0) return 0;

    return Math.ceil(remainingCapacity * numericPricePerGram);
};
