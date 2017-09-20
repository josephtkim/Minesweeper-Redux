$(document).ready(function(){
	var col_diff = [8, 16, 30];
	var row_diff = [8, 16, 20];
	var mine_diff = [10, 40, 99];
	
	var gameover = false;
	var firstTurn = true;
	
	var currows,
		curcols,
		curmines,
		curflags;
	
	// Keep track of visited squares
	var visited = [];
	var queue = [];
	
	// Images
	var flagCode = "<img src='./resources/img/flag.png'/>";
	var bombCode = "<img src='./resources/img/bomb.png'/>";
	
	// Smiley images
	var beatgameImg = "url('./resources/img/beatgame.png')";
	var loseImg = "url('./resources/img/lose.png')";
	var clickingImg = "url('./resources/img/clicking.png')";
	var normalImg = "url('./resources/img/normal.png')";
	
	// Determine game difficulty
	var difficulty = document.getElementById('game').className;
	
	if (difficulty === "diffE") {
		newGame(col_diff[0], row_diff[0], mine_diff[0]);
	} else if (difficulty === "diffM") {
		newGame(col_diff[1], row_diff[1], mine_diff[1]);
	} else if (difficulty === "diffH") {
		newGame(col_diff[2], row_diff[2], mine_diff[2]);
	};
	
	// Press smiley to start new game
	$("#smilestatebutton").click(function(){
		location.reload();
	})


        // Generate the game layout
	function generateEmptyField(cols, rows, mines){			
		// Game frame and dimensions
		var width = cols * 25;
		var height = rows * 25;					
				
		document.getElementById("container").style.height = String(height) + "px";
		document.getElementById("container").style.width = String(width) + "px";
		document.getElementById("game").style.height = String(height + 20) + "px";
		document.getElementById("game").style.width = String(width + 20) + "px";
		document.getElementById("game").style.paddingTop = String(40) + "px";
		document.getElementById("info").style.width = String(width) + "px";
		
		// Prepare to fill in the minefield
		var $grid = $('#minefield');
	
		// Generate empty field
		for(var i = 1; i <= rows; i++) {
			// Create rows, and fill with empty buttons
			var row = '<div class="board-row">';
			
			for(var j = 1; j <= cols; j++) {				
				var compare = String(i) + '-' + String(j);				
				
				row += '<button class="empty" id="' +String(i)+ '-' +String(j)+ '"></button>';				
			}
			row += '</div>';
			
			$grid.append(row);
		}

         $('body').css('opacity', 1);
	}
		
	// Color for each different number
	function numberToColor(number) {
		var color = "black";
		
		switch(number) {
			case 1:
				color = "blue";
				break;
			case 2:
				color = "red";
				break;
			case 3:
				color = "green";
				break;
			case 4:
				color = "gray";
				break;
			case 5:
				color = "orange";
				break;
			case 6:
				color = "brown";
				break;
			case 7:
				color = "black";
				break;
			case 8:
				color = "yellow";
				break;			
		}
		
		return color;
	}
	
	// Flag count displayer
	function flagDisplayUpdate(flagcount) {
		var flagh = Math.floor(flagcount / 100);
		var flagt = Math.floor((flagcount % 100) / 10);
		var flago = flagcount % 10;
		
		document.getElementById('flag-h').innerHTML = String(flagh);
		document.getElementById('flag-t').innerHTML = String(flagt);
		document.getElementById('flag-o').innerHTML = String(flago);
	}
	
	// Timer display
	var curseconds = 0;	
	var timeLoop;
	
	function incrementTime() {				
		curseconds += 1;
		
		if (curseconds === 999) {
			clearInterval(timeLoop);
		}
		
		timerDisplayUpdate(curseconds);			
	}		
		
	function timerDisplayUpdate(seconds) {
		var timerh = Math.floor(seconds / 100);
		var timert = Math.floor((seconds % 100) / 10);
		var timero = seconds % 10;
		
		document.getElementById('timer-h').innerHTML = String(timerh);
		document.getElementById('timer-t').innerHTML = String(timert);
		document.getElementById('timer-o').innerHTML = String(timero);		
	}
	
	// New game function
	function newGame(cols, rows, mines) {
		curcols = cols;
		currows = rows;
		curmines = mines;
		curflags = mines;
		gameover = false;
		generateEmptyField(curcols, currows, curmines);
		
		flagDisplayUpdate(curflags);
	}
	
	// Place the mines on the field				
	function minepositions(cols, rows, mines, firstPosition) {
		var count = 0;
		var totalcells = cols * rows;
		var random_position;
		var minecount = mines;
		
		var positions = [];
		var positioncode = [];
		
		var firstRow = firstPosition.substr(0, firstPosition.indexOf('-'));
		var firstCol = firstPosition.substr(firstPosition.indexOf('-')+1, firstPosition.length);
		
		var firstVal = ((parseInt(firstRow) - 1) * curcols) + parseInt(firstCol);			
		
		while (count < minecount) {
			random_position = Math.floor((Math.random() * totalcells) + 1);
											
			if ((positions.includes(random_position) === false) && (random_position !== firstVal))
			{				
				positions.push(random_position);
				count += 1;
			}
			
			else {
				random_position = Math.floor((Math.random() * 10) + 1);				
			};
		}
		
		var rowcode;
		var colcode;
		var poscode = "";
		var length = positions.length;
		
		for (var i = 0; i < length; i++) {
			rowcode = Math.ceil(positions[i] / cols);
			
			if (positions[i] % cols === 0){
				colcode = positions[i] / rowcode;
			}
			else {
				colcode = positions[i] % cols;
			}
			
			poscode = String(rowcode) + '-' + String(colcode);
			positioncode.push(poscode);
		}
		
		return positioncode;
	}	
	
	// Creating empty minefield
	var blockval = [];	
	function createblocksval(cols, rows){
		var row = [];
		blockval = [];
		
		for (var j = 0; j <= rows + 1; j++) {
			row = [];
			for (var i = 0; i <= cols + 1; i++) {
				row.push(0);
			}
			blockval.push(row);
		}
		return blockval;
	}
	
	// Filling the game board
	// with the values for each square
	function blockvalues(positioncode, cols, rows) {
		var blockval = createblocksval(cols, rows);
		
		for (var i = 0; i < positioncode.length; i++) {
			var full = positioncode[i];
			var row = full.substr(0, full.indexOf('-'));
			var col = full.substr(full.indexOf('-')+1, full.length);
			
			// Add to the adjacent blocks
			blockval[parseInt(row)-1][parseInt(col)-1] += 1;
			blockval[parseInt(row)-1][parseInt(col)] += 1;
			blockval[parseInt(row)-1][parseInt(col)+1] += 1;
			
			blockval[parseInt(row)][parseInt(col)-1] += 1;
			blockval[parseInt(row)][parseInt(col)+1] += 1;
			
			blockval[parseInt(row)+1][parseInt(col)-1] += 1;
			blockval[parseInt(row)+1][parseInt(col)] += 1;
			blockval[parseInt(row)+1][parseInt(col)+1] += 1;
		}
		
		return blockval;
	}
	
	var adj1,
		adj2,
		adj3,
		adj4,
		adj5,
		adj6,
		adj7,
		adj8;
	
	function gameovercheck() {		
		if ((visited.length >= (currows * curcols - curmines)) && gameover === false) {
			document.getElementById('smilestatebutton').style.backgroundImage = beatgameImg;
			gameover = true;
			
			// reveal mines and stop timer
			revealMines();
			clearInterval(timeLoop);
		}
	}	
	
	// Reveal all the mines after winning
	function revealMines() {
		var mines = document.getElementsByClassName('mine');
		for (var i = 0, length = mines.length; i < length; i++) {			
			mines[i].innerHTML = flagCode;
		}
	}
	
	// Helper function to push adjacents to array if not already visited
	function pushAdj(element) {
		if (visited.includes(element) === false) {
			// If value is 0 (empty square), push to the queue to repeat
			if (document.getElementById(element).value === "0") {
				queue.push(element);
			}
			visited.push(element);
		}
	}
	
	// Function utilizing BFS to show all adjacent squares
	function showadjacents(name, cols, rows) {				
		var row = name.substr(0, name.indexOf('-'));
		var col = name.substr(name.indexOf('-')+1, name.length);					
		
		// Keep track of visited and current adjacents
		var current = row + "-" + col;
		if (visited.includes(current) === false) {
			visited.push(current);
		}
		
		queue.push(current);
				
		// Repeat until queue is empty
		while (queue.length > 0) {
			// Check all 8 adjacent squares
			//   push to queue ONLY IF VALUE IS 0
			//   meaning that the square is empty,
			//   so it should repeat for that square.
			// Otherwise, if the square has a number,
			//   push to visited only.
			current = queue.pop();
			
			row = current.substr(0, current.indexOf('-'));
			col = current.substr(current.indexOf('-')+1, current.length);	
			
			// Check 8 adjacents
			
			// Checks conditions based on location of the current square.
			// Row is not top edge
			if (parseInt(row) !== 1) {
				adj2 = String(parseInt(row) - 1) + '-' + String(parseInt(col));
				pushAdj(adj2);
				
				// Not upper-left corner
				if (parseInt(col) !== 1) {
					adj1 = String(parseInt(row) - 1) + '-' + String(parseInt(col) - 1);		
					pushAdj(adj1);
				}
				
				// Not upper-right corner 
				if (parseInt(col) !== cols) {
					adj3 = String(parseInt(row) - 1) + '-' + String(parseInt(col) + 1);	
					pushAdj(adj3);
				}
			}			
			// Row is not bottom edge
			if (parseInt(row) !== rows) {
				adj5 = String(parseInt(row) + 1) + '-' + String(parseInt(col));
				pushAdj(adj5);
				
				// Not bottom-right corner 
				if (parseInt(col) !== cols) {
					adj6 = String(parseInt(row) + 1) + '-' + String(parseInt(col) + 1);		
					pushAdj(adj6);
				}
				
				// Not bottom-left corner 
				if (parseInt(col) !== 1) {
					adj4 = String(parseInt(row) + 1) + '-' + String(parseInt(col) - 1);
					pushAdj(adj4);
				}
			}			
			// Column is not left edge
			if (parseInt(col) !== 1) {
				adj7 = String(row) + '-' + String(parseInt(col) - 1);
				pushAdj(adj7);
			}			
			// Column is not right edge
			if (parseInt(col) !== cols) {
				adj8 = String(row) + '-' + String(parseInt(col) + 1);
				pushAdj(adj8);
			}					
		}		
				
		// Flip all visited blocks
		for (var i = 0; i < visited.length; i++) {
			// Square is empty
			var curId = "#" + visited[i];
			
			if (document.getElementById(visited[i]).value === "0") {
				
				// If square has flag, flip and add back to total flag count
				if ($(curId).hasClass("flagged")) {					
					$(curId).removeClass("flagged");
					curflags += 1;
				}
				
				$(curId).addClass("flipped");
				document.getElementById(visited[i]).style.border = "none";
				document.getElementById(visited[i]).innerHTML = "";
			}
			// Square has a number
			else {
				// If square has flag, flip and add back to total flag count
				if ($(curId).hasClass("flagged")) {
					$(curId).removeClass("flagged");
					curflags += 1;					
				}
				
				document.getElementById(visited[i]).innerHTML = document.getElementById(visited[i]).value;
				document.getElementById(visited[i]).style.border = "none";
				
				$(curId).addClass("flipped");
				document.getElementById(visited[i]).style.color = numberToColor(parseInt(document.getElementById(visited[i]).value));
			}
			
			// Update the flag count
			flagDisplayUpdate(curflags);
		}				
	}	
	
	
	
	// Place the mines and squares onto the board		
	function placeMines(cols, rows, mines, firstMove) {
		// The positions of the mines
		// and the values for the board
		var positioncode = minepositions(cols, rows, mines, firstMove);		
		blockval = blockvalues(positioncode, cols, rows);
		
		for (var k = 1; k <= rows; k++) {						
			for(var j = 1; j <= cols; j++)
			{
				var compare = String(k) + '-' + String(j);
				
				var curId = "#" + compare;
				// Square is a mine
				if (positioncode.includes(compare) === true){
					$(curId).addClass("mine");
					document.getElementById(compare).value = -100;
				}
				// Square is not a mine
				else {
					$(curId).addClass("square");
					document.getElementById(compare).value = blockval[k][j];
				};
			}
		}
	}
		
	// Left click a square
	$('button').click(function() {
		// Check that there is no flag
		if ($(this).hasClass("flagged") === false) {

			// Initially, all squares have class "empty"
			if (this.className === "empty") {
				// First turn
				var first = String(this.id);
				
				// First click is never a mine.
				// Generates field after first click.
				if (firstTurn === true) {
					placeMines(curcols, currows, curmines, first);
					firstTurn = false;
					
					// Start timer
					timeLoop = setInterval(incrementTime, 1000);
					
					if(gameover === false) {
						if ((this).value === "0") {
							if (visited.includes((this).id) === false) {
								visited.push((this).id);
							}							
							$(this).addClass("flipped");
							(this).style.border = "none";							
							showadjacents(((this).id), curcols, currows);												
						}
						else if ((this).value !== "100") {
							if (visited.includes((this).id) === false) {
								visited.push((this).id);
							}
							(this).innerHTML = (this).value;							
							$(this).addClass("flipped");
							(this).style.border = "none";
							
							(this).style.color = numberToColor(parseInt((this).value));
						}
					}											
				}						
				gameovercheck();
			}
			
			// Click a square
			else if ($(this).hasClass("square")) {
				if(gameover === false){			
					if ((this).value === "0") {
						if (visited.includes((this).id) === false) {
							visited.push((this).id);
						}
						$(this).addClass("flipped");
						(this).style.border = "none";						
						showadjacents(((this).id), curcols, currows);										
					}
					else if ((this).value > 0) {
						if (visited.includes((this).id) === false) {
							visited.push((this).id);
						}
						(this).innerHTML = (this).value;	
						$(this).addClass("flipped");
						(this).style.border = "none";
						(this).style.color = numberToColor(parseInt((this).value));
					}
				}
				gameovercheck();
			}
							
			// Click a mine
			else if ($(this).hasClass("mine")) {
				if(gameover === false){	
					var mines = document.getElementsByClassName('mine');
					for (var i = 0, length = mines.length; i < length; i++) {
						mines[i].style.backgroundColor = "red";
						mines[i].innerHTML = bombCode;
						mines[i].style.border = "none";
					}
					gameover = true;
					clearInterval(timeLoop);
					
					document.getElementById('smilestatebutton').style.backgroundImage = loseImg;
				}
			}	
		}
	})
		
	// while holding down a square, show the surprised face
	function repeatingfunction() {
		document.getElementById('smilestatebutton').style.backgroundImage = clickingImg;
	}
	
	$("button").mousedown(function (ev) {
		if (ev.which === 1) {	
			if(gameover === false){	
				loopthis = setInterval(repeatingfunction, 100);
			}
		}
	}).mouseup(function () {
		if(gameover === false){				
			document.getElementById('smilestatebutton').style.backgroundImage = normalImg;
			clearInterval(loopthis);
		}
	});

	// If mouse leaves board, remove the surprised face
	$("#minefield").mouseleave(function(){
		if (gameover === false) {
			document.getElementById('smilestatebutton').style.backgroundImage = normalImg;
			clearInterval(loopthis);
		}
	})
		
	// Right click square to place flags
	$('button').mousedown(function(ev) {
		if (ev.which == 3) {
			if (gameover === false) {
				if ($(this).hasClass("flagged")) {
					$(this).removeClass("flagged");
					curflags += 1;
					(this).innerHTML = "";
				}
				else if (curflags > 0) {
					if ($(this).hasClass("flipped") === false) {
					  $(this).addClass("flagged");
					  curflags -= 1;
					  (this).innerHTML = flagCode;
					}
				}
				flagDisplayUpdate(curflags);
			}
		}
	})	
})