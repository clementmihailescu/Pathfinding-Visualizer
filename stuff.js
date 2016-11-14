// watchify /home/clement/Documents/Fullstack_Academy/Projects/Pathfinding_Algorithms/public/browser/board.js -o /home/clement/Documents/Fullstack_Academy/Projects/Pathfinding_Algorithms/public/browser/bundle.js




// add bomb bi-direcitonal is no longer red
// when you drag both start && target and clearPath and then move them, the node beneath them is visited (purple) (SOMETIMES);
// if you drag target node on start node (or vice versa) and then immediately go back, and let go SHIT FUCKS UP
// 2-1 status is null;
// removing target instead of start adds wall
// when you clear path with object node, object and start don't animate
// when you drag and click visualize
// edges of start node and target node and bomb node on edges of grid
// when node cant get to target it is yellow (and there's a white node in the corner)
// clicking the visualize without algorithm doesnt allow you to do stuff

// 6) refactor everything

// More Stuff to add:
// 3) take care of maze titles and themes (and keepo)
// 5) add tutorial

A* Search Algorithm: the Power of Heuristics


This presentation explores why the A* Search Algorithm is so much more powerful than its cousin Dijkstra's Algorithm and other pathfinding algorithms.

The A* Search Algorithm distinguishes itself from its cousin Dijkstra's Algorithm by the fact that it is informed, meaning that it knows where the target node is located before even starting to run.
This allows A* to use heuristics, special functions meant to estimate distances in the case of pathfinding, to guide its search for the shortest path between a start node and a target node.
Clement built a Pathfinding Visualization tool where 
