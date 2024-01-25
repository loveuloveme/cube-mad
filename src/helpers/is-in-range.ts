export default function isInRange(ax: number, bx: number, cx: number, dx: number): boolean {
    if (bx < ax || dx < cx) {
        [ax, bx] = [bx, ax];
        [cx, dx] = [dx, cx];
    }
    return Math.max(ax, cx) <= Math.min(bx, dx);
}
