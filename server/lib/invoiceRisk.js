export function assessInvoiceRisk({ amount, duplicateInvoiceNumber }) {
  const findings = [];
  let score = 0;

  if (duplicateInvoiceNumber) {
    score += 70;
    findings.push({
      code: "POSSIBLE_DUPLICATE",
      severity: "high",
      message: "An invoice with this number has already been submitted by your account.",
    });
  }

  if (amount >= 10000) {
    score += 35;
    findings.push({
      code: "HIGH_VALUE",
      severity: "high",
      message: "Invoice total is at least $10,000 and requires manual review.",
    });
  } else if (amount >= 5000) {
    score += 30;
    findings.push({
      code: "ELEVATED_VALUE",
      severity: "medium",
      message: "Invoice total is at least $5,000 and should be reviewed against policy.",
    });
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