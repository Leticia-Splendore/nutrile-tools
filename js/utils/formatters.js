export function formatWeight(value) {
  return `${Math.ceil(value)}g`;
}

export function getMealLabel(count) {
  return count === 1 ? 'refeição' : 'refeições';
}