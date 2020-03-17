import React, { useEffect } from 'react';
import { Map as RLMap, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { Icon as LIcon } from 'leaflet';
import PropTypes from 'prop-types';

const Map = (props/*: MapProps*/) => {
  useEffect(() => {
    // @ts-ignore prototype._getIconUrl isn't exposed by default.
    delete LIcon.Default.prototype._getIconUrl;
    LIcon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    });
  }, []);

  return (
    <div className="map-root">
      <RLMap
        center={props.center}
        zoom={props.zoom}
        style={props.style}
        ref={props.mapRef}
        animate={true}
        attributionControl={false}>
        <TileLayer
          attribution={null}
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <GeoJSON data={null} ref={props.geoRef}></GeoJSON>
        {props.marker && <Marker
          draggable={false}
          position={props.marker}
          animate={true}
        >
          <Popup minWidth={90}>
            <div className="max-w-sm overflow-hidden">
              <div className="px-4 py-2">
                <div className="font-bold text-xl mb-2">{props.popup.title}</div>
                <p className="text-gray-700 text-base">
                  {props.popup.text}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>}
      </RLMap>
      {/* 
        // @ts-ignore */}
      <style jsx>{`
          .map-root {
            height: 100%;
          }
          .popup-title {
            font-size: 1rem;
            font-weight: 600;
          }
          .popup-text {
            font-weight: 400;
          }
        `}
      </style>
    </div>
  );
};

const mapProps = PropTypes.shape({
  mapRef: PropTypes.object,
  geoRef: PropTypes.object,
  center: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  zoom: PropTypes.number.isRequired,
  style: PropTypes.object,
  marker: PropTypes.arrayOf(PropTypes.number.isRequired),
  popup: PropTypes.shape({
    title: PropTypes.string,
    text: PropTypes.string,
  }),
});

Map.propTypes = mapProps;
type MapProps = PropTypes.InferProps<typeof mapProps>;

Map.defaultProps = {
  center: [20.5937, 78.9629], // Nagpur, India's center.
  zoom: 4,
  style: { height: '100vh' },
  mapRef: null,
  geoRef: null,
};

export default Map;
