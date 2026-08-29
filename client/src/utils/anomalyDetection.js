export const calculateAverage = (values = []) => {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + Number(value), 0);
  return Number((total / values.length).toFixed(2));
};

export const calculatePercentDifference = (currentValue, baselineValue) => {
  if (!baselineValue) return 0;
  return Number((((currentValue - baselineValue) / baselineValue) * 100).toFixed(2));
};

export const analyzeInvoicePrice = ({ history = [], currentPrice, thresholdPercent = 25 }) => {
  if (!history.length || currentPrice === undefined || currentPrice === null || Number.isNaN(Number(currentPrice))) {
    return {
      isAnomaly: false,
      average: 0,
      differencePercent: 0,
      thresholdPercent,
      message: 'Not enough price history to compare.',
      riskScore: 0,
    };
  }

  const cleanHistory = history
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value) && value > 0);

  if (cleanHistory.length < 3) {
    return {
      isAnomaly: false,
      average: calculateAverage(cleanHistory),
      differencePercent: 0,
      thresholdPercent,
      message: 'Need at least 3 historical prices for a trustworthy anomaly check.',
      riskScore: 0,
    };
  }

  const average = calculateAverage(cleanHistory);
  const differencePercent = calculatePercentDifference(Number(currentPrice), average);
  const isAnomaly = Math.abs(differencePercent) >= thresholdPercent;

  return {
    isAnomaly,
    average,
    differencePercent,
    thresholdPercent,
    message: isAnomaly
      ? `Price is ${Math.abs(differencePercent)}% above the vendor's historical average of $${average.toFixed(2)}.`
      : `Price remains within the normal range around $${average.toFixed(2)}.`,
    riskScore: Math.min(100, Math.max(0, Math.round((Math.abs(differencePercent) / 100) * 100))),
  };
};
