var plane = document.getElementById('plane');
var players = document.getElementById('players');
var scores = document.getElementById('score');
var generalMessage = document.getElementById('generalMessage');
var gameOverMessage = document.getElementById('gameOverMessage');


class GameBoard {
    constructor(gridSize, grid){
        this.start = false;
        this.score = 0;
        this.gridSize = gridSize;
        plane.style.width = `${this.gridSize}em`;
        plane.style.height = `${this.gridSize}em`;
        this.p1 = new Player(1);
        this.p2 = new Player(2);
        this.shortIndices = [];
        //this.grid = this.overrides.grid !== null
        if (!grid) {
            this.grid = this.createGameBoard();
        }
        else {
            this.grid = grid;
        }
        this.getPlayerInitialPos();
        this.start = true;
        this.end = false;
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
            this.score = this.score + 1;
        }
        else {
            this.score = 0;
        }
        scores.innerText = `Score: ${this.score}`;

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


    static createEmptyGrid(gridSize) {
        let grid = [];
        for (let i=0; i<gridSize; i++) {
            let col = [];
            for (let j=0; j<gridSize; j++) {
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
        return grid;
    }

    createGameBoard(){
        let grid = [];

        grid = GameBoard.createEmptyGrid(this.gridSize);

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
        this.end = true;
        this.p2.state.div.classList.add('playerComplete');
        // trigger animation
        this.tearDown();
        this.score = 0; // wtf??
        }
    else {
        this.end = false;
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

  render() {
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
    Array.from(divs).forEach(element => {
      element.parentNode.removeChild(element);
    });
  }

  tearDown() {
    //only needs to be called at level end
    this.removeDivsFromParent('tall');
    this.removeDivsFromParent('short');
    this.removeDivsFromParent('players');
  }
}



class Level {
    constructor(level, gridOverride) {
        this.board = new GameBoard(17, gridOverride);
        this.eventHandler = this.handleEvents(this);
        this.bindEventHandlers()
        this.next = null;
        this.level = level;
        this.spacePressed = false;
    }

    handleEvents(obj) {
        let board = this.board;
        return (function(event) {

            if (event.defaultPrevented){
                return;
            }

            switch(event.code){
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
                case 'Space':
                    obj.spacePressed = true;
                    break;
                default:
                    return;
            }

            event.preventDefault();

        });
    }

    bindEventHandlers() {
        window.addEventListener("keydown", this.eventHandler, true);
    }

    unbindEventHandlers() {
        window.removeEventListener("keydown", this.eventHandler, true);
    }

    onGameEnd(resolve, animationReq) {
        if (this.board.end) {
            // hide general div
            generalMessage.style.display = 'none';

            // show game over div
            gameOverMessage.style.display = 'block';
             
            // if space is pressed return resolve
            if (this.spacePressed) {
                this.unbindEventHandlers();
                window.cancelAnimationFrame(animationReq);
                this.spacePressed = false;
                return resolve();
            }
        }
    }


    go() {

        generalMessage.style.display = 'block';
        gameOverMessage.style.display = 'none';
        const fps = 30;
        let fpsInterval = 1000/fps;
        let tFrame = 0;
        let board = this.board;
        var animationReq;
        function loop(timestamp) {
            animationReq = window.requestAnimationFrame(loop);
            let elapsed = timestamp - tFrame;
            if (elapsed > fpsInterval) {
                tFrame = timestamp - (elapsed % fpsInterval)  
                board.render();
                board.update();
            }
        }
        
        // start render loop
        loop();

        // return a promise that resolves once the level ends
        return new Promise(resolve => {
            
            setInterval(() => {
                this.onGameEnd(resolve, animationReq)
            }, 30);
        })
    }
}

async function main() {
    levelCofigs = {
        0: {
            grid: GameBoard.createEmptyGrid(17),
            message: "doo doo"
        }
    }
    gridOverrides = {
        0: GameBoard.createEmptyGrid(17),
    }
    for (let i=0; i<5; i++) {
        let level;
        if (i in gridOverrides) {
            level = new Level(i, gridOverrides[0]);
        }
        else {
            level = new Level(i);
        }
        await level.go();
    }
}

main();

