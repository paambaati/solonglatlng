import { join } from 'path';
import getConfig from 'next/config';
import { validateLatLng } from '../../utils/validators';
import GeoJSONLookup from '../../utils/lookup';

const { serverRuntimeConfig } = getConfig();
const GEOJSON_FILE = join(serverRuntimeConfig.PROJECT_ROOT, './data/indiapostal.geojson');
const lookup = new GeoJSONLookup(GEOJSON_FILE);

async function findPincode(latitude: number, longitude: number, geoJSONFile: string = GEOJSON_FILE) {
    if (!validateLatLng(latitude, longitude)) {
        const err = new Error();
        err.name = 'InvalidCoordinatesError';
        err.message = 'Invalid coordinates!';
        err['code'] = 'ERR_INVALID_COORDINATES';
        throw err;
    }

    await lookup.index();
    return lookup.lookup(latitude, longitude);
}

export default async (req, res) => {
    let result;
    const { latitude, longitude } = req.query;
    const start: [number, number] = process.hrtime();
    try {
        result = await findPincode(latitude, longitude);
        res.statusCode = 200;
    } catch (err) {
        result = {
            error: err.message,
        }
        if (err.code === 'ERR_INVALID_COORDINATES') {
            res.statusCode = 400;
        } else {
            console.error(`Error looking up coordinates [${latitude}, ${longitude}]`, err);
            res.statusCode = 500;
        }
    }
    const end: [number, number] = process.hrtime(start);
    const ms: number = (end[0] * 1e9 + end[1]) / 1e6;
    if (!result) {
        res.statusCode = 404;
    }
    const response = {
        query: {
            latitude,
            longitude,
        },
        result,
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Response-Time', `${ms}ms`);
    if (res.statusCode < 300) res.setHeader('Cache-Control', 'private, max-age=86400'); // Cache successful responses for 1 day.
    return res.json(response);
};
