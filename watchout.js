var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 30,
};

var gameStats = {
  score: 0,
  bestScore: 0,
  collision: 0
};

var drag = d3.behavior.drag()
    .on('drag', dragmove);


var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
};

var gameBoard = d3.select('body').append('svg')
                  .attr('class','svg')
                  .attr('width', gameOptions.width)
                  .attr('height', gameOptions.height)


var player = gameBoard.append('circle')
          .attr('class', 'player')
          .attr('cx', .5 * gameOptions.width)
          .attr('cy', .5 * gameOptions.height)
          .attr('r', 15)
          .call(drag);

var createEnemies = function(){
  return _.range(0, gameOptions.nEnemies).map(function(i){
    return {
      id:i,
      x: Math.random()*100,
      y: Math.random()*100
    };
  });
};

var render = function(enemyData){
  var enemies = gameBoard.selectAll('circle.enemy')
                .data(enemyData, function(d){
                  return d.id;
                });

  enemies.enter().append('circle')
        .attr('class', 'enemy')
        .attr('cx', function(enemy) {
            return axes.x(enemy.x);
          })
        .attr('cy', function(enemy) {
            return axes.y(enemy.y);
          })
        .attr('r', 10);

  enemies.exit().remove();

  enemies.transition().duration(2000)
        .tween('custom',function(newEnemy){
          var enemy = d3.select(this);
          var playern = d3.select('.player');
          var startPos = {
            x: parseFloat(enemy.attr('cx')),
            y: parseFloat(enemy.attr('cy'))
          };
          var endPos = {
            x: axes.x(newEnemy.x),
            y: axes.y(newEnemy.y)
          };
          
          return function(t){
            checkCollision(enemy, onCollision, player);
            var enemyNextPos = {
              x: startPos.x + (endPos.x - startPos.x)*t,
              y: startPos.y + (endPos.y - startPos.y)*t
            };
            enemy.attr('cx', enemyNextPos.x)
                  .attr('cy', enemyNextPos.y)
          };
        });
  var checkCollision = function(enemy, collisionCB, player){
    radiusSum = parseFloat(enemy.attr('r'))+parseFloat(player.attr('r'));
    xDiff = enemy.attr('cx') - player.attr('cx');
    yDiff = enemy.attr('cy') - player.attr('cy');

    var separation = Math.sqrt( Math.pow(xDiff,2) + Math.pow(yDiff,2) );
    if(separation < radiusSum){
      collisionCB(player, enemy);
    }
  };
  var onCollision = function(player, enemy){
    updateScore();
    updateBestScore();
    gameStats.score = 0;
    gameStats.collision ++;
    updateCollision();
    enemy.style('fill', 'orange')
    player.style('fill', 'pink')
  };

};

var updateScore = function() {
  d3.select('.current span').text(gameStats.score.toString());
};
var updateBestScore = function(){
  if(gameStats.score > gameStats.bestScore){
    gameStats.bestScore = gameStats.score;
  }
  d3.select('.high span').text(gameStats.bestScore.toString());
};
var updateCollision = function(){
  d3.select('.collision span').text(gameStats.collision.toString());
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

function dragmove(d){
  d3.select(this)
    .style('fill', 'purple')
    .attr('cx', d3.event.x)
    .attr('cy',d3.event.y)
};

play();












