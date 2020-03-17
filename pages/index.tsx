import React, { useRef, useState } from 'react'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic';
import Router, { withRouter, NextRouter } from 'next/router';
import fetch from 'isomorphic-unfetch';
import PropTypes from 'prop-types';

import Head from '../components/Header'
import Spinner from '../components/Spinner';

// @ts-ignore next/dynamic doesn't play well with typed custom components.
const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
});

export const getServerSideProps: GetServerSideProps = async context => {
    const { lat, lng } = context.query;
    return {
        props: {
            latitude: lat || '',
            longitude: lng || '',
        },
    };
}

const Index = (props/*: IndexProps*/) => {
    const { router }: { router?: NextRouter } = props;
    const [latitude, setLatitude] = useState(props.latitude);
    const [longitude, setLongitude] = useState(props.longitude);
    const [loading, setLoading] = useState(false);
    const [marker, setMapMarker] = useState(null);
    const [popup, setMapPopup] = useState({
        title: '',
        text: '',
    });
    const [searchResult, setSearchResult] = useState({
        statusCode: null,
        responseTime: null,
    });

    const mapRef = useRef(null);
    const geoRef = useRef(null);

    const Search = async () => {
        let request;
        let response;
        router.push(Router.pathname, `/?lat=${latitude}&lng=${longitude}`, { shallow: true });
        setLoading(true);
        try {
            request = await fetch(`/api/search?latitude=${latitude}&longitude=${longitude}`);
            response = await request.json();
        } catch (err) {
            setSearchResult({
                statusCode: -1,
                responseTime: '0',
            });
            return {
                error: err.message,
            };
        } finally {
            setLoading(false);
        }

        setSearchResult({
            statusCode: request.status,
            responseTime: request.headers.get('X-Response-Time'),
        });
        if (request.ok) {
            setMapMarker([longitude, latitude]);
            setMapPopup({
                title: response.result.properties.officename,
                text: `${response.result.properties.district}, ${response.result.properties.state}`,
            });
            mapRef.current?.leafletElement?.once('moveend', () => {
                geoRef.current?.leafletElement?.clearLayers().addData(response.result); // Draw GeoJSON once panning animation completes.
            });
            mapRef.current?.leafletElement?.flyTo([longitude, latitude], 13, {
                animate: true,
                duration: 1, // Slightly faster panning.
            });
        }
        return response;
    };

    return (
        <div>
            <Head title="🔎 SoLongLatLong" />
            <nav className="flex items-center justify-between flex-wrap bg-purple-700 fixed shadow w-full" style={{ zIndex: 401 }}>
                <div className="hidden md:flex items-center flex-shrink-0 text-white mt-3 mr-6 object-center">
                    {/* Empty flex shrink object to move items to right. */}
                </div>
                <div className="flex items-stretch">
                    <input className="flex-1 block m-2 bg-white focus:outline-none focus:shadow-outline border border-gray-300 py-2 px-4 block w-full appearance-none leading-none" type="tel" placeholder="Latitude" value={latitude} onChange={e => setLatitude(e.target.value)} />
                    <input className="flex-1 m-2 bg-white focus:outline-none focus:shadow-outline border border-gray-300 py-2 px-4 block w-full appearance-none leading-none" type="tel" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                    <button className={`bg-white focus:outline-none focus:shadow-outline text-purple-700 font-bold py-2 px-4 m-2${loading ? ' opacity-50 cursor-not-allowed' : ''}`} type="button" disabled={loading} onClick={Search}>Search</button>
                </div>
            </nav>
            {searchResult?.statusCode &&
                <div className="fixed bottom-0 left-0 right-0 bg-purple-700" style={{ zIndex: 402 }}>
                    <div className="max-w-full rounded overflow-hidden">
                        <div className="px-6 py-4">
                            { searchResult.statusCode === 200 ?
                                <p className="text-xs text-white text-base">
                                    🥳 Result found in <code>{searchResult.responseTime}</code>
                                </p>
                                :
                                <p className="text-xs text-white text-base">
                                    { searchResult.statusCode === -1 ? '🚨Could not communicate with the server!' : null }
                                    { searchResult.statusCode === 404 ? '🙁 Could not find your coordinates in our data. Are you sure it exists?' : null }
                                    { searchResult.statusCode === 400 ? '🤯 Unable to parse your input coordinates!' : null }
                                    { searchResult.statusCode === 500 ? '⚠️ Unexpected server error!' : null }
                                </p>
                            }
                        </div>
                    </div>
                </div>
            }
            <div className="h-full w-fill pt-12">
                { loading ? <Spinner color={'#6B46C1'} size={100} style={{position: 'absolute', top: '4rem', right: '-1rem', zIndex: 403}} /> : null }
                <Map mapRef={mapRef} geoRef={geoRef} marker={marker} popup={popup} />
            </div>
        </div>
    )
};

const indexProps = {
    latitude: PropTypes.string,
    longitude: PropTypes.string,
    router: PropTypes.any,
};

Index.propTypes = indexProps;
type IndexProps = PropTypes.InferProps<typeof indexProps>;

export default withRouter(Index);
