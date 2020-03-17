# solonglatlng

![CI](https://github.com/paambaati/solonglatlng/workflows/CI/badge.svg) ![CD](https://github.com/paambaati/solonglatlng/workflows/CD/badge.svg)

A simple webapp that lets you search a coordinate on a GeoJSON layered on top of a Map view.

### 🛠️ Setup

Before you run this app, make sure you have [Node.js](https://nodejs.org/en/) installed. [`yarn`](https://yarnpkg.com/lang/en/docs/install) is recommended, but can be used interchangeably with `npm`. If you'd prefer running everything inside a Docker container, see the [Docker setup](#docker-setup) section.

```bash
git clone https://github.com/paambaati/solonglatlng
cd solonglatlng
yarn install
```

#### 👩🏻‍💻 Usage
```bash
yarn run dev
```

You can then access the app at http://localhost:3000

This URL should return a valid search with the bundled GeoJSON — http://localhost:3000/?lat=80.1256269&lng=12.9262308

### 🐳 Docker Setup

```bash
docker build -t solonglatlng .
docker run -p 3000:3000 -ti solonglatlng
```

## 🧩 Design

The app is built with [Next.js](https://nextjs.org), [react-leaflet](https://react-leaflet.js.org/) and [stream-json](https://www.npmjs.com/package/stream-json).

Next.js is used to build the app on top of React.js and Next.js's built-in [SSR](https://nextjs.org/features/server-side-rendering)-powered API.

### 🗺️ Map Operations

The Map operations are kept intentionally simple.

1. The original GeoJSON is scanned linearly, so searches are `O(n)` complexity. For very large datasets, it is recommended to either run the queries on top of a [GIS](https://en.wikipedia.org/wiki/Geographic_information_system)-capable database like PostgreSQL or build a custom index on top of [`R` trees](https://en.wikipedia.org/wiki/R*_tree) or [`k-d` trees](https://en.wikipedia.org/wiki/K-d_tree).

2. Instead of writing our own logic to find if a given polygon contains a point, I've used the D3 library's [`geoContains()`](https://github.com/d3/d3-geo#geoContains) method.

### 🎨 UI

The UI is built on top of the wonderful [Tailwind CSS](https://tailwindcss.com/) library.

1. Tailwind CSS is a radical rethinking of how we write CSS.

    Instead of using fullblown UI libraries like Bootstrap or Material UI, Tailwind gives you only the building blocks ("utility classes") to build your own UI components, without having to fight overriding opinionated styles. It lets us extract component classes into custom components, giving us a [design system](https://medium.muz.li/what-is-a-design-system-1e43d19e7696) from day 1. It also allows for lesser cognitive overload, as scanning the classes gives us a clear picture of what the component does exactly.

### 🚚 CI/CD

The CI/CD setup is straightforward.

1. On every commit, [Github Actions](https://github.com/features/actions) is used to continually build the app, package it into a Docker image and push it to [Heroku's container registry](https://devcenter.heroku.com/articles/container-registry-and-runtime).

    <[See CI pipeline](https://github.com/paambaati/solonglatlng/actions?query=workflow%3ACI)>

2. On a `git tag` or a release, the latest image is deployed to Heroku and available at https://solonglatlng.herokuapp.com/

    <[See CD pipeline](https://github.com/paambaati/solonglatlng/actions?query=workflow%3ACD)>

On a production grade pipeline, we'll be tagging the Docker image with the `git` tag for traceability.

### 🕵 Missing Pieces & Gotchas.

1. Unit tests.

    Though critical, for a lack of time, I did not write unit tests.

2. Search API will timeout in 30 seconds.

    Heroku's free public dyno times out after 30 seconds, so any search API request that takes longer than that will timeout.

    For testing, you can use these 2 URLs —

    1. https://solonglatlng.herokuapp.com/?lat=77.2025745&lng=27.7811323 (matches first `Feature` in the GeoJSON).
    2. https://solonglatlng.herokuapp.com/?lat=73.1991148&lng=23.3492689 (matches after a few hundred `Feature`s).

3. The original sample GeoJSON was > 200 MB, but [Github only allows checking in files under 100 MB](https://help.github.com/en/github/managing-large-files/conditions-for-large-files). To work around this, I've downsampled the GeoJSON to 2 locations and checked the file in, but when building the Docker image, I'm [downloading the original GeoJSON](https://github.com/paambaati/solonglatlng/blob/9178622b36437a9c9588fd2e9ee88fb02ee5e208/Dockerfile#L14) from a copy on my Dropbox.
