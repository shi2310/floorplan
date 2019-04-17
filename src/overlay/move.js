import L from 'leaflet';
import _ from 'lodash';
import { Dot } from './dot';
import styles from './move.less';

export class Mover {
  constructor(parent, dots) {
    const dot = new Dot(parent, 'centra');
    dot.controlDots_ = dots;
    dot.getCanvas().className += ` ${styles.mover}`;

    dot.onMouseMove_ = this.onMouseMove_.bind(dot);

    L.DomEvent.on(dots[0], 'change', this.onDotChange_.bind(dot));
    L.DomEvent.on(dots[2], 'change', this.onDotChange_.bind(dot));
    this.onDotChange_.call(dot);
    return dot;
  }

  onDotChange_ = function() {
    const dots = this.controlDots_;
    const x = (dots[0].x + dots[2].x) / 2;
    const y = (dots[0].y + dots[2].y) / 2;
    this.moveTo(x, y);
  };

  /**
   * @this Dot
   * @private
   * @param {MouseEvent} e  the event containing coordinates of current mouse
   * position.
   */
  onMouseMove_ = function(e) {
    L.DomEvent.stop(e);

    const deltax = e.clientX - this.cx;
    const deltay = e.clientY - this.cy;
    _.map(this.controlDots_, dot => {
      dot.setPoint(dot.x + deltax, dot.y + deltay);
    });

    this.cx = e.clientX;
    this.cy = e.clientY;
  };
}

export const moveControle = (parent, dots) => new Mover(parent, dots);
