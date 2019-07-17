// Code your JavaScript / jQuery solution here
var turn = 0;
var table = document.getElementsByTagName('table')[0];
const WIN_COMBINATIONS = [
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
]

var squares = window.document.querySelectorAll('td');
function populateBoard(arr) {
  for (let i = 0; i < 9; i++) {
    squares[i].innerHTML = arr[i];
  }
}

function player() {
  return turn % 2 === 0 ? "X" : "O"
}

function updateState(cell) {
  cell.innerHTML = player();
}

function gameOver(){
  return checkWin() || boardFull();
}

function boardFull() {
  return !$('td').is(function(i, cell) { return cell.innerHTML === ""})
}

function checkWin() {
  const cells = $('td');
  var gameWon = false;
  WIN_COMBINATIONS.forEach(function(combo){
    if (cells[combo[0]].innerHTML === cells[combo[1]].innerHTML && cells[combo[0]].innerHTML === cells[combo[2]].innerHTML && cells[combo[0]].innerHTML !== "") {
      gameWon = true;
    }
  });
  return gameWon;
}

function resetGame() {
  saveGame();
  turn = 0;
  $('td').html("");
}

function checkWinner() {
  if (checkWin()) {
    turn --;
    setMessage(`Player ${player()} Won!`);
    resetGame();
    return true;
  } else if (boardFull()) {
    setMessage(`Tie game.`);
    resetGame();
    return false;
  } else {
    return false;
  }
}

function setMessage(message){
  $('div#message').html(message);
}

function doTurn(cell) {
  if (!gameOver() && !taken(cell)) {
    updateState(cell);
    turn++;
    checkWinner();
  }
}

function taken(cell) {
  return cell.innerHTML !== '';
}

function saveGame(){
  // get div contents into an array for the Game's state
  var gameState = [];
  $('td').each(function(i, cell){
    gameState.push(cell.innerHTML);
  });

  // if the game has been saved before (thus, has a gameId), do a patch call, otherwise, save as a new game
  if(!!table.getAttribute('data-gameId')) {
    $.ajax({
      type: 'PATCH',
      url: `/games/${table.getAttribute("data-gameId")}`,
      data: JSON.stringify({"state": gameState}),
      processData: false,
      contentType: 'application/merge-patch+json',
      success: function(resp){
        setMessage("Game saved.");
      }
    });
  } else {
    $.post(`/games`, {state: gameState}, function(resp){
      table.setAttribute('data-gameId', resp["data"].id);
      setMessage("Game saved.");
    });
  }
};

function previousGames(){
  $.get('/games', function(resp){
    $('div#games').empty();

    let i;
    for(let i = 0; i < resp["data"].length; i++) {
      var game = resp["data"][i];
      var btn = document.createElement('button');
      btn.classList.add("saved-game")
      btn.innerHTML = game.id;
      btn.setAttribute('data-gameId', game.id);
      btn.addEventListener('click', function(event){ loadSavedGame(event.target) });
      $('div#games').append(btn);
    };
  });
};

function clearGame(){
  turn = 0;
  $('td').html("");
  table.setAttribute("data-gameId", "");
}

function loadSavedGame(gameButton) {
  var gameId = gameButton.getAttribute('data-gameId');
  $.get(`/games/${gameId}`, function(resp){
    let game = resp["data"];
    table.setAttribute('data-gameId', game.id);
    populateBoard(game.attributes.state);
  });
}

function populateBoard(arr) {
  let cells = $('td')
  arr.forEach(function(cellValue, i){
    cells[i].innerHTML = cellValue
  })

  turn = arr.reduce(function(total, currentValue){
    return total + !!currentValue;
  }, 0)
  
}

function attachListeners(){
  $('td').click(function(event){ doTurn(event.target) });
  $('button#save').click(function(){ saveGame() });
  $('button#previous').click(function(){ previousGames() });
  $('button#clear').click(function(){ clearGame() });
};

$(document).ready(function(){
  attachListeners();
});

