export function formatNumber(num) {
  if (num === null || num === undefined) {
    return num;
  }

  const numValue = typeof num === 'string' ? parseFloat(num) : Number(num);
  
  if (isNaN(numValue) || numValue === 0) {
    return num;
  }

  const absNum = Math.abs(numValue);
  const sign = numValue < 0 ? '-' : '';

  if (absNum >= 1e15) {
    return `${sign}${(absNum / 1e15).toFixed(2)} quadrillion`;
  } else if (absNum >= 1e12) {
    return `${sign}${(absNum / 1e12).toFixed(2)} trillion`;
  } else if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(2)} billion`;
  } else if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(2)} million`;
  } else if (absNum >= 1000) {
    return numValue.toLocaleString();
  } else {
    return numValue;
  }
}

