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
