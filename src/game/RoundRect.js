var Shape = require('./Shape');

module.exports = RoundRect;

function RoundRect(x, y, w, h, options) {
  Shape.call(this, x, y, w, h, options);
  if (this.roundFactor === undefined) {
    this.roundFactor = 0.5;
  }
}

RoundRect.prototype = Object.create(Shape.prototype);

RoundRect.prototype.draw = function(context) {
  Shape.drawRoundRect(
    context,
    this.nx,
    this.ny,
    this.mx,
    this.my,
    this.r,
    this.roundFactor
  );
};
