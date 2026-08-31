const fs = require('fs');
const readline = require('readline');

async function analyzeFeatures() {
  const fileStream = fs.createReadStream('c:/Users/VANSH/OneDrive/Desktop/SIH26k/features.csv');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineCount = 0;
  let headers = [];
  const months = new Set();
  const states = new Set();
  const ministries = new Set();
  const agencies = new Set();
  let highRiskCount = 0;
  let deadlineSlipCount = 0;
  let costEscalationCount = 0;
  let progressStallCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) {
      headers = line.split(',');
      continue;
    }
    if (!line.trim()) continue;

    const cells = line.split(',');
    if (cells.length >= 37) {
      const month = cells[1];
      const ministry = cells[3];
      const agency = cells[5];
      const state = cells[6];
      const stall = parseInt(cells[30]) || 0;
      const y_cost = parseInt(cells[33]) || 0;
      const y_dead = parseInt(cells[34]) || 0;
      const y_risk = parseInt(cells[35]) || 0;

      months.add(month);
      states.add(state);
      ministries.add(ministry);
      agencies.add(agency);

      if (stall === 1) progressStallCount++;
      if (y_cost === 1) costEscalationCount++;
      if (y_dead === 1) deadlineSlipCount++;
      if (y_risk === 1) highRiskCount++;
    }
  }

  console.log('=== FEATURES.CSV ANALYSIS SUMMARY ===');
  console.log('Total Feature Rows:', lineCount - 1);
  console.log('Total Feature Columns (37):', headers.length);
  console.log('Months covered (' + months.size + '):', Array.from(months).sort());
  console.log('Unique States (' + states.size + '):', Array.from(states).slice(0, 10));
  console.log('Unique Agencies (' + agencies.size + '):', Array.from(agencies).slice(0, 10));
  console.log('Target Label y_high_risk Positive Count:', highRiskCount, '(' + ((highRiskCount / (lineCount - 1)) * 100).toFixed(1) + '%)');
  console.log('Target Label y_deadline_slip Positive Count:', deadlineSlipCount, '(' + ((deadlineSlipCount / (lineCount - 1)) * 100).toFixed(1) + '%)');
  console.log('Target Label y_cost_escalation Positive Count:', costEscalationCount, '(' + ((costEscalationCount / (lineCount - 1)) * 100).toFixed(1) + '%)');
  console.log('Progress Stall Events (Lag Warning):', progressStallCount);
}

analyzeFeatures().catch(console.error);
