module.exports = Shape;

function Shape(x, y, w, h, options) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  for (var k in options) {
    this[k] = options[k];
  }
}

Object.defineProperties(Shape.prototype, {
  cx: {
    get: function() {
      return this.x + this.w / 2;
    },
    set: function(value) {
      this.x = value - this.w / 2;
    }
  },
  cy: {
    get: function() {
      return this.y + this.h / 2;
    },
    set: function(value) {
      this.y = value - this.h / 2;
    }
  },
  r: {
    get: function() {
      return Math.min(Math.abs(this.w) / 2, Math.abs(this.h) / 2);
    },
    set: function(value) {
      var cx = this.cx;
      var cy = this.cy;
      if (!(value > 0)) {
        this.w = this.h = 0;
        this.x = cx;
        this.y = cy;
        return;
      }
      var r = this.r;
      if (!(r > 0)) {
        this.w = this.h = value;
        this.x = cx - value / 2;
        this.y = cy - value / 2;
        return;
      }
      var k = value / r;
      this.w *= k;
      this.h *= k;
      this.x = cx - this.w / 2;
      this.y = cy - this.h / 2;
    }
  },
  nx: {
    get: function() {
      return this.w >= 0 ? this.x : this.x + this.w;
    },
    set: function(value) {
      this.x = this.w >= 0 ? value : value - this.w;
    }
  },
  ny: {
    get: function() {
      return this.h >= 0 ? this.y : this.y + this.h;
    },
    set: function(value) {
      this.y = this.h >= 0 ? value : value - this.h;
    }
  },
  mx: {
    get: function() {
      return this.w >= 0 ? this.x + this.w : this.x;
    },
    set: function(value) {
      this.x = this.w >= 0 ? value - this.w : value;
    }
  },
  my: {
    get: function() {
      return this.h >= 0 ? this.y + this.h : this.y;
    },
    set: function(value) {
      this.y = this.h >= 0 ? value - this.h : value;
    }
  }
});

Shape.prototype.contains = function(x, y) {
  return x >= this.nx && x < this.mx && y >= this.ny && y < this.my;
};

Shape.prototype.applyFill = function(context, fill) {
  if (typeof fill === 'string') {
    context.fillStyle = fill;
    return;
  }
  for (var k in fill) {
    context[k] = fill[k];
  }
};

Shape.prototype.applyStroke = function(context, stroke) {
  if (typeof stroke === 'string') {
    context.strokeStyle = stroke;
    return;
  }
  for (var k in stroke) {
    context[k] = stroke[k];
  }
};

Shape.prototype.getTextX = function(context) {
  switch (context.textAlign) {
  case 'left':
    return this.nx;
  case 'right':
    return this.mx;
  default:
    return this.cx;
  }
};

Shape.prototype.getTextY = function(context) {
  switch (context.textBaseline) {
  case 'top':
    return this.ny;
  case 'bottom':
    return this.my;
  default:
    return this.cy;
  }
};

Shape.prototype.render = function(context) {
  context.save();
  try {
    if (this.draw) {
      this.draw(context);
      if (this.fill) {
        this.applyFill(context, this.fill);
        context.fill();
      }
      if (this.stroke) {
        this.applyStroke(context, this.stroke);
        context.stroke();
      }
    }
    if (this.text) {
      if (this.textFill) {
        this.applyFill(context, this.textFill);
        context.fillText(
          this.text,
          this.getTextX(context),
          this.getTextY(context)
        );
      }
      if (this.textStroke) {
        this.applyStroke(context, this.textStroke);
        context.strokeText(
          this.text,
          this.getTextX(context),
          this.getTextY(context)
        );
      }
    }
  } finally {
    context.restore();
  }
};

Shape.RightAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5, Math.PI * 2];

Shape.drawRect = function(context, x, y, w, h) {
  context.beginPath();
  context.rect(x, y, w, h);
  context.closePath();
};

Shape.drawRoundRect = function(context, nx, ny, mx, my, r, roundFactor) {
  var rr = r * roundFactor;
  nx += rr;
  ny += rr;
  mx -= rr;
  my -= rr;
  context.beginPath();
  context.arc(nx, ny, rr, Shape.RightAngles[2], Shape.RightAngles[3]);
  context.arc(mx, ny, rr, Shape.RightAngles[3], Shape.RightAngles[4]);
  context.arc(mx, my, rr, 0, Shape.RightAngles[1]);
  context.arc(nx, my, rr, Shape.RightAngles[1], Shape.RightAngles[2]);
  context.closePath();
};

Shape.drawCircle = function(context, cx, cy, r) {
  context.beginPath();
  context.arc(cx, cy, r, 0, Shape.RightAngles[4]);
  context.closePath();
};

Shape.drawPolygon = function(context, cx, cy, r, vertexCount, rotationAngle) {
  if (vertexCount === undefined) {
    vertexCount = 5;
  }
  if (rotationAngle === undefined) {
    rotationAngle = Shape.RightAngles[3];
  }
  context.beginPath();
  context.moveTo(
    cx + r * Math.cos(rotationAngle),
    cy + r * Math.sin(rotationAngle)
  );
  var da = Shape.RightAngles[4] / vertexCount;
  for (var i = 1, a = rotationAngle + da; i < vertexCount; i++, a += da) {
    context.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  context.closePath();
};

Shape.drawPolystar = function(
  context,
  cx,
  cy,
  r,
  vertexCount,
  rotationAngle,
  concaveFactor
) {
  if (vertexCount === undefined) {
    vertexCount = 5;
  }
  if (rotationAngle === undefined) {
    rotationAngle = Shape.RightAngles[3];
  }
  if (concaveFactor === undefined) {
    concaveFactor = 0.5;
  }
  context.beginPath();
  context.moveTo(
    cx + r * Math.cos(rotationAngle),
    cy + r * Math.sin(rotationAngle)
  );
  var cr = r * concaveFactor;
  var da = Shape.RightAngles[2] / vertexCount;
  var a = rotationAngle + da;
  context.lineTo(cx + cr * Math.cos(a), cy + cr * Math.sin(a));
  for (var i = 1; i < vertexCount; i++) {
    a += da;
    context.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    a += da;
    context.lineTo(cx + cr * Math.cos(a), cy + cr * Math.sin(a));
  }
  context.closePath();
};
