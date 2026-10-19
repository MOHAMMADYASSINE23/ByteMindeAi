export function assessInvoiceRisk({ amount, duplicateInvoiceNumber, vendorHistory }) {
  const findings = [];
  let score = 0;

  const currentAmount = Number(amount) || 0;
  const vendorHistorySummary = vendorHistory && Number.isFinite(Number(vendorHistory.averageAmount))
    ? vendorHistory
    : null;

  let hasVendorOutlier = false;

  if (vendorHistorySummary && vendorHistorySummary.count > 0) {
    const averageAmount = Number(vendorHistorySummary.averageAmount);
    const maxAmount = Number(vendorHistorySummary.maxAmount ?? averageAmount);
    const historicalThreshold = averageAmount > 0 ? averageAmount * 1.75 : 0;

    if (currentAmount >= Math.max(historicalThreshold, maxAmount * 1.25)) {
      hasVendorOutlier = true;
      score += 65;
      findings.push({
        code: "VENDOR_HISTORY_OUTLIER",
        severity: "high",
        message: `This invoice is substantially above the typical spend pattern for this vendor (${averageAmount ? `$${averageAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "recent vendor history"}).`,
      });
    }
  }

  if (duplicateInvoiceNumber) {
    score += 70;
    findings.push({
      code: "POSSIBLE_DUPLICATE",
      severity: "high",
      message: "An invoice with this number has already been submitted by your account.",
    });
  }

  if (currentAmount >= 10000) {
    score += 35;
    if (!hasVendorOutlier) {
      findings.push({
        code: "HIGH_VALUE",
        severity: "high",
        message: "Invoice total is at least $10,000 and requires manual review.",
      });
    }
  } else if (currentAmount >= 5000) {
    score += 30;
    if (!hasVendorOutlier) {
      findings.push({
        code: "ELEVATED_VALUE",
        severity: "medium",
        message: "Invoice total is at least $5,000 and should be reviewed against policy.",
      });
    }
  }

  if (findings.length === 0) {
    findings.push({
      code: "NO_RULES_TRIGGERED",
      severity: "low",
      message: "No configured duplicate or high-value rule was triggered.",
    });
  }

  const riskScore = Math.min(score, 100);
  return {
    riskScore,
    riskLevel: riskScore >= 70 ? "high" : riskScore >= 30 ? "medium" : "low",
    status: riskScore >= 30 ? "needs_review" : "ready_for_review",
    findings,
  };
}