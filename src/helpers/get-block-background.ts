const getBlockBackground = (id: number): number => {
    if (id === 2) {
        return 1;
    }

    return id;
};

export default getBlockBackground;
