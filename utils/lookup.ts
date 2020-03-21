import { readFile } from 'fs';
import RBush from 'rbush';

type Point = [number, number];
type Polygon = Point[];

interface GeoJSON {
    type: string;
    name: string;
    crs: CRS;
    features: Feature[];
}

interface CRS {
    type: string;
    properties: CRSProperties;
}

interface CRSProperties {
    name: string;
}

interface Feature {
    type: string;
    properties: FeatureProperties;
    geometry: Geometry;
}

interface Geometry {
    type: string;
    coordinates: Polygon[];
}

interface FeatureProperties {
    pincode: string;
    state: string;
    district: string;
    officename: string;
    officetype: string;
}

export default class GeoJSONLookup {
    private bBoxes = [];
    private polygons: Feature[] = [];
    private polyId = 0;
    private rtree!: RBush<object>;
    /**
     * GeoJSON Lookup.
     * @param filename - Path to GeoJSON file. 
     */
    public constructor(private filename: string) { }

    /**
     * Reads a file as JSON.
     * @returns File content as JSON object.
     */
    private readAsJSON(filename?: string): Promise<object> {
        return new Promise((resolve, reject) => {
            readFile(filename || this.filename, (err, data) => {
                if (err) return reject(err);
                const json = JSON.parse(data.toString());
                return resolve(json);
            });
        });
    }

    /**
     * Builds a bounding box for a given polygon,
     * with `min` and `max` values along both `X and `Y` axes.
     * @param polygon - Polygon to calculate bounding box for.
     * @returns Bounding box.
     */
    private getBoundingBox(polygon: Polygon) {
        const firstPoint = polygon[0];
        const bBox = {
            minX: firstPoint[0],
            minY: firstPoint[1],
            maxX: firstPoint[0],
            maxY: firstPoint[1],
            polyId: -1,
        };

        for (let index = 1; index < polygon.length; index++) {
            const pt = polygon[index];

            const x = pt[0];
            if (x < bBox.minX) {
                bBox.minX = x;
            } else if (x > bBox.maxX) {
                bBox.maxX = x;
            }

            const y = pt[1];
            if (y < bBox.minY) {
                bBox.minY = y;
            } else if (y > bBox.maxY) {
                bBox.maxY = y;
            }
        }
        return bBox;
    }

    /**
     * Finds if a given point is inside a given polygon.
     * Based on [ray-casting](https://en.wikipedia.org/wiki/Point_in_polygon#Ray_casting_algorithm),
     * the same technique used in SVG images. Adapted from [here](http://philliplemons.com/posts/ray-casting-algorithm).
     * @param point - Point to find.
     * @param polygon - Polygon to search for point in.
     * @returns Whether the point is in the polygon.
     */
    private isPointInPolygon(point: Point, polygon: Polygon): boolean {
        const x = point[0];
        const y = point[1];

        let isInside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) isInside = !isInside;
        }
        return isInside;
    }

    /**
     * Finds if a given point is inside a given set of hole-y polygons (a geometry).
     * @param point - Point to find.
     * @param polygons - Geometry/feature search for point in.
     * @returns Whether the point is in the geometry.
     */
    private isPointInPolygonWithHoles(point: Point, polygons: Feature): boolean {
        const mainPolygon = polygons.geometry.coordinates[0];
        if (this.isPointInPolygon(point, mainPolygon)) {
            for (let subPolyIndex = 1, len = polygons.geometry.coordinates.length; subPolyIndex < len; subPolyIndex++) {
                if (this.isPointInPolygon(point, polygons.geometry.coordinates[subPolyIndex])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Indexes the polygon and its bounding box in a local in-memory index. 
     * @param polygon - Polygon to index.
     */
    private indexPolygon(polygon: Feature): void {
        this.polygons.push(polygon);
        const bBox = this.getBoundingBox(polygon.geometry.coordinates[0]);
        bBox.polyId = this.polyId++;
        this.bBoxes.push(bBox);
    }

    /**
     * Indexes every polygon (and its bounding box) in a local in-memory index. 
     * @param polygon - Polygon(s) to index.
     */
    private indexFeature(feature: Feature): void {
        if (feature.geometry?.coordinates[0] !== undefined &&
            feature.geometry?.coordinates[0]?.length > 0) {
            switch (feature.geometry.type) {
                case 'Polygon':
                    this.indexPolygon(feature);
                    break;
                case 'MultiPolygon':
                    const childPolygons = feature.geometry.coordinates;
                    for (let index = 0; index < childPolygons.length; index++) {
                        const childPolygon = {
                            type: 'Feature',
                            properties: feature.properties,
                            geometry: {
                                type: 'Polygon',
                                coordinates: childPolygons[index]
                            }
                        };
                        // @ts-ignore
                        this.indexPolygon(childPolygon);
                    }
                    break;
                default:
                // Do nothing.
            }
        }
    }

    /**
     * Builds an in-memory [RBush](https://github.com/mourner/rbush) index.
     */
    public async index(): Promise<RBush<object>> {
        if (!this.rtree) {
            // Build index only once.
            let geojson = <GeoJSON>await this.readAsJSON();
            geojson.features.forEach(_ => this.indexFeature(_));
            this.rtree = <RBush<object>>new RBush().load(this.bBoxes);
            // Now clear variables we no longer need.
            this.bBoxes = undefined;
            geojson = undefined;
        }
        return this.rtree;
    }

    /**
     * Lookup a coordinate.
     * @param latitude
     * @param longitude
     * @returns Feature/geometry that contains the coordinate.
     */
    public lookup(latitude: number, longitude: number): Feature | undefined {
        const point: Point = [latitude, longitude];

        const bBoxes = this.rtree.search({
            minX: latitude,
            minY: longitude,
            maxX: latitude,
            maxY: longitude,
        });

        // Enumerate over each matching polygon based on the searched bounding boxes.
        const polygons = bBoxes.map((_, index) => {
            return this.polygons[bBoxes[index]['polyId']];
        });

        // Find the first intersecting polygon.
        return polygons.find(polygon => {
            return this.isPointInPolygonWithHoles(point, polygon);
        });
    }
}
