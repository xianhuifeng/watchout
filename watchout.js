//start slingin' some d3 here.

var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 30,
  padding: 20
};

var gameStats = {
  score: 0,
  bestScore: 0
};

var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
};

var gameBoard = d3.select('.container').append('svg:svg')
                .attr('width', gameOptions.width)
                .attr('height', gameOptions.height);

var updateScore = function() {
  d3.select('.current span').text(gameStats.score.toString());
};
var updateBestScore = function(){
  if(gameStats.score > gameStats.bestScore){
    gameStats.bestScore = gameStats.score;
  }
  d3.select('.high span').text(gameStats.bestScore.toString());
};
var createEnemies = function(){
  return _.range(0, gameOptions.nEnemies).map(function(i){
    return {
      id:i,
      x: Math.random()*100,
      y: Math.random()*100
    };
  });
};
var createPlayer = function(){
  var player = gameBoard.append('svg:circle')
          .attr('class', 'player')
            .attr('cx', 200)
            .attr('cy', 300)
            .attr('r', 15)
            .style('fill', 'red')
            .call(drag);
   return player;
};
var dragMove = function(){
  d3.select(this)
    .attr('cx', d3.event.x)
    .attr('cy',d3.event.y)
};
var drag = function(){
  d3.behavior.drag().on('drag', dragMove);
};

var player = createPlayer();
var render = function(enemyData){
  var enemies = gameBoard.selectAll('circle.enemy')
                .data(enemyData, function(d){
                  return d.id;
                });

  enemies.enter().append('svg:circle')
         .attr('class', 'enemy')
         .attr('cx', function(enemy) {
            return axes.x(enemy.x);
          }).attr('cy', function(enemy) {
            return axes.y(enemy.y);
          }).attr('r', 0);

  enemies.exit().remove();

  enemies.transition().duration(500)
            .attr('r', 10)
          .transition().duration(1000)
            .tween('custom',function(newEnemy){
              var enemy = d3.select(this);
              var startPos = {
                x: parseFloat(enemy.attr('cx')),
                y: parseFloat(enemy.attr('cy'))
              };
              var endPos = {
                x: axes.x(newEnemy.x),
                y: axes.y(newEnemy.y)
              };
              
              return function(t){
                var enemy = d3.select(this);
                var player = d3.select('.player');
                var checkCollision = function(enemy, collisionCB){
                  radiusSum = parseFloat(enemy.attr('r'))+parseFloat(player.attr('r'));
                  xDiff = enemy.attr('cx') - player.attr('cx');
                  yDiff = enemy.attr('cy') - player.attr('cy');

                  var separation = Math.sqrt( Math.pow(xDiff,2) + Math.pow(yDiff,2) );
                  if(separation < radiusSum){
                    collisionCB(player, enemy);
                  }
                };
                var onCollision = function(){
                  updateBestScore();
                  gameStats.score = 0;
                  updateScore();
                };
                checkCollision(enemy, onCollision);
                var enemyNextPos = {
                  x: startPos.x + (endPos.x - startPos.x)*t,
                  y: startPos.y + (endPos.y - startPos.y)*t
                };
                enemy.attr('cx', enemyNextPos.x)
                      .attr('cy', enemyNextPos.y)
              };
            });

};


var play = function() {
  var gameTurn = function(){
    var newEnemyPositions;
    newEnemyPositions = createEnemies();
    render(newEnemyPositions);
  };
  var increaseScore = function(){
    gameStats.score += 1;
    updateScore();
  };

  gameTurn();
  setInterval(gameTurn, 2000);
  setInterval(increaseScore, 50);
};

play();



















