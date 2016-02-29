/*
@ - Player start location
o - Coin
= - Lava moves horizontally
| - Lava moves vertically
v - Lava that only moves down
*/
var actorChars = {
  "@": Player,
  "o": Coin,
  "=": Lava,
  "|": Lava,
  "v": Lava
};

var simpleLevelPlan = [
  "                      ",
  "                      ",
  "  x              = x  ",
  "  x         o o    x  ",
  "  x @      xxxxx   x  ",
  "  xxxxx            x  ",
  "      x!!!!!!!!!!!!x  ",
  "      xxxxxxxxxxxxxx  ",
  "                      "
];

function Level(plan) {
  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];

  for (var y = 0; y < this.height; y++) {
    var line = plan[y],
      gridLine = [];
    for (var x = 0; x < this.width; x++) {
      var ch = line[x],
        fieldType = null;
      var Actor = actorChars[ch];
      if (Actor)
        this.actors.push(new Actor(new Vector(x, y), ch));
      else if (ch == "x")
        fieldType = "wall";
      else if (ch == "!")
        fieldType = "lava";
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }

  this.player = this.actors.filter(function(actor) {
    return actor.type == "player";
  })[0];
  this.status = this.finishDelay = null;
}
Level.prototype.isFinished = function() {
  return this.status !== null && this.finishDelay < 0;
};

// Store position and size of an actor.
function Vector(x, y) {
  this.x = x;
  this.y = y;
}
Vector.prototype.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
    return new Vector(this.x * factor, this.y * factor);
};

function Player(position) {
  this.position = position.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.velocity = new Vector(0, 0);
  this.type = "player";
}

function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    this.velocity = new Vector(2, 0);
  } else if (ch == "|") {
    this.velocity = new Vector(0, 2);
  } else if (ch == "v") {
    this.velocity = new Vector(0, 3);
    this.repeatPos = pos;
  }
  this.type = "lava";
}

function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
  this.type = "coin";
}

// Create an element for the DOM.
function createElement(name, className) {
  var element = document.createElement(name);
  if (className) {
    element.className = className;
  }
  return element;
}

/*
A display is created by giving it a parent element to which it should append
itself and a level object.
*/
function DOMDisplay(parent, level) {
  this.wrap = parent.appendChild(createElement("div", "game"));
  this.level = level;
  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();

}

// Create table to display the level. Each element has a single table element.
DOMDisplay.prototype.drawBackground = function() {
  var table = createElement("table", "background");
  table.style.width = this.level.width * scale + "px";
  this.level.grid.forEach(function(row) {
    var rowElement = table.appendChild(createElement("tr"));
    rowElement.style.height = scale + "px";
    row.forEach(function(type) {
      rowElement.appendChild(createElement("td", type));
    });
  });
  return table;
};

// Create DOM element for each actor.
DOMDisplay.prototype.drawActors = function() {
  var wrap = createElement("div");
  this.level.actors.forEach(function(actor) {
    var rect = wrap.appendChild(createElement("div",
      "actor " + actor.type));
    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};

/*
Redraws Actors by removing them all from the DOM and drawing them in
new positions.
*/
DOMDisplay.prototype.drawFrame = function() {
  if (this.actorLayer) {
    this.wrap.removeChild(this.actorLayer);
    this.actorLayer = this.wrap.appendChild(this.drawActors());
    this.wrap.className = "game " + (this.level.status || "");
    this.scrollPlayerIntoView();
  }
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
  var width = this.wrap.clientWidth;
  var height = this.wrap.clientHeight;
  var margin = width / 3;

  // The viewport
  var left = this.wrap.scrollLeft;
  var right = left + width;
  var top = this.wrap.scrollTop;
  var bottom = top + height;

  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5))
    .times(scale);

  if (center.x < left + margin)
    this.wrap.scrollLeft = center.x - margin;
  else if (center.x > right - margin)
    this.wrap.scrollLeft = center.x + margin - width;
  if (center.y < top + margin)
    this.wrap.scrollTop = center.y - margin;
  else if (center.y > bottom - margin)
    this.wrap.scrollTop = center.y + margin - height;
};

// Clears the level from the DOM.
DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};

/*
Set the graphics scale. Defines the number of pixels that a single unit
takes up on the screen
*/
var scale = 20;

// Run script once browser is ready.
var ready = function(f) {
  if (document.readyState === "complete") {
    return f();
  }
  document.addEventListener("DOMContentLoaded", f, false);
};

// Create level and show game.
ready(function() {
  var simpleLevel = new Level(simpleLevelPlan);
  var display = new DOMDisplay(document.body, simpleLevel);
});
