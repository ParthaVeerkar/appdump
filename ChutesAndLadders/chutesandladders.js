var n = {
  SNL_COUNT : 10,
  ANIMATION_SPEED : 100,
  MAX_RANDOM_MOVE_LIMIT : 20,
  chutes : [],
  ladders : [],
  cells : [],
  playerToRoll : 0,
  multiplePlayerCellStyle : "font-size: 10px;line-height: inherit;background:wheat",
  players : [],
  moveCount : 0,
  gameLog : null,
  rollButton : null,
  winMessage : null,
  colors : ['#89cff0', '#ff8c00', '#f4c2c2', '#fae7b5', '#f4bbff', '#a3c1ad'],

  init : function(numberOfPlayers) {

    n.winMessage = document.getElementById("winMessage");
    n.gameLog = document.getElementById("gameLog");
    n.rollButton = document.getElementById("roll");
    n.cells[0] = "";

    // reading all cells
    for(i=1;i<=100;i++) {
      n.cells.push(document.getElementById(i))
    }

    // creating random chutes and ladders
    for(i=0;i<n.SNL_COUNT;i++) {
      n.chutes.push(Math.ceil(Math.random()*97) + 2);
      n.ladders.push(Math.ceil(Math.random()*97) + 2);
    }

    // setting cell colors
    for(i=0;i<n.SNL_COUNT;i++) {
      n.cells[n.chutes[i]].classList += " snk"
      n.cells[n.ladders[i]].classList += " ldr"
    }

    // creating players
    for(looper = 0; looper < numberOfPlayers; looper++) {
      n.players.push(n.getPlayer(looper + '', n.colors[looper]));
    }

    // setting platers to first cell
    for(looper = 0; looper < n.players.length; looper++) {
      n.moveTo(looper, 1);
      n.addToCell(1, looper);
    }
    n.rollButton.innerHTML = "Roll P" + n.playerToRoll;
  },


  autoPlay : function() {
    // press the move button automatically
    // for all players
    setInterval(function() {
      n.rollButton.click();
    }, n.ANIMATION_SPEED);

  },

  win : function(playerId) {
    n.rollButton.disabled = true;
    n.winMessage.innerHTML = 'P' + playerId + ' won!<br> Refresh page to restart';
    console.log("Total moves: " + n.moveCount);
    n.winMessage.style = "display:block";
  },

  addToLog : function(text) {
    n.gameLog.innerHTML += "<br>" + text;
  },

  getPlayer : function(pid, pcolor) {
    return {
      id : pid,
      color: pcolor,
      pos: 1
    }
  },


  moveTo : function(playerId, cell) {
    if (n.players[playerId].pos < cell) {
      var direction = 1;
    } else if (n.players[playerId].pos > cell) {
      var direction = -1;
    } else {
      n.rollButton.disabled = false;
      return;
    }
      n.rollButton.disabled = true;
      var intrvl = setInterval(function() {
        playerPosition = n.players[playerId].pos;
        if(playerPosition == 1 && direction == -1) {
          n.rollButton.disabled = false;
          clearInterval(intrvl);
          return;
        } else if (playerPosition == 100 && direction == 1) {
          n.rollButton.disabled = false;
          n.win(playerId);
          clearInterval(intrvl);
          return;
        } else if (playerPosition == cell) {
          n.checkCells(playerId, playerPosition);
          clearInterval(intrvl);
          return;
        }
        n.deleteFromCell(playerPosition, playerId);
        n.addToCell(playerPosition + direction, playerId);
        playerPosition = playerPosition + direction;
        n.players[playerId].pos = playerPosition;
      }, n.ANIMATION_SPEED);
  },


  addToCell : function(cellId, playerId) {
    if (cellId < 1 || cellId > 100) {
      return;
    }
    if (typeof n.cells[cellId].playersInCell == "undefined") {
      n.cells[cellId].playersInCell = [];
    }
    n.cells[cellId].playersInCell.push(n.players[playerId].id);
    if (n.cells[cellId].playersInCell.length > 1) {
      n.cells[cellId].style = n.multiplePlayerCellStyle;
    } else {
      n.cells[cellId].style = "background:" + n.players[playerId].color;
    }
    n.updateCell(cellId);
  },

  deleteFromCell : function(cellId, playerId) {
    if (cellId < 1 || cellId > 100) {
      return;
    }
    if (typeof n.cells[cellId].playersInCell != "undefined") {
        n.cells[cellId].playersInCell.splice(
          n.cells[cellId].playersInCell.indexOf(n.players[playerId].id), 1
      );
      if (n.cells[cellId].playersInCell.length == 1) {
        n.cells[cellId].style = "background:" + n.players[n.cells[cellId].playersInCell[0]].color;
      } else if (n.cells[cellId].playersInCell.length > 1) {
        n.cells[cellId].style = n.multiplePlayerCellStyle;
      } else {
        n.cells[cellId].style = "";
      }
      n.updateCell(cellId);
    }
  },

  updateCell : function(cellId) {
    if (typeof n.cells[cellId].playersInCell == "undefined") {
      n.cells[cellId].innerHTML = n.cells[cellId].id;
    } else if (n.cells[cellId].playersInCell.length > 0) {
      n.cells[cellId].innerHTML = "P" + n.cells[cellId].playersInCell.join();
    } else {
      n.cells[cellId].innerHTML = n.cells[cellId].id;
    }
  },

  checkCells : function(playerId, cell) {
    // check if hit a ladder
    if (n.ladders.indexOf(cell) != -1) {
      n.addToLog("P" + n.playerToRoll + " hit a ladder at " + cell + " !");
      n.addToLog("Moving..");
      n.moveTo(playerId, cell + (Math.floor(Math.random()*n.MAX_RANDOM_MOVE_LIMIT) + 1));

      // check if hit a chute
    } else if (n.chutes.indexOf(cell) != -1) {
      n.addToLog("P" + n.playerToRoll + " hit a chute at " + cell + " !");
      n.addToLog("Moving..");
      n.moveTo(playerId, cell - (Math.floor(Math.random()*n.MAX_RANDOM_MOVE_LIMIT) + 1));
    } else {
      n.rollButton.disabled = false;
      n.players[playerId].pos = cell;
    }
  },

  rollDice : function() {
    n.moveCount += 1;
    n.rollButton.disabled = true;
    n.gameLog.innerHTML = "";
    var rolled = Math.ceil(Math.random()*6);
    n.addToLog("P" + n.playerToRoll + " rolled: " + rolled + " !");
    n.addToLog("Moving..");
    n.moveTo(n.playerToRoll, n.players[n.playerToRoll].pos + rolled);
    n.playerToRoll = (n.playerToRoll + 1) % n.players.length;
    n.rollButton.innerHTML = "Roll P" + n.playerToRoll;
  }
}

document.getElementById('startButton').addEventListener('click', function() {
  var numberOfPlayers = parseInt(document.getElementById('numberOfPlayers').value);
  if(typeof numberOfPlayers  != 'number') {
    numberOfPlayers = 2;
  }
  n.init(document.getElementById('numberOfPlayers').value);
  document.getElementById('startingSettings').style = "display:none;";
  document.getElementById('gameArea').style = "";
});
