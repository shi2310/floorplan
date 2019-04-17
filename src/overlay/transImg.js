export class TransformedImage {
  constructor(img) {
    this.img_ = img;
    this.translateX_ = 0;
    this.translateY_ = 0;
  }

  draw =function(ctx, points) {
    const x1 = points[0].x;
    const x2 = points[1].x;
    const x3 = points[2].x;

    const y1 = points[0].y;
    const y2 = points[1].y;
    const y3 = points[2].y;

    const h = this.img_.height;
    const w = this.img_.width;

    const tc = x1 + this.translateX_;
    const tf = y1 + this.translateY_;
    const ta = (x2 - x1) / w;
    const td = (y2 - y1) / w;
    const tb = (x3 - x2) / h;
    const te = (y3 - y2) / h;

    ctx.setTransform(ta, td, tb, te, tc, tf);
    ctx.drawImage(this.img_, 0, 0, w, h);
  };

  setTranslate = function(x, y) {
    this.translateX_ = x;
    this.translateY_ = y;
  };
}
