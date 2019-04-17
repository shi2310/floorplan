import L from 'leaflet';
import _ from 'lodash';
import osmtogeojson from 'osmtogeojson';
import { getBuildings } from 'services/overlay';
import { getBBoxString } from 'utils';

const layerBox = L.featureGroup();
let map = null;
let focusBuilding = null;
let buildingID = null;
let lastMaxBBox = null;
let buildingClick = null;

const polygonStyles = {
  fillColor: '#13c2c2',
  dashArray: '10,5',
  stroke: false,
  fillOpacity: 0.1,
  fill: true,
  interactive: true,
};

const checkPolygonStyles = {
  color: '#13c2c2',
  stroke: true,
  weight: 1,
  fill: false,
  interactive: false,
};

export function setFocusBuildingID(_buildingID) {
  if (_buildingID) {
    buildingID = _buildingID;
  }
}

export function resetFocusBuilding() {
  if (focusBuilding) {
    focusBuilding.setStyle(polygonStyles);
    focusBuilding = null;
  }
}

const setFocusBuilding = (building, id) => {
  if (!building || !id) return;
  buildingID = id;
  focusBuilding = building;
  focusBuilding.setStyle(checkPolygonStyles);
};

async function onBuildingClick(id, e) {
  const building = e.target;
  if (focusBuilding === building) return;
  if (_.isFunction(buildingClick) && (await buildingClick(id))) return;

  // change focus building styles
  resetFocusBuilding();
  setFocusBuilding(building, id);
}

function renderBuildings(buildings = []) {
  layerBox.clearLayers();
  _.each(buildings, ({ id, latlngs = [] }) => {
    if (id > 0 && _.isArray(latlngs)) {
      // if has set buildingID
      if (buildingID === id) {
        // Keep the focus building when redrawing
        if (focusBuilding) {
          layerBox.addLayer(focusBuilding);
        } else {
          const line = L.polygon(latlngs, polygonStyles).on(
            'click',
            onBuildingClick.bind(null, id)
          );
          layerBox.addLayer(line);
          focusBuilding = line;
          focusBuilding.setStyle(checkPolygonStyles);
        }
      } else {
        const line = L.polygon(latlngs, polygonStyles).on('click', onBuildingClick.bind(null, id));
        layerBox.addLayer(line);
      }
    }
  });
}

function bbox2latLngBounds(bbox) {
  const lastBBox = _.split(bbox, ',');
  if (lastBBox.length !== 4) return;
  return L.latLngBounds([[lastBBox[1], lastBBox[0]], [lastBBox[3], lastBBox[2]]]);
}

function hasNewData(bbox) {
  if (!lastMaxBBox) {
    lastMaxBBox = bbox;
    return true;
  }

  const lastBBox = bbox2latLngBounds(lastMaxBBox);
  const curBBox = bbox2latLngBounds(bbox);
  const needLoad = !(lastBBox && curBBox && lastBBox.contains(curBBox));
  if (needLoad) lastMaxBBox = bbox;

  return needLoad;
}

function setSource(data = []) {
  try {
    return _.reduce(
      data,
      (pre, cur) => [
        ...pre,
        {
          id: cur.properties.id,
          latlngs: _.map(cur.geometry.coordinates, line => _.map(line, point => _.reverse(point))),
        },
      ],
      []
    );
  } catch (error) {
    return null;
  }
}

function loadBuildings() {
  const _bbox = getBBoxString(map);
  if (!hasNewData(_bbox)) return;

  getBuildings({
    data: `[bbox][out:json];(way[building=yes];>;<;);out;&bbox=${_bbox}`,
  }).then(res => {
    if (res.success && res.data) {
      const geoJSON = osmtogeojson(res.data, { flatProperties: false });
      if (geoJSON && _.isArray(geoJSON.features)) {
        console.log(geoJSON.features);
        const datasource = setSource(geoJSON.features);
        console.log(datasource);
        renderBuildings(datasource);
      }
    }
  });
}

function onMapMove() {
  // save zoom
  // const zoom = map.getZoom();
  // if (zoom >= 16) {
  //   loadBuildings();
  // }
  loadBuildings();
}

export function initMap(_map, _buildingClick) {
  if (!_map) throw new Error('map is null!');
  map = _map;
  layerBox.addTo(map);
  // bind event
  map.on('move', _.debounce(onMapMove, 200)); // debounce request data
  // load data
  onMapMove();
  buildingClick = _buildingClick;
  return layerBox;
}

export function getFocusBuilding() {
  return focusBuilding;
}
