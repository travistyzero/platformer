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
