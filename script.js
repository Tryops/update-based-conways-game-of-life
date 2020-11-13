"use strict";

/*
	Update-Based Conway's Game of Life
	----------------------------------

	An event/update based version of Conway's Game of Life. Only once a cell changes state, all of it's neighbor cells update as well. 
	This is in contrast to the traditional CGoL, where all cells in the grid are updated at once based on the states of their neighbors in the previous grid. 
	Here, the updates spread like waves through the 2D grid. 
	One tick in CGoL updates all cells in the grid, however, here one tick updates all the queued cells that should be updated if their neighbors updated. 

	Observations: 
	-------------
	After a certain time the automaton 
	-> either gets to a stable state where no more cells update
	-> or the updates in the grid grow exponentially over time (especially when the grid is bigger). 

	Also: 
	Even though the automata is a very chaotic system, there seem to be some stable "zebra" looking regions on the grid, where no changes seem to occur after some time. 
	I haven't seen other specific patterns yet, such as "gliders" in normal CGoL, but these might still exist in a different form. 

	Parts of this code are highly inefficient/are not very concise and JS is not the best fit for this problem, but it was sufficient enough to get something to visually experiment with the cell automata. 
*/

let canvas = document.querySelector("canvas");
let interval = null;

const rules = [
	[0, 0, 0, 1, 0, 0, 0, 0, 0],	// when dead 	-> [numNeighbors] => dead/alive
	[0, 0, 1, 1, 0, 0, 0, 0, 0] 	// when alive	-> [numNeighbors] => dead/alive
];

const buttonTick = document.querySelector("button#tick");
buttonTick.addEventListener("click", tick); // Manual tick for button
document.querySelector("button#play").addEventListener("click", event => {
	const button = event.target;
	const tempContent = button.innerHTML;
	button.innerHTML = button.dataset.content;
	button.dataset.content = tempContent;
	if(!button.classList.contains("playing")) {
		interval = setInterval(tick, 100); // Automatic tick every 100 ms
	} else {
		clearInterval(interval);
	}
	button.classList.toggle("playing");
	buttonTick.disabled = !buttonTick.disabled;
});

function tick() {
	updateCells();
	updateChart();
	draw(ctx);
}

const dimensions = {width: 50, height: 50};
const cellSize = {width: canvas.width/dimensions.width, height: canvas.height/dimensions.height};
let ctx;

// Manually toggle state of a cell on the canvas to start neighbor update: 
canvas.addEventListener("mousedown", e => {
	let pos = getMousePos(e);
	pos.x = Math.floor(pos.x/cellSize.width);
	pos.y = Math.floor(pos.y/cellSize.height);
	toggleCell(pos.x, pos.y);
	addCellToQueue(pos.x, pos.y);
	draw(ctx);
});

let grid = makeGrid(dimensions.width, dimensions.height);
let queue = [];

if (canvas.getContext) {
  ctx = canvas.getContext("2d");
  draw(ctx);
} else {
  alert("Browser does not support <canvas> element.");
}

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function makeGrid(width, height) {
	let grid = [];
	for(let x = 0; x < width; x++) {
		let row = [];
		for(let y = 0; y < height; y++) {
			row.push(0/*Math.round(Math.random())*/); // to begin: all dead!
		}
		grid.push(row);
	}
	return grid;
}

function getCellObj(x, y) {
	return {	"x": (x%dimensions.width+dimensions.width)%dimensions.width, 
				"y": (y%dimensions.height+dimensions.height)%dimensions.height
			};
};

function getCell(x, y) {
	return grid[(x%dimensions.width+dimensions.width)%dimensions.width][(y%dimensions.height+dimensions.height)%dimensions.height];
}

function setCell(x, y, state) {
	grid[x][y] = state;
}

function setCellInGrid(thisGrid, x, y, state) {
	return thisGrid[x][y] = state;
}

function toggleCell(x, y) {
	return grid[x][y] = !grid[x][y];
}

function addCellToQueue(x, y) {
	queue.push({"x": x, "y": y});
}

function getNeighborCells(x, y) {
	return [getCellObj(x+1, y), 
			getCellObj(x+1, y+1), 
			getCellObj(x, y+1), 
			getCellObj(x-1, y+1), 
			getCellObj(x-1, y), 
			getCellObj(x-1, y-1), 
			getCellObj(x, y-1), 
			getCellObj(x+1, y-1)];
}

function getNeighborStates(x, y) {
	return getNeighborCells(x, y).map(cell => getCell(cell.x, cell.y));
}

function getNeighborCount(x, y) {
	return getNeighborStates(x, y).reduce((acc, curr) => acc += curr, 0);
}

function updateCells() {
	let nextQueue = [];
	let nextGrid = grid.slice();
	queue.forEach(cell => {
		let oldState = getCell(cell.x, cell.y);
		let newState = rules[oldState ? 1 : 0][getNeighborCount(cell.x, cell.y)];
		if(newState != oldState) {
			nextQueue.push(...getNeighborCells(cell.x, cell.y));
			setCellInGrid(nextGrid, cell.x, cell.y, newState);
		}
	});
	queue = cleanQueue(nextQueue);//[...new Set(nextQueue)]; // Don't update neighbor cells multiple times!
	grid = nextGrid;
};

function cleanQueue(qu) {
	let unique = [];
	qu.forEach(cell => { if(!unique.some(e => e.x == cell.x && e.y == cell.y)) { unique.push(cell); }});
	return unique;
}

function drawCells(c) {
	for(let x = 0; x < dimensions.width; x++) {
		for(let y = 0; y < dimensions.height; y++) {
			if(getCell(x, y)) {
				c.fillRect(x*cellSize.width, y*cellSize.height, cellSize.width, cellSize.height);
			}
		}
	}
	c.strokeStyle = "#FF0000"; // Draw updated cells in red
	c.lineWidth = 1;
	queue.forEach(cell => c.strokeRect(cell.x*cellSize.width, cell.y*cellSize.height, cellSize.width, cellSize.height));
	c.strokeStyle = "#000000";
	c.lineWidth = 0.5;
};

function draw(c) {
	c.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid(c);
	drawCells(c);
}

function drawGrid(c) {
	c.lineWidth = 0.5;
	c.beginPath();
	for(let x = 0; x < canvas.width; x += cellSize.width) {
		c.moveTo(x, 0);
		c.lineTo(x, canvas.height);
	}
	for(let y = 0; y < canvas.height; y += cellSize.height) {
		c.moveTo(0, y);
		c.lineTo(canvas.width, y);
	}
	c.stroke();
}


// ---------------------------------------

// Graph from CanvasJS: https://canvasjs.com/
var dps = []; // dataPoints
var chart = new CanvasJS.Chart("chartContainer", {
	title :{
		text: "Queued cell updates",
		fontFamily: "consolas"
	},
	axisY: {
		includeZero: false
	},      
	data: [{
		type: "line",
		dataPoints: dps
	}]
});

let xVal = 0;
let yVal = 100; 
//var updateInterval = 100;
let dataLength = 20; // number of dataPoints visible at any point

function updateChart(count) {
	count = count || 1;
	for (var j = 0; j < count; j++) {
		yVal = queue.length;
		dps.push({
			x: xVal,
			y: yVal
		});
		xVal++;
	}
	if (dps.length > dataLength) {
		dps.shift();
	}
	chart.render();
};
updateChart(dataLength);
//setInterval(function(){updateChart()}, updateInterval);
