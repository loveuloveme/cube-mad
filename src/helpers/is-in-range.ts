export default function isInRange(x1: number, x2: number, x: number): boolean {
    //console.log(x1, x2, x, x1 <= x && x <= x2);
    // 684 716 704 false
    // 684 <= 704 && 704 <= 716
    return x1 < x && x < x2;
}
