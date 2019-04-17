import React, { PureComponent } from 'react';
import L from 'leaflet';
import config from 'config';
import styles from './style.less';

const lsMaplat = 'map_center_lat';
const lsMaplon = 'map_center_lon';
const lsMapzoom = 'map_zoom';

class Map extends PureComponent {
  initMap = dom => {
    if (!dom) return;
    const lat = window.localStorage.getItem(lsMaplat);
    const lon = window.localStorage.getItem(lsMaplon);
    const zoom = window.localStorage.getItem(lsMapzoom);

    const osmTile = config.osmTile || {};
    this.map = L.map(dom, {
      zoomControl: false,
      worldCopyJump: true,
      doubleClickZoom: false, // 禁止双击放大
    }).setView([lat || osmTile.lat, lon || osmTile.lon], zoom || osmTile.zoom);

    this.map.on('moveend', this.onMapMoveEnd);

    this.initLayer(osmTile.url);

    // callback
    if (this.props.onLoaded instanceof Function) this.props.onLoaded(this.map);
  };

  initLayer = tileUrl => {
    // osm
    L.tileLayer(tileUrl, {
      attribution: `<a href='http://bst.ai'>夏日天空智能科技</a>`,
      maxZoom: 19,
    }).addTo(this.map);
  };

  onMapMoveEnd = () => {
    // save zoom
    const zoom = this.map.getZoom();
    window.localStorage.setItem(lsMapzoom, zoom);

    // save center coord
    const center = this.map.getCenter();
    window.localStorage.setItem(lsMaplat, center.lat);
    window.localStorage.setItem(lsMaplon, center.lng);
  };

  render() {
    return <div ref={this.initMap} className={styles.map} />;
  }
}

export default Map;
