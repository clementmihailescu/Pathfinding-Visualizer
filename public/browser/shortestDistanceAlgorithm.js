

function test(nodes, start, target, nodesToAnimate, boardArray, name, heuristic) {
  if (!start || !target || start === target) {
    return false;
  }
  nodes[start].distance = 0;
  nodes[start].direction = "up";
  let unvisitedNodes = Object.keys(nodes);
  while (unvisitedNodes.length) {
    let currentNode = closestNode(nodes, unvisitedNodes);
    while (currentNode.status === "wall" && unvisitedNodes.length) {
      currentNode = closestNode(nodes, unvisitedNodes)
    }
    if (currentNode.distance === Infinity) return false;
    currentNode.status = "visited";
    if (currentNode.id === target) {
      while (currentNode.id !== start) {
        nodesToAnimate.unshift(currentNode);
        currentNode = nodes[currentNode.previousNode];
      }
      return "success!";
    }
    if (name === "astar" || name === "greedy") {
      updateNeighbors(nodes, currentNode, boardArray, target, name, start, heuristic);
    } else if (name === "dijkstra") {
      updateNeighbors(nodes, currentNode, boardArray);
    }
  }
}

function closestNode(nodes, unvisitedNodes) {
  let currentClosest, index;
  for (let i = 0; i < unvisitedNodes.length; i++) {
    if (!currentClosest || currentClosest.distance > nodes[unvisitedNodes[i]].distance) {
      currentClosest = nodes[unvisitedNodes[i]];
      index = i;
    }
  }
  unvisitedNodes.splice(index, 1);
  return currentClosest;
}

function updateNeighbors(nodes, node, boardArray, target, name, start, heuristic) {
  let neighbors = getNeighbors(node.id, nodes, boardArray);
  for (let neighbor of neighbors) {
    if (target) {
      updateNode(node, nodes[neighbor], nodes[target], name, nodes, nodes[start], heuristic, boardArray);
    } else {
      updateNode(node, nodes[neighbor]);
    }
  }
}

function averageNumberOfNodesBetween(currentNode) {
  let num = 0;
  while (currentNode.previousNode) {
    num++;
    currentNode = currentNode.previousNode;
  }
  return num;
}


function updateNode(currentNode, targetNode, actualTargetNode, name, nodes, actualStartNode, heuristic, boardArray) {
  let distance = getDistance(currentNode, targetNode);
  let distanceToCompare;
  if (actualTargetNode && name === "astar") {
    if (heuristic === "manhattanDistance") {
      distanceToCompare = currentNode.distance + targetNode.weight + distance[0] + manhattanDistance(targetNode, actualTargetNode);
    } else if (heuristic === "poweredManhattanDistance") {
      distanceToCompare = currentNode.distance + targetNode.weight + distance[0] + Math.pow(manhattanDistance(targetNode, actualTargetNode), 3);
    } else if (heuristic === "extraPoweredManhattanDistance") {
      distanceToCompare = currentNode.distance + targetNode.weight + distance[0] + Math.pow(manhattanDistance(targetNode, actualTargetNode), 5);
    }
    let startNodeManhattanDistance = manhattanDistance(actualStartNode, actualTargetNode);
  } else if (actualTargetNode && name === "greedy") {
    distanceToCompare = targetNode.weight + distance[0] + manhattanDistance(targetNode, actualTargetNode);
  } else {
    distanceToCompare = currentNode.distance + targetNode.weight + distance[0];
  }
  if (distanceToCompare < targetNode.distance) {
    targetNode.distance = distanceToCompare;
    targetNode.previousNode = currentNode.id;
    targetNode.path = distance[1];
    targetNode.direction = distance[2];
  }
}

function getNeighbors(id, nodes, boardArray) {
  let coordinates = id.split("-");
  let x = parseInt(coordinates[0]);
  let y = parseInt(coordinates[1]);
  let neighbors = [];
  let potentialNeighbor;
  if (boardArray[x - 1] && boardArray[x - 1][y]) {
    potentialNeighbor = `${(x - 1).toString()}-${y.toString()}`
    if (nodes[potentialNeighbor].status !== "wall") neighbors.push(potentialNeighbor);
  }
  if (boardArray[x + 1] && boardArray[x + 1][y]) {
    potentialNeighbor = `${(x + 1).toString()}-${y.toString()}`
    if (nodes[potentialNeighbor].status !== "wall") neighbors.push(potentialNeighbor);
  }
  if (boardArray[x][y - 1]) {
    potentialNeighbor = `${x.toString()}-${(y - 1).toString()}`
    if (nodes[potentialNeighbor].status !== "wall") neighbors.push(potentialNeighbor);
  }
  if (boardArray[x][y + 1]) {
    potentialNeighbor = `${x.toString()}-${(y + 1).toString()}`
    if (nodes[potentialNeighbor].status !== "wall") neighbors.push(potentialNeighbor);
  }
  return neighbors;
}


function getDistance(nodeOne, nodeTwo) {
  let currentCoordinates = nodeOne.id.split("-");
  let targetCoordinates = nodeTwo.id.split("-");
  let x1 = parseInt(currentCoordinates[0]);
  let y1 = parseInt(currentCoordinates[1]);
  let x2 = parseInt(targetCoordinates[0]);
  let y2 = parseInt(targetCoordinates[1]);
  if (x2 < x1) {
    if (nodeOne.direction === "up") {
      return [1, ["f"], "up"];
    } else if (nodeOne.direction === "right") {
      return [2, ["l", "f"], "up"];
    } else if (nodeOne.direction === "left") {
      return [2, ["r", "f"], "up"];
    } else if (nodeOne.direction === "down") {
      return [3, ["r", "r", "f"], "up"];
    }
  } else if (x2 > x1) {
    if (nodeOne.direction === "up") {
      return [3, ["r", "r", "f"], "down"];
    } else if (nodeOne.direction === "right") {
      return [2, ["r", "f"], "down"];
    } else if (nodeOne.direction === "left") {
      return [2, ["l", "f"], "down"];
    } else if (nodeOne.direction === "down") {
      return [1, ["f"], "down"];
    }
  }
  if (y2 < y1) {
    if (nodeOne.direction === "up") {
      return [2, ["l", "f"], "left"];
    } else if (nodeOne.direction === "right") {
      return [3, ["l", "l", "f"], "left"];
    } else if (nodeOne.direction === "left") {
      return [1, ["f"], "left"];
    } else if (nodeOne.direction === "down") {
      return [2, ["r", "f"], "left"];
    }
  } else if (y2 > y1) {
    if (nodeOne.direction === "up") {
      return [2, ["r", "f"], "right"];
    } else if (nodeOne.direction === "right") {
      return [1, ["f"], "right"];
    } else if (nodeOne.direction === "left") {
      return [3, ["r", "r", "f"], "right"];
    } else if (nodeOne.direction === "down") {
      return [2, ["l", "f"], "right"];
    }
  }
}

function manhattanDistance(nodeOne, nodeTwo) {
  let nodeOneCoordinates = nodeOne.id.split("-").map(ele => parseInt(ele));
  let nodeTwoCoordinates = nodeTwo.id.split("-").map(ele => parseInt(ele));
  let xChange = Math.abs(nodeOneCoordinates[0] - nodeTwoCoordinates[0]);
  let yChange = Math.abs(nodeOneCoordinates[1] - nodeTwoCoordinates[1]);
  return (xChange + yChange);
}

module.exports = test;
