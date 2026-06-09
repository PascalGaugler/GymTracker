export function customWeightAxis(values: number[]): {
  domain: [number, number]
  ticks: number[]
} {
  if (values.length === 0) return { domain: [0, 10], ticks: [0, 5, 10] }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max((max - min) * 0.1, 2)
  const lo = Math.max(0, Math.floor((min - pad) / 5) * 5)
  let hi = Math.ceil((max + pad) / 5) * 5
  if (hi <= lo) hi = lo + 5
  const range = hi - lo
  const step = range <= 20 ? 5 : range <= 50 ? 10 : range <= 120 ? 20 : 25
  const ticks: number[] = []
  for (let v = lo; v <= hi; v += step) ticks.push(v)
  return { domain: [lo, hi], ticks }
}
