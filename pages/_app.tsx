import React from 'react';
import App from 'next/app';

/* purgecss start ignore */
import 'tailwindcss/dist/base.css';
/* purgecss end ignore */
import 'tailwindcss/dist/components.css';
import 'tailwindcss/dist/utilities.css';
import 'leaflet/dist/leaflet.css';

class SoLongLatLong extends App {
  render() {
    const { Component, pageProps } = this.props;
    return <Component {...pageProps} />;
  }
}

export default SoLongLatLong;
