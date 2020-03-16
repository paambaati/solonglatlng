import { createReadStream } from 'fs';
import { join } from 'path';
import getConfig from 'next/config';
import { chain } from 'stream-chain';
import { withParser } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { geoContains } from 'd3-geo';
import { validateLatLng } from '../../utils/validators';

const { serverRuntimeConfig } = getConfig();
const GEOJSON_FILE = join(serverRuntimeConfig.PROJECT_ROOT, './data/indiapostal.geojson');

function featureContains(feature, latitude: number, longitude: number) {
    // Construct a dummy FeatureCollection so d3-geo's `geoContains` can actually query it cleanly.
    const geoJSON = {
        type: 'FeatureCollection',
        name: 'pincodes',
        crs: {
            type: 'name',
            properties: {
                name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
            },
        },
        features: [feature],
        geometries: [],
    };
    return geoContains(geoJSON, [latitude, longitude]);
}

function findPincode(latitude: number, longitude: number, geoJSONFile: string = GEOJSON_FILE) {
    if (!validateLatLng(latitude, longitude)) {
        const err = new Error();
        err.name = 'InvalidCoordinatesError';
        err.message = 'Invalid coordinates!';
        err['code'] = 'ERR_INVALID_COORDINATES';
        throw err;
    }

    let matchedFeature = {};
    return new Promise((resolve, reject) => {
        const pipeline = chain([
            createReadStream(geoJSONFile),
            withParser({ filter: 'features' }),
            // @ts-ignore Weird.
            streamArray(),
        ]);

        pipeline.on('error', reject);

        pipeline.on('data', data => {
            const feature = data.value;
            const matchFound = featureContains(feature, latitude, longitude);
            if (matchFound) {
                matchedFeature = feature;
                pipeline.emit('end');
                pipeline.destroy(); // Exit early once we find a match.
            }
        });

        pipeline.on('end', () => {
            return resolve(matchedFeature);
        });
    });
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
            res.statusCode = 500;
        }
    }
    const end: [number, number] = process.hrtime(start);
    const ms: number = (end[0] * 1e9 + end[1]) / 1e6;
    if (!Object.keys(result).length) {
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
