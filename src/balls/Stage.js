var Field = require('./Field');
var RoundRect = require('../game/RoundRect');
var Shape = require('../game/Shape');

module.exports = Stage;

function Stage() {
  this.w = 360;
  this.h = 360;
  this.background = '#222';
}

Stage.prototype.onReady = function() {
  var params = this.container.getSearchParams();
  this.ballCount = parseInt(params.ballCount) || 30;
  this.shotCount = parseInt(params.shotCount) || 10;
  this.duration = parseInt(params.duration) || 30000;
  this.maxScoreKey = [
    'stackshub_balls_score',
    this.ballCount,
    this.shotCount,
    this.duration
  ].join('_');
  this.maxScore =
    parseInt(this.container.getItem(this.maxScoreKey)) ||
    Field.calculateScore(this.ballCount, 0, 0);
  this.field = new Field(30, 50, 300, 300);
  this.shotOutput = new Shape(30, 10, 100, 30, { textFill: 'white' });
  this.scoreOutput = new Shape(130, 10, 100, 30, { textFill: 'white' });
  this.durationOutput = new Shape(230, 10, 100, 30, { textFill: 'white' });
  this.titleLabel = new Shape(0, 80, 360, 60, {
    text: this.container.getTitle(),
    textFill: { fillStyle: 'white', font: '32px sans-serif' }
  });
  this.startButton = new RoundRect(90, 170, 180, 60, {
    stroke: 'white',
    text: 'Start',
    textFill: 'white'
  });
  this.readmeButton = new RoundRect(90, 260, 180, 60, {
    stroke: 'white',
    text: 'Readme',
    textFill: 'white'
  });
  this.resultButton = new RoundRect(90, 170, 180, 60, {
    stroke: 'white',
    textFill: 'white'
  });
  this.resultButton = new RoundRect(90, 170, 180, 60, {
    stroke: 'white',
    textFill: 'white'
  });
  this.goHome();
};

Stage.prototype.onPointerDown = function(x, y) {
  switch (this.scene) {
  case Scenes.Home:
    if (this.startButton.contains(x, y)) {
      this.goPlay();
    } else if (this.readmeButton.contains(x, y)) {
      this.container.openUrl(
        'https://github.com/stackshub/balls/blob/master/README.md'
      );
    }
    break;
  case Scenes.Play:
    if (this.field.contains(x, y)) {
      this.field.onPointerDown(x, y);
    }
    break;
  case Scenes.Result:
    if (this.resultButton.contains(x, y)) {
      this.goHome();
    }
    break;
  }
};

Stage.prototype.goHome = function() {
  this.field.init(this.ballCount, this.shotCount, this.duration);
  this.shotOutput.text = this.shotCount;
  this.scoreOutput.text = this.maxScore;
  this.durationOutput.text = Math.ceil(this.duration / 1000);
  this.scene = Scenes.Home;
};

Stage.prototype.goPlay = function() {
  this.field.start(this.container.now());
  this.scene = Scenes.Play;
};

Stage.prototype.goResult = function() {
  if (this.field.score > this.maxScore) {
    this.resultButton.text = 'New Record';
    this.maxScore = this.field.score;
    this.container.setItem(this.maxScoreKey, this.maxScore);
  } else if (!this.field.balls.length) {
    this.resultButton.text = 'Completed';
  } else if (!this.field.restDuration) {
    this.resultButton.text = 'Time\'s Up';
  } else {
    this.resultButton.text = 'Finished';
  }
  this.scene = Scenes.Result;
};

Stage.prototype.update = function() {
  if (this.scene !== Scenes.Play) {
    return false;
  }
  var running = this.field.tick(this.container.now());
  this.shotOutput.text = '' + this.field.restShotCount;
  this.scoreOutput.text = '' + this.field.score;
  this.durationOutput.text = '' + Math.ceil(this.field.restDuration / 1000);
  if (!running) {
    this.goResult();
  }
  return running;
};

Stage.prototype.render = function(context) {
  switch (this.scene) {
  case Scenes.Home:
    this.titleLabel.render(context);
    this.startButton.render(context);
    this.readmeButton.render(context);
    break;
  case Scenes.Play:
    this.field.render(context);
    break;
  case Scenes.Result:
    this.field.render(context);
    this.resultButton.render(context);
    break;
  }
  this.shotOutput.render(context);
  this.scoreOutput.render(context);
  this.durationOutput.render(context);
};

var Scenes = {
  Home: 0,
  Play: 1,
  Result: 2
};
