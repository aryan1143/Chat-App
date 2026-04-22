export const setDataLocal = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
}

export const getDataLocal = (key) => {
    const data = localStorage.getItem(key);
    return JSON.parse(data);
}