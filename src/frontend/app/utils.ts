
const parseHash = (): URLSearchParams | null => {
    const fakeLocation = window.location.hash.replace('#', '');
    try {
        return new URLSearchParams(fakeLocation);
    } catch {
        return null;
    }
};

export const getHashParam = (key: string): string | null => {
    const params = parseHash();
    if (!params) { return null; }
    return params.get(key);
};

export const removeHashParam = (key: string): string => {
    const params = parseHash();
    if (!params) { return ''; }
    params.delete(key);
    return `#${params.toString()}`;
};

export const setHashParam = (key: string, value: string | number | boolean): string => {
    const params = parseHash();
    if (!params) { return ''; }
    params.set(key, `${value}`);
    return `#${params.toString()}`;
};
