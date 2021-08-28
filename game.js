var plane = document.getElementById('plane');
var players = document.getElementById('players');
var scores = document.getElementById('score');


class GameBoard {
    constructor(){
        this.start = false;
        this.score = 0;
        this.gridSize = 17;
        plane.style.width = `${this.gridSize}em`;
        plane.style.height = `${this.gridSize}em`;
        this.p1 = new Player(1);
        this.p2 = new Player(2);
        this.shortIndices = [];
        this.grid = this.createGameBoard();
        this.getPlayerInitialPos();
        this.start = true;
    }

    createPlayer(id) {
        return {
          id: id,
          x: null,
          y: null,
          dir: null,
          div: null,
          translateX: 0,
          translateY: 0,
          translateZ: 0
        }
    }


    computeL1Distance(pointA, pointB){
        return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y)
    }

    getPlayerInitialPos() {
        let move, new_p1_pos, new_p2_pos;
        let moveset = ['up', 'down', 'left', 'right', null];
        let maxDistanceDir;
        let distance, maxdistance;
        let total_moves = 0;
        for (let i=0; i<100; i++){ 
            maxdistance = 0;
            for (let j=0; j<moveset.length; j++){
                move = moveset[j];
                if (move) {
                    this.setPlayerDir(move);
                    new_p1_pos = this.p1.handleMovement(this.grid, this.gridSize);
                    new_p2_pos = this.p2.handleMovement(this.grid, this.gridSize);
                    distance = this.computeL1Distance(new_p1_pos, new_p2_pos);
                    if (distance >= maxdistance){
                        maxdistance = distance;
                        maxDistanceDir = move;
                        }
                    }
                }
            this.setPlayerDir(maxDistanceDir);
            if (maxDistanceDir === 'up') {
                total_moves += 1;
            } else if (maxDistanceDir === 'down') {
                total_moves -= 1;
            } else if (maxDistanceDir === 'left') {
                total_moves += 1;
            } else if (maxDistanceDir === 'right') {
                total_moves -= 1;
            }
            this.p1.movePlayer(this.grid, this.gridSize);
            this.p2.movePlayer(this.grid, this.gridSize);
        }
    }

    setPlayerDir(dir){
        this.p1.state.dir = dir;
        if (dir === 'up') {
            this.p2.state.dir = 'down';
        }
        else if (dir === 'down') {
            this.p2.state.dir = 'up';
        }
        else if (dir === 'left') {
            this.p2.state.dir = 'right';
        }
        else if (dir === 'right') {
            this.p2.state.dir = 'left';
        }
        // update
        if (this.start) {
            this.score += 1;
            scores.innerText = `Score: ${this.score}`;
        }

    }

  teleportPowerUp(){
    ;
  }

  reverseDirectionPowerUp(){
    ;
  }

  checkPositionAvailability(probability, coords){
    return (
      Math.random() < probability
      && !this.p1.detectOverlap(coords)
      && !this.p2.detectOverlap(coords)
    )
  }


    createGameBoard(){
        let grid = [];
        let coords, powerup;
        // get number of rectangles: (this.gridSize/2)+1
        // set initial offset to 3

        for (let i=0; i<this.gridSize; i++) {
            let col = [];
            for (let j=0; j<this.gridSize; j++) {
                let block = {
                    height: 0,
                    init_height: 0,
                    div: null,
                    x: i,
                    y: j,
                    powerup: null
                }
                col.push(block);
            }
            grid.push(col);
        }

        let midpoint = parseInt(this.gridSize/2) + 1
        let n_kernels = parseInt(this.gridSize/2)-1
        for (let i=0; i<n_kernels; i++) {
            let area_size = 3 + 2*i;
            let min = midpoint - (i+1);
            let max = midpoint + (i+1);
            for (let j=min; j<max; j++) {
                for (let k=min; k<max; k++) {
                    if (
                        j === min
                        || k === min
                        || j === max
                        || k === max
                    ) {
                        let prob = 20 + i*(Math.log(90/n_kernels));
                        console.log(prob/10);
                        if (this.checkPositionAvailability(prob/100, {x: j, y: k})) {
                            let block = grid[j][k]
                            block.height = 1;
                            block.init_height = 10;
                        }
                    }
                }
            } 
        }
         
    return grid;
    }
  
    detectOverlap(pos, player){
        if (pos.x === player.x && pos.y === player.y){
            return true;
        } else {
            return false;
        }
    }

  handleLevelEnd(){
    if (
        this.p1.state.x == this.p2.state.x
        && this.p1.state.y == this.p2.state.y
    ){
      // disable event handlers
      // set color of player 2 to purple
      this.p2.state.div.classList.add('playerComplete');
    } else {
      this.p2.state.div.classList.remove('playerComplete');

    }
  }


  createMapDiv(block){
    let div = document.createElement('div');
    // if the height is 1, give it a .tall attribute
    if (block.height == 1) {
      div.classList.add('tall');
    } else {
      div.classList.add('short');
    }
    // set css properties for div and update state for block
    return div;
  }

  createPlayerDiv(player){
    let div = document.createElement('div');
    div.classList.add('tall');
    div.classList.add('player');
    div.classList.add(`player${player.id}`);
    players.appendChild(div);
    player.div = div;
  }

  render() {
    // init logic
    // create a randomized grid
    // pick starting point for blocks
    // move both blocks from each other randomly
    // number of moves is dictated by level
    // perlin noise may be a better method for level building
    for (let i=0; i<this.gridSize; i++){
      for (let j=0; j<this.gridSize; j++){
        // create a new div
        let block = this.grid[i][j];
        if (!block.div) {
          let div = this.createMapDiv(block);
          plane.appendChild(div);
          if (block.x == this.p1.state.x && block.y == this.p1.state.y && !this.p1.state.div) {
              this.p1.createPlayerDiv();
            //this.createPlayerDiv(this.p1);
          }
          else if (block.x == this.p2.state.x && block.y == this.p2.state.y && !this.p2.state.div) {
              this.p2.createPlayerDiv();
            //this.createPlayerDiv(this.p2);
          }
          block.div = div;
          if (block.powerup && block.powerup.type === 'transport'){
            console.log('hello')
            block.div.classList.add('transport');
          }
        }
        // if the init_height is > 0, set the ztransform attr
        // to init_height and reduce it by 1
        // if the init_height == height, don't modify ztransform
        ;
      }
    }
  }

  update() {
    this.p1.movePlayer(this.grid, this.gridSize);
    this.p2.movePlayer(this.grid, this.gridSize);
    this.handleLevelEnd();
  }

  removeDivsFromParent(className) {
    let divs = document.getElementsByClassName(className);
    //Array.from(divs).forEach(element => {
    //  element.parentNode.removeChild(element);
    //  //console.log(element);
    //});
  }

  tearDown() {
    //only needs to be called at level end

    this.removeDivsFromParent('tall');
    ;
  }
}



let board = new GameBoard(10, 10);
// bind event handlers

window.addEventListener("keydown", function(event){
    if (event.defaultPrevented){
        return;
    }

    switch(event.key){
        case 'ArrowDown':
            board.setPlayerDir('down');
            break;
        case 'ArrowUp':
            board.setPlayerDir('up');
            break;
        case 'ArrowLeft':
            board.setPlayerDir('left');
            break;
        case 'ArrowRight':
            board.setPlayerDir('right');
            break;
        default:
            return;
    }

    event.preventDefault();

}, true);


function step() {
  board.render();
}


;(function() {

  const fps = 30;
  let fpsInterval = 1000/fps;
  let tFrame = 0;

  function main(timestamp) {
    window.requestAnimationFrame(main);
    elapsed = timestamp - tFrame;
    if (elapsed > fpsInterval) {
      tFrame = timestamp - (elapsed % fpsInterval)  
      board.render();
      board.update();
    }
  }

  main();

})();



