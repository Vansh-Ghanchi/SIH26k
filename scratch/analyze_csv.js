const fs = require('fs');
const readline = require('readline');

async function analyze() {
  const fileStream = fs.createReadStream('c:/Users/VANSH/OneDrive/Desktop/SIH26k/SIH_PAIMANA_July2025_March2026_24_COLUMNS_FINAL.csv');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineCount = 0;
  let headers = [];
  const reportingMonths = new Set();
  const ministries = new Set();
  const sectors = new Set();
  const states = new Set();
  const projectIds = new Set();
  let totalCostOriginal = 0;
  let totalCostRevised = 0;
  let totalExpenditure = 0;
  let okCount = 0;
  let missingStateCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) {
      headers = line.split(',');
      continue;
    }
    if (!line.trim()) continue;

    // Simple CSV parser for standard quotes
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        cells.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    cells.push(cur);

    if (cells.length >= 24) {
      const [
        reporting_month, source_page, sl_no, project_id, project_name,
        ministry, sector, implementing_agency, state_ut,
        approval_date, start_date, original_completion_date, revised_completion_date,
        original_cost_cr, revised_cost_cr, cumulative_expenditure_cr, physical_progress_pct,
        legacy_ocms_code, pmgid, cost_revision_pct, deadline_revision_flag,
        project_status, status_at_month_end, data_quality_flag
      ] = cells;

      reportingMonths.add(reporting_month);
      if (ministry) ministries.add(ministry);
      if (sector) sectors.add(sector);
      if (state_ut) states.add(state_ut);
      if (project_id) projectIds.add(project_id);

      const origCost = parseFloat(original_cost_cr) || 0;
      const revCost = parseFloat(revised_cost_cr) || 0;
      const exp = parseFloat(cumulative_expenditure_cr) || 0;

      totalCostOriginal += origCost;
      totalCostRevised += revCost;
      totalExpenditure += exp;

      if (data_quality_flag === 'OK') okCount++;
      if (data_quality_flag && data_quality_flag.includes('missing:state_ut')) missingStateCount++;
    }
  }

  console.log('=== DATASET HEALTH & ANALYSIS SUMMARY ===');
  console.log('Total Rows:', lineCount - 1);
  console.log('Total Columns:', headers.length);
  console.log('Columns List:', headers);
  console.log('\nReporting Months (' + reportingMonths.size + ' months):', Array.from(reportingMonths).sort());
  console.log('Unique Ministries (' + ministries.size + '):', Array.from(ministries).slice(0, 10));
  console.log('Unique Sectors (' + sectors.size + '):', Array.from(sectors));
  console.log('Unique States (' + states.size + '):', Array.from(states).slice(0, 15));
  console.log('Unique Project IDs:', projectIds.size);
  console.log('Data Quality Flag OK count:', okCount);
  console.log('Missing State Flag count:', missingStateCount);
}

analyze().catch(console.error);
