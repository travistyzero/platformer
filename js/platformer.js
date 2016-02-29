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

  this.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  };

  this.times = function(factor) {
    return new Vector(this.x * factor, this.y * factor);
  };
}

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

  this.wrap.appendChild(this.drawBackgroud());
  this.actorLayer = null;
  this.drawFrame();
}

/*
Set the graphics scale. Defines the number of pixels that a single unit
takes up on the screen
*/
var scale = 20;
