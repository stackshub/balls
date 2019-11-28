var Shape = require('./Shape');

module.exports = Rect;

function Rect(x, y, w, h, options) {
  Shape.call(this, x, y, w, h, options);
}

Rect.prototype = Object.create(Shape.prototype);

Rect.prototype.draw = function(context) {
  Shape.drawRect(context, this.x, this.y, this.w, this.h);
};
