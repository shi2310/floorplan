import L from 'leaflet';
import _ from 'lodash';
import { dotControle } from './dot';
import { moveControle } from './move';
import { TransformedImage } from './transImg';

export const AffineOverlay = L.Layer.extend({
  initialize(map, image) {
    this._map = map;
    this._img = image;
    const pane = this.getPane();
    this._canvas = L.DomUtil.create('canvas');
    this._canvas.width = this._img.width;
    this._canvas.height = this._img.height;
    this._canvas.style.position = 'absolute';
    this._canvas.style['pointer-events'] = 'none';
    this._canvas.style['z-index'] = '1000';
    this._ctx = this._canvas.getContext('2d');
    pane.appendChild(this._canvas);

    this._ti = new TransformedImage(this._img);

    const center = this._map.getCenter();
    // latLngToLayerPoint经纬度转换为屏幕坐标
    const centerPoint = this._map.latLngToLayerPoint(center);
    const x = centerPoint.x - this._img.width / 2;
    const y = centerPoint.y - this._img.height / 2;
    this._dots = [];
    const lt = dotControle(pane, 'lt');
    this._dotBindEvent(lt);
    this._dots.push(lt);

    const rt = dotControle(pane, 'rt');
    rt.style['background-color'] = 'blue';
    this._dotBindEvent(rt);
    this._dots.push(rt);

    const rb = dotControle(pane, 'rb');
    rb.style['background-color'] = 'yellow';
    this._dotBindEvent(rb);
    this._dots.push(rb);

    // 3个控制点必须在中心控制点构建之前设置位置，否则中心控制点不能计算出所在位置
    lt.moveTo(x, y);
    rt.moveTo(x + this._img.width, y);
    rb.moveTo(x + this._img.width, y + this._img.height);

    // 中心控制点根据3个控制点位置计算位置以及构建联动
    this._mover = moveControle(pane, this._dots);
    L.DomEvent.on(this._mover, 'dragstart', this.setMapDraggable_.bind(this, false));
    L.DomEvent.on(this._mover, 'dragend', this.setMapDraggable_.bind(this, true));
  },
  _dotBindEvent(_dot) {
    L.DomEvent.on(_dot, 'dragstart', this.setMapDraggable_.bind(this, false));
    L.DomEvent.on(_dot, 'dragend', this.setMapDraggable_.bind(this, true));
    // 点调用setPoint，触发通知前端的事件
    L.DomEvent.on(_dot, 'change', this.dotChange.bind(this));
    // 点的构建会触发整个canvas中图片的构建
    L.DomEvent.on(_dot, 'render', this.randerCanvas.bind(this));
  },
  dotChange(e) {
    const latlng = this._map.layerPointToLatLng(new L.Point(e.target.x, e.target.y));
    const dot = { dot: { [e.target.key]: latlng } };
    this.fire('dotChange', dot);
  },
  randerCanvas() {
    // if (this.renderTimeout) return;
    // this.renderTimeout = window.setTimeout(() => {
    this._forceRenderCanvas();
    // }, 1);
  },
  _forceRenderCanvas() {
    const dots = this._dots;
    const virtualDot = this.getVirtualDot(dots);
    const canvasWidth = this.getMaxLength(dots[0].x, dots[1].x, dots[2].x, virtualDot.x);
    const canvasHeight = this.getMaxLength(dots[0].y, dots[1].y, dots[2].y, virtualDot.y);
    // reset canvas width and height
    this._canvas.width = canvasWidth;
    this._canvas.height = canvasHeight;
    // make sure the whole image is in view.
    const topLeft = this.getTopLeftPoint(dots, virtualDot);
    this._canvas.style.top = `${topLeft.y}px`;
    this._canvas.style.left = `${topLeft.x}px`;

    const points = [];
    _.each(dots, dot => {
      points.push({ x: dot.x, y: dot.y });
    });

    this._ctx.setTransform(1, 0, 0, 1, 0, 0);
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._ti.setTranslate(-topLeft.x, -topLeft.y);
    this._ti.draw(this._ctx, points);

    delete this.renderTimeout;
  },
  getDotsLatLng() {
    const result = {};
    const dots = this._dots;
    _.each(dots, o => {
      const latlng = this._map.layerPointToLatLng(new L.Point(o.x, o.y));
      result[o.key] = latlng;
    });
    return result;
  },
  removeChilds() {
    this._canvas.remove();
    _.map(this._dots, dot => {
      dot.remove();
    });
    this._mover.remove();
    this.remove();
  },
  dotMoveByLatLng(_key, lat, lng) {
    const dots = this._dots;
    const point = this._map.latLngToLayerPoint(new L.latLng(lat, lng));
    _.find(dots, { key: _key }).moveTo(point.x, point.y);
    const x = (dots[0].x + dots[2].x) / 2;
    const y = (dots[0].y + dots[2].y) / 2;
    this._mover.moveTo(x, y);
  },
  getTopLeftPoint(dots, virtualDot) {
    return new L.Point(
      Math.min(dots[0].x, dots[1].x, dots[2].x, virtualDot.x),
      Math.min(dots[0].y, dots[1].y, dots[2].y, virtualDot.y)
    );
  },
  getVirtualDot(dots) {
    return new L.Point(dots[0].x + dots[2].x - dots[1].x, dots[0].y + dots[2].y - dots[1].y);
  },
  getMaxLength(a, b, c, d) {
    const len1 = Math.abs(a - b);
    const len2 = Math.abs(a - c);
    const len3 = Math.abs(a - d);
    const len4 = Math.abs(b - c);
    const len5 = Math.abs(b - d);
    const len6 = Math.abs(c - d);
    return _.max([len1, len2, len3, len4, len5, len6]);
  },
  setMapDraggable_(draggable) {
    if (draggable === true) {
      this._map.dragging.enable();
    } else {
      this._map.dragging.disable();
    }
  },
  setOpacity(opacity) {
    this._canvas.style.opacity = opacity;
  },
  toDataURL() {
    if (this._canvas) {
      const ext = this._img.src.substring(this._img.src.lastIndexOf('.') + 1).toLowerCase();
      const dataURL = this._canvas.toDataURL(`image/${ext}`);
      return dataURL;
    }
  },
});

export const affineOverlay = function(map, image) {
  return new AffineOverlay(map, image);
};
