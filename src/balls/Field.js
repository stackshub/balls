var Shape = require('../game/Shape');
var Circle = require('../game/Circle');

module.exports = Field;

function Field(x, y, w, h) {
  Shape.call(this, x, y, w, h);
}

Field.prototype = Object.create(Shape.prototype);

Field.prototype.init = function(ballCount, shotCount, duration) {
  this.ballCount = ballCount;
  this.restShotCount = shotCount;
  this.restDuration = duration;
  this.score = 0;
  this.gravity = 0.0005;
  this.balls = new Array(this.ballCount);
  this.ballR = 30;
  this.ballRR = this.ballR * this.ballR;
  for (var i = 0; i < this.ballCount; i++) {
    var speed = 0.2 * Math.random();
    var angle = Math.PI * 2 * Math.random();
    this.balls[i] = new Circle(
      this.x + this.w * Math.random(),
      this.y + this.h * Math.random() * 0.8,
      this.ballR,
      {
        fill: BallColors[(i % 3) + 1],
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle)
      }
    );
  }
  for (var t = 0; t < 500; t++) {
    this.tickBalls(20);
  }
  this.removeBalls = [];
  this.mark = new Shape(0, 0, 20, 20, { textFill: BallColors[0] });
  this.state = States.Ready;
};

Field.prototype.onPointerDown = function(x, y) {
  if (this.restShotCount <= 0) {
    return;
  }
  if (this.state === States.Running) {
    this.pause();
    if (this.balls.length <= 1) {
      this.shoot(x, y);
    }
  } else if (this.state === States.Waiting) {
    this.shoot(x, y);
  }
};

Field.prototype.start = function(startTime) {
  this.lastTickTime = startTime;
  this.state = States.Running;
};

Field.prototype.pause = function() {
  this.removeBalls.length = 0;
  this.mark.text = null;
  this.state = States.Waiting;
};

Field.prototype.shoot = function(x, y) {
  for (var i = this.balls.length - 1; i >= 0; i--) {
    var ball = this.balls[i];
    var dx = x - ball.cx;
    var dy = y - ball.cy;
    if (dx * dx + dy * dy > this.ballRR) {
      continue;
    }
    this.balls.splice(i, 1);
    ball.stroke = ball.fill;
    ball.fill = null;
    this.removeBalls.push(ball);
  }
  this.score += Field.calculateScore(this.removeBalls.length, 0, 0);
  this.mark.text = '' + this.removeBalls.length;
  this.mark.cx = x;
  this.mark.cy = y;
  this.restShotCount--;
  if (!this.balls.length) {
    this.score += Field.calculateScore(
      0,
      this.restShotCount,
      this.restDuration
    );
    this.state = States.Finished;
    return;
  }
  if (!this.restShotCount) {
    this.state = States.Finished;
    return;
  }
  if (this.balls.length <= 1) {
    this.balls[0].fill = BallColors[0];
  }
  this.state = States.Running;
};

Field.prototype.tick = function(tickTime) {
  if (this.state === States.Finished) {
    return false;
  }
  var dt = tickTime - this.lastTickTime;
  this.lastTickTime = tickTime;
  this.restDuration -= dt;
  if (this.restDuration <= 0) {
    this.restDuration = 0;
    this.state = States.Finished;
    return false;
  }
  if (this.state === States.Waiting) {
    dt *= 0.01;
  }
  this.tickBalls(dt * (3 - (2 * this.balls.length) / this.ballCount));
  return true;
};

Field.prototype.tickBalls = function(dt) {
  for (var i = 0; i < this.balls.length; i++) {
    var ball = this.balls[i];
    ball.x += ball.vx * dt;
    if (ball.cx < this.x) {
      ball.cx = this.x * 2 - ball.cx;
      ball.vx *= -1;
    } else if (ball.cx > this.mx) {
      ball.cx = this.mx * 2 - ball.cx;
      ball.vx *= -1;
    }
    ball.vy += this.gravity * dt;
    ball.y += ball.vy * dt;
    if (ball.cy > this.my) {
      ball.cy = this.my * 2 - ball.cy;
      ball.vy *= -1;
    }
  }
};

Field.prototype.render = function(context) {
  context.save();
  try {
    context.beginPath();
    context.rect(this.x, this.y, this.w, this.h);
    context.closePath();
    context.fillStyle = 'black';
    context.fill();
    context.clip();
    context.globalCompositeOperation = 'lighter';
    for (var i = 0; i < this.balls.length; i++) {
      this.balls[i].render(context);
    }
    for (var j = 0; j < this.removeBalls.length; j++) {
      this.removeBalls[j].render(context);
    }
    this.mark.render(context);
  } finally {
    context.restore();
  }
};

Field.calculateScore = function(ballCount, shotCount, duration) {
  return ballCount * 1000 + shotCount * 100 + Math.ceil(duration / 1000);
};

var States = {
  Ready: 0,
  Running: 1,
  Waiting: 2,
  Finished: 3
};

var BallColors = ['#ccc', '#c00', '#0c0', '#00c'];
