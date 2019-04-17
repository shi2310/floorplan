export default {
  name: '地图平台-黑芝麻智能科技',
  osmTile: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    zoom: 11,
    lat: 30.601,
    lon: 114.4027,
  },
  overpassapi: '//overpass-api.de/api/interpreter',
  api: process.env.API,
};
