export default function getColorFromValue(value: number) {
    if (value < 0) value = 0;
    if (value > 1) value = 1;
    const colorComponent = Math.round((1 - value) * 255);
    const hexColor = (colorComponent << 16) | (colorComponent << 8) | colorComponent;
    return `0x${hexColor.toString(16).padStart(6, '0')}`;
}
