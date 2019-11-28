var Shape = require('./Shape');

module.exports = Circle;

function Circle(cx, cy, r, options) {
  var d = r * 2;
  Shape.call(this, cx - r, cy - r, d, d, options);
}

Circle.prototype = Object.create(Shape.prototype);

Circle.prototype.draw = function(context) {
  Shape.drawCircle(context, this.cx, this.cy, this.r);
};
