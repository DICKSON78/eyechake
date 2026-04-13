const getStatusLabel = (result, status, target = 0) => {
  if (result === 0 || result === '0') return 'No count';
  if (status === 'default' && target === 0) return 'Please set target';
  let percentage = 0;
  if (typeof result === 'string' && result.includes('%')) {
    percentage = parseInt(result.replace('%', ''));
  } else if (typeof result === 'number') {
    percentage = result;
  }
  if (percentage >= 75) return 'Above';
  else if (percentage >= 50) return 'Average';
  else return 'Below';
};

const getProgressValue = (result, target) => {
  if (typeof result === 'string' && result.includes('%')) {
    return parseInt(result.replace('%', ''));
  }
  // Extract number from string like "2 units" or "2 units"
  const resultNum = typeof result === 'string' ? parseFloat(result.replace(/[^\d.]/g, '')) : Number(result) || 0;
  const targetNum = typeof target === 'string' ? parseFloat(target.replace(/[^\d.]/g, '')) : Number(target) || 0;
  if (targetNum === 0) return 0;
  return Math.min((resultNum / targetNum) * 100, 100);
};
