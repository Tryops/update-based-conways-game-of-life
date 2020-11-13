Update-Based Conway's Game of Life
----------------------------------

<div align="center"><img src="res/cgol_icon.png" width="200px"/></div>

An event/update based version of Conway's Game of Life. Only once a cell changes state, all of it's neighbor cells update as well. 
This is in contrast to the traditional CGoL, where all cells in the grid are updated at once based on the states of their neighbors in the previous grid. 
Here, the updates spread like waves through the 2D grid. 
One tick in CGoL updates all cells in the grid, however, here one tick updates all the queued cells that should be updated if their neighbors updated. 

## Observations
After a certain time the automaton 
- either gets to a stable state where no more cells update
- or the updates in the grid grow exponentially over time (especially when the grid is bigger). 

## Also
Even though the automata is a very chaotic system, there seem to be some stable "zebra" looking regions on the grid, where no changes seem to occur after some time. 
I haven't seen other specific patterns yet, such as "gliders" in normal CGoL, but these might still exist in a different form. 

Parts of this code are highly inefficient/are not very concise and JS is not the best fit for this problem, but it was sufficient enough to get something to visually experiment with the cell automata. 
