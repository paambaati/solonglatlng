function getNumber(x: number | string) {
    if (typeof x === 'number') return x;
    return parseFloat(x);
}

function isLatitude(n: number) {
    return (n >= -90) && (n <= 90);
}

function isLongitude(n: number) {
    return (n >= -180) && (n <= 180);
}

export function validateLatLng(latitude: any, longitude: any) {
    const validTypes = ['string', 'number'];
    if (validTypes.includes(typeof (latitude)) && validTypes.includes(typeof (longitude))) {
        return isLatitude(getNumber(latitude)) && isLongitude(getNumber(longitude));
    }
    return false;
}
