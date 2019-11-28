module.exports = Container;

function Container(window, stage) {
  this.window = window;
  this.stage = stage;
  stage.container = this;
  this.canvas = window.document.createElement('canvas');
  this.context = this.canvas.getContext('2d');
  this.lastFrameTime = 0;

  var self = this;
  listen(window, 'DOMContentLoaded', function(event) {
    self.canvas.style.position = 'absolute';
    self.canvas.style.left = '0px';
    self.canvas.style.top = '0px';
    if (stage.background) {
      self.canvas.style.background = stage.background;
    }
    self.coordinate();
    self.window.document.body.style.overflow = 'hidden';
    self.window.document.body.appendChild(self.canvas);
    self.window.focus();
    if (stage.onReady) {
      if (stage.onReady(event) == false) {
        return;
      }
    }
    self.request();
  });
  if (stage.onLoad) {
    listen(this.window, 'load', function(event) {
      if (stage.onLoad(event) == false) {
        return;
      }
      self.request();
    });
  }
  if (stage.onHashChange) {
    listen(this.window, 'hashchange', function(event) {
      if (stage.onHashChange(self.getHash(), event) == false) {
        return;
      }
      self.request();
    });
  }
  listen(this.window, 'resize', function(event) {
    self.coordinate();
    if (stage.onResize) {
      if (stage.onResize(event) == false) {
        return;
      }
    }
    self.request();
  });
  if (stage.onPointerDown) {
    listenPointer('mousedown', 'touchstart', stage.onPointerDown.bind(stage));
  }
  if (stage.onPointerMove) {
    listenPointer('mousemove', 'touchmove', stage.onPointerMove.bind(stage));
  }
  if (stage.onPointerUp) {
    listenPointer('mouseup', 'touchend', stage.onPointerUp.bind(stage));
  }
  if (stage.onKeyDown) {
    listenKey('keydown', stage.onKeyDown.bind(stage));
  }
  if (stage.onKeyUp) {
    listenKey('keyup', stage.onKeyUp.bind(stage));
  }

  function listen(target, type, listener) {
    target.addEventListener(type, listener, false);
  }

  function listenPointer(mouseType, touchType, listener) {
    listen(self.canvas, mouseType, function(event) {
      event.preventDefault();
      event.stopPropagation();
      var x = self.convertX(event.clientX);
      var y = self.convertY(event.clientY);
      if (listener(x, y, event) == false) {
        return;
      }
      self.request();
    });
    listen(self.canvas, touchType, function(event) {
      event.preventDefault();
      event.stopPropagation();
      var touch = event.changedTouches[0];
      var x = self.convertX(touch.clientX);
      var y = self.convertY(touch.clientY);
      if (listener(x, y, event) == false) {
        return;
      }
      self.request();
    });
  }

  function listenKey(type, listener) {
    listen(self.window, type, function(event) {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (listener(event.key, event) != false) {
        self.request();
      }
    });
  }
}

Container.prototype.coordinate = function() {
  this.canvas.width = this.window.innerWidth;
  this.canvas.height = this.window.innerHeight;
  this.scale = Math.min(
    this.canvas.width / this.stage.w,
    this.canvas.height / this.stage.h
  );
  this.offsetX = (this.canvas.width - this.stage.w * this.scale) / 2;
  this.offsetY = (this.canvas.height - this.stage.h * this.scale) / 2;
  if (this.window.scrollTop !== 0) {
    this.window.scrollTo(0, 0);
  }
};

Container.prototype.convertX = function(canvasX) {
  return (canvasX - this.offsetX) / this.scale;
};

Container.prototype.convertY = function(canvasY) {
  return (canvasY - this.offsetY) / this.scale;
};

Container.prototype.request = function() {
  var self = this;
  this.window.requestAnimationFrame(function(time) {
    if (time === self.lastFrameTime) {
      return;
    }
    if (self.stage.update) {
      if (self.stage.update(time, self.lastFrameTime) != false) {
        self.request();
      }
    }
    self.lastFrameTime = time;
    if (!self.stage.render) {
      return;
    }
    self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
    self.context.save();
    try {
      self.context.setTransform(
        self.scale,
        0,
        0,
        self.scale,
        self.offsetX,
        self.offsetY
      );
      self.context.textAlign = 'center';
      self.context.textBaseline = 'middle';
      self.context.font = '16px sans-serif';
      self.context.lineWidth = 2;
      for (var k in self.stage.style) {
        self.context[k] = self.stage.style[k];
      }
      self.stage.render(self.context);
    } finally {
      self.context.restore();
    }
  });
};

Container.prototype.setTimeout = function(handler, delay) {
  var self = this;
  return this.window.setTimeout(function() {
    if (handler() == false) {
      return;
    }
    self.request();
  }, delay);
};

Container.prototype.clearTimeout = function(timeoutId) {
  this.window.clearTimeout(timeoutId);
};

Container.prototype.setInterval = function(handler, delay) {
  var self = this;
  return this.window.setInterval(function() {
    if (handler() == false) {
      return;
    }
    self.request();
  }, delay);
};

Container.prototype.clearInterval = function(intervalId) {
  this.window.clearInterval(intervalId);
};

Container.prototype.now = function() {
  return this.window.performance.now();
};

Container.prototype.openUrl = function(url) {
  this.window.parent.location.href = url;
};

Container.prototype.getSearchParams = function() {
  if (!this.window.location.search) {
    return {};
  }
  return this.window.location.search
    .substring(1)
    .split('&')
    .reduce(function(prev, curr) {
      var nameValue = curr.split('=').map(function(x) {
        return decodeURIComponent(x.replace(/\+/g, '%20'));
      });
      prev[nameValue[0]] = nameValue[1];
      return prev;
    }, {});
};

Container.prototype.getHash = function() {
  return this.window.location.hash.slice(1);
};

Container.prototype.replaceHash = function(hash) {
  this.window.history.replaceState(
    null,
    null,
    hash
      ? '#' + hash
      : this.window.location.pathname + this.window.location.search
  );
};
