import L from 'leaflet';
import styles from './dot.less';

export const Dot = L.Layer.extend({
  initialize(parent, key) {
    this.key = key;
    const dotdom = (this._div = L.DomUtil.create('div', styles.dot));
    parent.appendChild(dotdom);
    dotdom.addEventListener('mousedown', this.onMouseDown_.bind(this));
    this.style = dotdom.style;
    this.x = 0;
    this.y = 0;
  },
  moveTo(x, y) {
    if (this.x === x && this.y === y) {
      return;
    }
    this.x = x;
    this.y = y;
    this.render();
  },
  // this fun will cause fire change event
  setPoint(x, y) {
    this.moveTo(x, y);
    this.fire('change');
  },
  remove() {
    this.setPoint(0, 0);
    this._div.remove();
  },
  getCanvas() {
    return this._div;
  },
  onMouseMove_(e) {
    L.DomEvent.stop(e);
    const offsetX = e.clientX - this.cx;
    const offsetY = e.clientY - this.cy;
    this.setPoint(this.x + offsetX, this.y + offsetY);
    this.cx = e.clientX;
    this.cy = e.clientY;
  },
  onMouseDown_(e) {
    L.DomEvent.stop(e);
    // trigger dragstart event
    this.fire('dragstart');

    // record client x,y
    this.cx = e.clientX;
    this.cy = e.clientY;

    // bind move event
    const movecb = this.onMouseMove_.bind(this);
    L.DomEvent.addListener(window, 'mousemove', movecb);

    // clear event
    const upcb = () => {
      L.DomEvent.removeListener(window, 'mousemove', movecb);
      L.DomEvent.removeListener(window, 'mouseup', upcb);
      this.fire('dragend');
    };
    L.DomEvent.addListener(window, 'mouseup', upcb);
  },
  render() {
    this.style.left = `${this.x}px`;
    this.style.top = `${this.y}px`;
    this.fire('render');
  },
});

export const dotControle = (parent, key) => new Dot(parent, key);
