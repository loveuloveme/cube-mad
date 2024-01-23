export default function animatedValue(
    current: number,
    target: number,
    deltaValue: number,
    delta: number,
): number {
    const mult = current > target ? 1 : -1;

    const res = current + deltaValue * mult * delta;
    if (res > target) return target;

    return res;
}
