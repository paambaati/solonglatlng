import React from 'react';
import NextHead from 'next/head';
import { string } from 'prop-types';

const defaultDescription = '';

const Head = props => (
  <NextHead>
    <meta charSet="UTF-8" />
    <title>{props.title || ''}</title>
    <meta
      name="description"
      content={props.description || defaultDescription}
    />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    {/* <script type="text/javascript" dangerouslySetInnerHTML={`
      var canvas = document.createElement('canvas');
      canvas.height = 64;
      canvas.width = 64;
  
      var ctx = canvas.getContext('2d');
      ctx.font = '64px serif'
      ctx.fillText('🔎', 0, 64);
  
      var favicon = document.querySelector('link[rel=icon]');
      favicon.href = canvas.toDataURL();
    `}>
    </script> */}
  </NextHead>
)

Head.propTypes = {
  title: string,
  description: string,
  url: string,
  ogImage: string
};

export default Head;
