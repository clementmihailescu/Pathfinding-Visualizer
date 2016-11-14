const Node = require("./node");
const launchAnimations = require("./launchAnimations");
const launchInstantAnimations = require("./launchInstantAnimations");
const mazeGenerationAnimations = require("./mazeGenerationAnimations");
const weightedSearchAlgorithm = require("./weightedSearchAlgorithm");
const unweightedSearchAlgorithm = require("./unweightedSearchAlgorithm");
const recursiveDivisionMaze = require("./recursiveDivisionMaze");
const otherMaze = require("./otherMaze");
const otherOtherMaze = require("./otherOtherMaze");
const astar = require("./astar");
const stairDemonstration = require("./stairDemonstration");
const weightsDemonstration = require("./weightsDemonstration");
const simpleDemonstration = require("./simpleDemonstration");
const bidirectional = require("./bidirectional");
const getDistance = require("./getDistance");

function Board(height, width) {
  this.height = height;
  this.width = width;
  this.start = null;
  this.target = null;
  this.object = null;
  this.boardArray = [];
  this.nodes = {};
  this.nodesToAnimate = [];
  this.objectNodesToAnimate = [];
  this.shortestPathNodesToAnimate = [];
  this.objectShortestPathNodesToAnimate = [];
  this.wallsToAnimate = [];
  this.mouseDown = false;
  this.pressedNodeStatus = "normal";
  this.previouslyPressedNodeStatus = null;
  this.previouslySwitchedNode = null;
  this.previouslySwitchedNodeWeight = 0;
  this.keyDown = false;
  this.algoDone = false;
  this.currentAlgorithm = null;
  this.currentHeuristic = null;
  this.numberOfObjects = 0;
  this.isObject = false;
  this.buttonsOn = false;
  this.speed = "fast";
}

Board.prototype.initialise = function() {
  this.createGrid();
  this.addEventListeners();
  this.toggleButtons();
};

Board.prototype.createGrid = function() {
  let tableHTML = "";
  for (let r = 0; r < this.height; r++) {
    let currentArrayRow = [];
    let currentHTMLRow = `<tr id="row ${r}">`;
    for (let c = 0; c < this.width; c++) {
      let newNodeId = `${r}-${c}`, newNodeClass, newNode;
      if (r === Math.floor(this.height / 2) && c === Math.floor(this.width / 4)) {
        newNodeClass = "start";
        this.start = `${newNodeId}`;
      } else if (r === Math.floor(this.height / 2) && c === Math.floor(3 * this.width / 4)) {
        newNodeClass = "target";
        this.target = `${newNodeId}`;
      } else {
        newNodeClass = "unvisited";
      }
      newNode = new Node(newNodeId, newNodeClass);
      currentArrayRow.push(newNode);
      currentHTMLRow += `<td id="${newNodeId}" class="${newNodeClass}"></td>`;
      this.nodes[`${newNodeId}`] = newNode;
    }
    this.boardArray.push(currentArrayRow);
    tableHTML += `${currentHTMLRow}</tr>`;
  }
  let board = document.getElementById("board");
  board.innerHTML = tableHTML;
};

Board.prototype.addEventListeners = function() {
  let board = this;
  for (let r = 0; r < board.height; r++) {
    for (let c = 0; c < board.width; c++) {
      let currentId = `${r}-${c}`;
      let currentNode = board.getNode(currentId);
      let currentElement = document.getElementById(currentId);
      currentElement.onmousedown = (e) => {
        e.preventDefault();
        if (this.buttonsOn) {
          board.mouseDown = true;
          if (currentNode.status === "start" || currentNode.status === "target" || currentNode.status === "object") {
            board.pressedNodeStatus = currentNode.status;
          } else {
            board.pressedNodeStatus = "normal";
            board.changeNormalNode(currentNode);
          }
        }
      }
      currentElement.onmouseup = () => {
        if (this.buttonsOn) {
          board.mouseDown = false;
          if (board.pressedNodeStatus === "target") {
            board.target = currentId;
          } else if (board.pressedNodeStatus === "start") {
            board.start = currentId;
          } else if (board.pressedNodeStatus === "object") {
            board.object = currentId;
          }
          board.pressedNodeStatus = "normal";
        }
      }
      currentElement.onmouseenter = () => {
        if (this.buttonsOn) {
          if (board.mouseDown && board.pressedNodeStatus !== "normal") {
            board.changeSpecialNode(currentNode);
            if (board.pressedNodeStatus === "target") {
              board.target = currentId;
              if (board.algoDone) {
                board.redoAlgorithm();
              }
            } else if (board.pressedNodeStatus === "start") {
              board.start = currentId;
              if (board.algoDone) {
                board.redoAlgorithm();
              }
            } else if (board.pressedNodeStatus === "object") {
              board.object = currentId;
              if (board.algoDone) {
                board.redoAlgorithm();
              }
            }
          } else if (board.mouseDown) {
            board.changeNormalNode(currentNode);
          }
        }
      }
      currentElement.onmouseleave = () => {
        if (this.buttonsOn) {
          if (board.mouseDown && board.pressedNodeStatus !== "normal") {
            board.changeSpecialNode(currentNode);
          }
        }
      }
    }
  }
};

Board.prototype.getNode = function(id) {
  let coordinates = id.split("-");
  let r = parseInt(coordinates[0]);
  let c = parseInt(coordinates[1]);
  return this.boardArray[r][c];
};

Board.prototype.changeSpecialNode = function(currentNode) {
  let element = document.getElementById(currentNode.id), previousElement;
  if (this.previouslySwitchedNode) previousElement = document.getElementById(this.previouslySwitchedNode.id);
  if (currentNode.status !== "target" && currentNode.status !== "start" && currentNode.status !== "object") {
    if (this.previouslySwitchedNode) {
      this.previouslySwitchedNode.status = this.previouslyPressedNodeStatus;
      previousElement.className = this.previouslySwitchedNodeWeight === 15 ?
      "unvisited weight" : this.previouslyPressedNodeStatus;
      this.previouslySwitchedNode.weight = this.previouslySwitchedNodeWeight === 15 ?
      15 : 0;
      this.previouslySwitchedNode = null;
      this.previouslySwitchedNodeWeight = currentNode.weight;

      this.previouslyPressedNodeStatus = currentNode.status;
      element.className = this.pressedNodeStatus;
      currentNode.status = this.pressedNodeStatus;

      currentNode.weight = 0;
    }
  } else if (currentNode.status !== this.pressedNodeStatus && !this.algoDone) {
    this.previouslySwitchedNode.status = this.pressedNodeStatus;
    previousElement.className = this.pressedNodeStatus;
  } else if (currentNode.status === this.pressedNodeStatus) {
    this.previouslySwitchedNode = currentNode;
    element.className = this.previouslyPressedNodeStatus;
    currentNode.status = this.previouslyPressedNodeStatus;
  }
};

Board.prototype.changeNormalNode = function(currentNode) {
  let element = document.getElementById(currentNode.id);
  let relevantStatuses = ["start", "target", "object"];
  let unweightedAlgorithms = ["dfs", "bfs"]
  if (!this.keyDown) {
    if (!relevantStatuses.includes(currentNode.status)) {
      element.className = currentNode.status !== "wall" ?
        "wall" : "unvisited";
      currentNode.status = element.className !== "wall" ?
        "unvisited" : "wall";
      currentNode.weight = 0;
    }
  } else if (this.keyDown === 87 && !unweightedAlgorithms.includes(this.currentAlgorithm)) {
    if (!relevantStatuses.includes(currentNode.status)) {
      element.className = currentNode.weight !== 15 ?
        "unvisited weight" : "unvisited";
      currentNode.weight = element.className !== "unvisited weight" ?
        0 : 15;
      currentNode.status = "unvisited";
    }
  }
};

Board.prototype.drawShortestPath = function(targetNodeId, startNodeId, object) {
  let currentNode;
  if (this.currentAlgorithm !== "bidirectional") {
    currentNode = this.nodes[this.nodes[targetNodeId].previousNode];
    if (object) {
      while (currentNode.id !== startNodeId) {
        this.objectShortestPathNodesToAnimate.unshift(currentNode);
        currentNode = this.nodes[currentNode.previousNode];
      }
    } else {
      while (currentNode.id !== startNodeId) {
        this.shortestPathNodesToAnimate.unshift(currentNode);
        document.getElementById(currentNode.id).className = `shortest-path`;
        currentNode = this.nodes[currentNode.previousNode];
      }
    }
  } else {
    if (this.middleNode !== this.target && this.middleNode !== this.start) {
      currentNode = this.nodes[this.nodes[this.middleNode].previousNode];
      secondCurrentNode = this.nodes[this.nodes[this.middleNode].otherpreviousNode];
      if (secondCurrentNode.id === this.target) {
        this.nodes[this.target].direction = getDistance(this.nodes[this.middleNode], this.nodes[this.target])[2];
      }
      if (this.nodes[this.middleNode].weight === 0) {
        document.getElementById(this.middleNode).className = `shortest-path`;
      } else {
        document.getElementById(this.middleNode).className = `shortest-path weight`;
      }
      while (currentNode.id !== startNodeId) {
        this.shortestPathNodesToAnimate.unshift(currentNode);
        document.getElementById(currentNode.id).className = `shortest-path`;
        currentNode = this.nodes[currentNode.previousNode];
      }
      while (secondCurrentNode.id !== targetNodeId) {
        this.shortestPathNodesToAnimate.unshift(secondCurrentNode);
        document.getElementById(secondCurrentNode.id).className = `shortest-path`;
        if (secondCurrentNode.otherpreviousNode === targetNodeId) {
          if (secondCurrentNode.otherdirection === "left") {
            secondCurrentNode.direction = "right";
          } else if (secondCurrentNode.otherdirection === "right") {
            secondCurrentNode.direction = "left";
          } else if (secondCurrentNode.otherdirection === "up") {
            secondCurrentNode.direction = "down";
          } else if (secondCurrentNode.otherdirection === "down") {
            secondCurrentNode.direction = "up";
          }
          this.nodes[this.target].direction = getDistance(secondCurrentNode, this.nodes[this.target])[2];
        }
        secondCurrentNode = this.nodes[secondCurrentNode.otherpreviousNode]
      }
    } else {
      document.getElementById(this.nodes[this.target].previousNode).className = `shortest-path`;
    }
  }
};

Board.prototype.addShortestPath = function(targetNodeId, startNodeId, object) {
  let currentNode = this.nodes[this.nodes[targetNodeId].previousNode];
  if (object) {
    while (currentNode.id !== startNodeId) {
      this.objectShortestPathNodesToAnimate.unshift(currentNode);
      currentNode.relatesToObject = true;
      currentNode = this.nodes[currentNode.previousNode];
    }
  } else {
    while (currentNode.id !== startNodeId) {
      this.shortestPathNodesToAnimate.unshift(currentNode);
      currentNode = this.nodes[currentNode.previousNode];
    }
  }
};

Board.prototype.drawShortestPathTimeout = function(targetNodeId, startNodeId, type, object) {
  let board = this;
  let currentNode;
  let secondCurrentNode;
  let currentNodesToAnimate;

  if (board.currentAlgorithm !== "bidirectional") {
    currentNode = board.nodes[board.nodes[targetNodeId].previousNode];
    if (object) {
      board.objectShortestPathNodesToAnimate.push("object");
      currentNodesToAnimate = board.objectShortestPathNodesToAnimate.concat(board.shortestPathNodesToAnimate);
    } else {
      currentNodesToAnimate = [];
      while (currentNode.id !== startNodeId) {
        currentNodesToAnimate.unshift(currentNode);
        currentNode = board.nodes[currentNode.previousNode];
      }
    }
  } else {
    if (board.middleNode !== board.target && board.middleNode !== board.start) {
      currentNode = board.nodes[board.nodes[board.middleNode].previousNode];
      secondCurrentNode = board.nodes[board.nodes[board.middleNode].otherpreviousNode];
      if (secondCurrentNode.id === board.target) {
        board.nodes[board.target].direction = getDistance(board.nodes[board.middleNode], board.nodes[board.target])[2];
      }
      if (object) {

      } else {
        currentNodesToAnimate = [];
        board.nodes[board.middleNode].direction = getDistance(currentNode, board.nodes[board.middleNode])[2];
        while (currentNode.id !== startNodeId) {
          currentNodesToAnimate.unshift(currentNode);
          currentNode = board.nodes[currentNode.previousNode];
        }
        currentNodesToAnimate.push(board.nodes[board.middleNode]);
        while (secondCurrentNode.id !== targetNodeId) {
          if (secondCurrentNode.otherdirection === "left") {
            secondCurrentNode.direction = "right";
          } else if (secondCurrentNode.otherdirection === "right") {
            secondCurrentNode.direction = "left";
          } else if (secondCurrentNode.otherdirection === "up") {
            secondCurrentNode.direction = "down";
          } else if (secondCurrentNode.otherdirection === "down") {
            secondCurrentNode.direction = "up";
          }
          currentNodesToAnimate.push(secondCurrentNode);
          if (secondCurrentNode.otherpreviousNode === targetNodeId) {
            board.nodes[board.target].direction = getDistance(secondCurrentNode, board.nodes[board.target])[2];
          }
          secondCurrentNode = board.nodes[secondCurrentNode.otherpreviousNode]
        }
    }
  } else {
    currentNodesToAnimate = [];
    let target = board.nodes[board.target];
    currentNodesToAnimate.push(board.nodes[target.previousNode], target);
  }

}


  timeout(0);

  function timeout(index) {
    setTimeout(function () {
      if (index === 0) {
        shortestPathChange(currentNodesToAnimate[index]);
      } else if (index < currentNodesToAnimate.length) {
        shortestPathChange(currentNodesToAnimate[index], currentNodesToAnimate[index - 1]);
      } else if (index === currentNodesToAnimate.length) {
        shortestPathChange(board.nodes[board.target], currentNodesToAnimate[index - 1], "isActualTarget");
      }
      if (index > currentNodesToAnimate.length) {
        board.toggleButtons();
        return;
      }
      timeout(index + 1);
    }, 40)
  }


  function shortestPathChange(currentNode, previousNode, isActualTarget) {
    if (currentNode === "object") {
      let element = document.getElementById(board.object);
      element.className = "objectTransparent";
    } else if (currentNode.id !== board.start) {
      if (currentNode.id !== board.target || currentNode.id === board.target && isActualTarget) {
        let currentHTMLNode = document.getElementById(currentNode.id);
        if (type === "unweighted") {
          currentHTMLNode.className = "shortest-path-unweighted";
        } else {
          let direction;
          if (currentNode.relatesToObject && !currentNode.overwriteObjectRelation && currentNode.id !== board.target) {
            direction = "storedDirection";
            currentNode.overwriteObjectRelation = true;
          } else {
            direction = "direction";
          }
          if (currentNode[direction] === "up") {
            currentHTMLNode.className = "shortest-path-up";
          } else if (currentNode[direction] === "down") {
            currentHTMLNode.className = "shortest-path-down";
          } else if (currentNode[direction] === "right") {
            currentHTMLNode.className = "shortest-path-right";
          } else if (currentNode[direction] === "left") {
            currentHTMLNode.className = "shortest-path-left";
          } else {
            currentHTMLNode.className = "shortest-path";
          }
        }
      }
    }
    if (previousNode) {
      if (previousNode !== "object" && previousNode.id !== board.target && previousNode.id !== board.start) {
        let previousHTMLNode = document.getElementById(previousNode.id);
        previousHTMLNode.className = previousNode.weight === 15 ? "shortest-path weight" : "shortest-path";
      }
    } else {
      let element = document.getElementById(board.start);
      element.className = "startTransparent";
    }
  }





};

Board.prototype.createMazeOne = function(type) {
  Object.keys(this.nodes).forEach(node => {
    let random = Math.random();
    let currentHTMLNode = document.getElementById(node);
    let relevantClassNames = ["start", "target", "object"]
    let randomTwo = type === "wall" ? 0.25 : 0.35;
    if (random < randomTwo && !relevantClassNames.includes(currentHTMLNode.className)) {
      if (type === "wall") {
        currentHTMLNode.className = "wall";
        this.nodes[node].status = "wall";
        this.nodes[node].weight = 0;
      } else if (type === "weight") {
        currentHTMLNode.className = "unvisited weight";
        this.nodes[node].status = "unvisited";
        this.nodes[node].weight = 15;
      }
    }
  });
};

Board.prototype.clearPath = function(clickedButton) {
  if (clickedButton) {
    let start = this.nodes[this.start];
    let target = this.nodes[this.target];
    let object = this.numberOfObjects ? this.nodes[this.object] : null;
    start.status = "start";
    document.getElementById(start.id).className = "start";
    target.status = "target";
    document.getElementById(target.id).className = "target";
    if (object) {
      object.status = "object";
      document.getElementById(object.id).className = "object";
    }
  }

  document.getElementById("startButtonStart").onclick = () => {
    if (!this.currentAlgorithm) {
      document.getElementById("startButtonStart").innerHTML = '<button class="btn btn-default navbar-btn" type="button">Pick an Algorithm!</button>'
    } else {
      this.clearPath("clickedButton");
      this.toggleButtons();
      let weightedAlgorithms = ["dijkstra", "CLA", "greedy"];
      let unweightedAlgorithms = ["dfs", "bfs"];
      let success;
      if (this.currentAlgorithm === "bidirectional") {
        if (!this.numberOfObjects) {
          success = bidirectional(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic, this);
          launchAnimations(this, success, "weighted");
        } else {
          this.isObject = true;
        }
        this.algoDone = true;
      } else if (this.currentAlgorithm === "astar") {
        if (!this.numberOfObjects) {
          success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
          launchAnimations(this, success, "weighted");
        } else {
          this.isObject = true;
          success = weightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
          launchAnimations(this, success, "weighted", "object", this.currentAlgorithm, this.currentHeuristic);
        }
        this.algoDone = true;
      } else if (weightedAlgorithms.includes(this.currentAlgorithm)) {
        if (!this.numberOfObjects) {
          success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
          launchAnimations(this, success, "weighted");
        } else {
          this.isObject = true;
          success = weightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
          launchAnimations(this, success, "weighted", "object", this.currentAlgorithm, this.currentHeuristic);
        }
        this.algoDone = true;
      } else if (unweightedAlgorithms.includes(this.currentAlgorithm)) {
        if (!this.numberOfObjects) {
          success = unweightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm);
          launchAnimations(this, success, "unweighted");
        } else {
          this.isObject = true;
          success = unweightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm);
          launchAnimations(this, success, "unweighted", "object", this.currentAlgorithm);
        }
        this.algoDone = true;
      }
    }
  }

  this.algoDone = false;
  Object.keys(this.nodes).forEach(id => {
    let currentNode = this.nodes[id];
    currentNode.previousNode = null;
    currentNode.distance = Infinity;
    currentNode.totalDistance = Infinity;
    currentNode.heuristicDistance = null;
    currentNode.direction = null;
    currentNode.storedDirection = null;
    currentNode.relatesToObject = false;
    currentNode.overwriteObjectRelation = false;
    currentNode.otherpreviousNode = null;
    currentNode.otherdistance = Infinity;
    currentNode.otherdirection = null;
    let currentHTMLNode = document.getElementById(id);
    let relevantStatuses = ["wall", "start", "target", "object"];
    if ((!relevantStatuses.includes(currentNode.status) || currentHTMLNode.className === "visitedobject") && currentNode.weight !== 15) {
      currentNode.status = "unvisited";
      currentHTMLNode.className = "unvisited";
    } else if (currentNode.weight === 15) {
      currentNode.status = "unvisited";
      currentHTMLNode.className = "unvisited weight";
    }
  });
};

Board.prototype.clearWalls = function() {
  Object.keys(this.nodes).forEach(id => {
    let currentNode = this.nodes[id];
    let currentHTMLNode = document.getElementById(id);
    if (currentNode.status === "wall") {
      currentNode.status = "unvisited";
      currentHTMLNode.className = "unvisited";
    }
  });
}

Board.prototype.clearWeights = function() {
  Object.keys(this.nodes).forEach(id => {
    let currentNode = this.nodes[id];
    let currentHTMLNode = document.getElementById(id);
    if (currentNode.weight === 15) {
      currentNode.status = "unvisited";
      currentNode.weight = 0;
      currentHTMLNode.className = "unvisited";
    }
  });
}

Board.prototype.clearNodeStatuses = function() {
  Object.keys(this.nodes).forEach(id => {
    let currentNode = this.nodes[id];
    currentNode.previousNode = null;
    currentNode.distance = Infinity;
    currentNode.totalDistance = Infinity;
    currentNode.heuristicDistance = null;
    currentNode.storedDirection = currentNode.direction;
    currentNode.direction = null;
    let relevantStatuses = ["wall", "start", "target", "object"];
    if (!relevantStatuses.includes(currentNode.status)) {
      currentNode.status = "unvisited";
    }
  })
};

Board.prototype.instantAlgorithm = function() {
  let weightedAlgorithms = ["dijkstra", "CLA", "greedy"];
  let unweightedAlgorithms = ["dfs", "bfs"];
  let success;
  if (this.currentAlgorithm === "bidirectional") {
    if (!this.numberOfObjects) {
      success = bidirectional(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic, this);
      launchInstantAnimations(this, success, "weighted");
    } else {
      this.isObject = true;
    }
    this.algoDone = true;
  } else if (this.currentAlgorithm === "astar") {
    if (!this.numberOfObjects) {
      success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
      launchInstantAnimations(this, success, "weighted");
    } else {
      this.isObject = true;
      success = weightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
      launchInstantAnimations(this, success, "weighted", "object", this.currentAlgorithm);
    }
    this.algoDone = true;
  }
  if (weightedAlgorithms.includes(this.currentAlgorithm)) {
    if (!this.numberOfObjects) {
      success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
      launchInstantAnimations(this, success, "weighted");
    } else {
      this.isObject = true;
      success = weightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
      launchInstantAnimations(this, success, "weighted", "object", this.currentAlgorithm, this.currentHeuristic);
    }
    this.algoDone = true;
  } else if (unweightedAlgorithms.includes(this.currentAlgorithm)) {
    if (!this.numberOfObjects) {
      success = unweightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm);
      launchInstantAnimations(this, success, "unweighted");
    } else {
      this.isObject = true;
      success = unweightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm);
      launchInstantAnimations(this, success, "unweighted", "object", this.currentAlgorithm);
    }
    this.algoDone = true;
  }
};

Board.prototype.redoAlgorithm = function() {
  this.clearPath();
  this.instantAlgorithm();
};

Board.prototype.reset = function(objectNotTransparent) {
  this.nodes[this.start].status = "start";
  document.getElementById(this.start).className = "startTransparent";
  this.nodes[this.target].status = "target";
  if (this.object) {
    this.nodes[this.object].status = "object";
    if (objectNotTransparent) {
      document.getElementById(this.object).className = "visitedObjectNode";
    } else {
      document.getElementById(this.object).className = "objectTransparent";
    }
  }
};

Board.prototype.resetHTMLNodes = function() {
  let start = document.getElementById(this.start);
  let target = document.getElementById(this.target);
  start.className = "start";
  target.className = "target";
};

Board.prototype.changeStartNodeImages = function() {
  let unweighted = ["bfs", "dfs"];
  let strikethrough = ["bfs", "dfs"];
  let guaranteed = ["dijkstra", "astar"];
  if (unweighted.includes(this.currentAlgorithm)) {
    if (this.currentAlgorithm === "dfs") {
      document.getElementById("algorithmDescriptor").innerHTML = "This algorithm is <i><b>unweighted</b></i> and <i><b>does not guarantee</b></i> the shortest path!";
    } else {
      document.getElementById("algorithmDescriptor").innerHTML = "This algorithm is <i><b>unweighted</b></i> and <i><b>guarantees</b></i> the shortest path!";
    }
    document.getElementById("toStrikethrough").className = "strikethrough";
    document.getElementById("weightLegend").className = "strikethrough";
    for (let i = 0; i < 14; i++) {
      let j = i.toString();
      let backgroundImage = document.styleSheets["1"].rules[j].style.backgroundImage;
      document.styleSheets["1"].rules[j].style.backgroundImage = backgroundImage.replace("triangle", "spaceship");
    }
  } else {
    if (this.currentAlgorithm === "greedy" || this.currentAlgorithm === "CLA") {
      document.getElementById("algorithmDescriptor").innerHTML = "This algorithm is <i><b>weighted</b></i> and <i><b>does not guarantee</b></i> the shortest path!";
    }
    document.getElementById("toStrikethrough").className = "";
    document.getElementById("weightLegend").className = "";
    for (let i = 0; i < 14; i++) {
      let j = i.toString();
      let backgroundImage = document.styleSheets["1"].rules[j].style.backgroundImage;
      document.styleSheets["1"].rules[j].style.backgroundImage = backgroundImage.replace("spaceship", "triangle");
    }
  }
  if (this.currentAlgorithm === "bidirectional") {
    document.getElementById("algorithmDescriptor").innerHTML = "This algorithm is <i><b>weighted</b></i> and <i><b>does not guarantee</b></i> the shortest path!";
    document.getElementById("bombLegend").className = "strikethrough";
    document.getElementById("startButtonAddObject").className = "navbar-inverse navbar-nav disabledA";
  } else {
    document.getElementById("bombLegend").className = "";
    document.getElementById("startButtonAddObject").className = "navbar-inverse navbar-nav";
  }
  if (guaranteed.includes(this.currentAlgorithm)) {
    document.getElementById("algorithmDescriptor").innerHTML = "This algorithm is <i><b>weighted</b></i> and <i><b>guarantees</b></i> the shortest path!";
  }
}

Board.prototype.toggleButtons = function() {
  document.getElementById("refreshButton").onclick = () => {
    window.location.reload(true);
  }

  if (!this.buttonsOn) {
    this.buttonsOn = true;

    document.getElementById("startButtonStart").onclick = () => {
      if (!this.currentAlgorithm) {
        document.getElementById("startButtonStart").innerHTML = '<button class="btn btn-default navbar-btn" type="button">Pick an Algorithm!</button>'
      } else {
        this.clearPath("clickedButton");
        this.toggleButtons();
        let weightedAlgorithms = ["dijkstra", "CLA", "CLA", "greedy"];
        let unweightedAlgorithms = ["dfs", "bfs"];
        let success;
        if (this.currentAlgorithm === "bidirectional") {
          if (!this.numberOfObjects) {
            success = bidirectional(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic, this);
            launchAnimations(this, success, "weighted");
          } else {
            this.isObject = true;
            success = bidirectional(this.nodes, this.start, this.object, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic, this);
            launchAnimations(this, success, "weighted");
          }
          this.algoDone = true;
        } else if (this.currentAlgorithm === "astar") {
          if (!this.numberOfObjects) {
            success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
            launchAnimations(this, success, "weighted");
          } else {
            this.isObject = true;
            success = weightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
            launchAnimations(this, success, "weighted", "object", this.currentAlgorithm);
          }
          this.algoDone = true;
        } else if (weightedAlgorithms.includes(this.currentAlgorithm)) {
          if (!this.numberOfObjects) {
            success = weightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
            launchAnimations(this, success, "weighted");
          } else {
            this.isObject = true;
            success = weightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm, this.currentHeuristic);
            launchAnimations(this, success, "weighted", "object", this.currentAlgorithm, this.currentHeuristic);
          }
          this.algoDone = true;
        } else if (unweightedAlgorithms.includes(this.currentAlgorithm)) {
          if (!this.numberOfObjects) {
            success = unweightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, this.currentAlgorithm);
            launchAnimations(this, success, "unweighted");
          } else {
            this.isObject = true;
            success = unweightedSearchAlgorithm(this.nodes, this.start, this.object, this.objectNodesToAnimate, this.boardArray, this.currentAlgorithm);
            launchAnimations(this, success, "unweighted", "object", this.currentAlgorithm);
          }
          this.algoDone = true;
        }
      }
    }

    document.getElementById("adjustFast").onclick = () => {
      this.speed = "fast";
      document.getElementById("adjustSpeed").innerHTML = 'Speed: Fast<span class="caret"></span>';
    }

    document.getElementById("adjustAverage").onclick = () => {
      this.speed = "average";
      document.getElementById("adjustSpeed").innerHTML = 'Speed: Average<span class="caret"></span>';
    }

    document.getElementById("adjustSlow").onclick = () => {
      this.speed = "slow";
      document.getElementById("adjustSpeed").innerHTML = 'Speed: Slow<span class="caret"></span>';
    }

    document.getElementById("startStairDemonstration").onclick = () => {
      this.clearWalls();
      this.clearPath("clickedButton");
      this.toggleButtons();
      stairDemonstration(this);
      mazeGenerationAnimations(this);
    }


    document.getElementById("startButtonBidirectional").onclick = () => {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize Bidirectional Swarm!</button>'
      this.currentAlgorithm = "bidirectional";
      this.currentHeuristic = "manhattanDistance";
      if (this.numberOfObjects) {
        let objectNodeId = this.object;
        document.getElementById("startButtonAddObject").innerHTML = '<a href="#">Add a Bomb</a></li>';
        document.getElementById(objectNodeId).className = "unvisited";
        this.object = null;
        this.numberOfObjects = 0;
        this.nodes[objectNodeId].status = "unvisited";
        this.isObject = false;
      }
      this.clearPath("clickedButton");
      this.changeStartNodeImages();
    }

    document.getElementById("startButtonDijkstra").onclick = () => {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize Dijkstra\'s!</button>'
      this.currentAlgorithm = "dijkstra";
      this.changeStartNodeImages();
    }

    document.getElementById("startButtonAStar").onclick = () => {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize Swarm!</button>'
      this.currentAlgorithm = "CLA";
      this.currentHeuristic = "manhattanDistance"
      this.changeStartNodeImages();
    }

    document.getElementById("startButtonAStar2").onclick = () => {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize A*!</button>'
      this.currentAlgorithm = "astar";
      this.currentHeuristic = "poweredManhattanDistance"
      this.changeStartNodeImages();
    }

    document.getElementById("startButtonAStar3").onclick = () => {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize Convergent Swarm!</button>'
      this.currentAlgorithm = "CLA";
      this.currentHeuristic = "extraPoweredManhattanDistance"
      this.changeStartNodeImages();
    }

    document.getElementById("startButtonGreedy").onclick = () => {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize Greedy!</button>'
      this.currentAlgorithm = "greedy";
      this.changeStartNodeImages();
    }

    document.getElementById("startButtonBFS").onclick = () => {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize BFS!</button>'
      this.currentAlgorithm = "bfs";
      this.clearWeights();
      this.changeStartNodeImages();
    }

    document.getElementById("startButtonDFS").onclick = () => {
      document.getElementById("startButtonStart").innerHTML = '<button id="actualStartButton" class="btn btn-default navbar-btn" type="button">Visualize DFS!</button>'
      this.currentAlgorithm = "dfs";
      this.clearWeights();
      this.changeStartNodeImages();
    }

    document.getElementById("startButtonCreateMazeOne").onclick = () => {
      this.clearWalls();
      this.clearPath("clickedButton");
      this.createMazeOne("wall");
    }

    document.getElementById("startButtonCreateMazeTwo").onclick = () => {
      this.clearWalls();
      this.clearPath("clickedButton");
      this.toggleButtons();
      recursiveDivisionMaze(this, 2, this.height - 3, 2, this.width - 3, "horizontal", false, "wall");
      mazeGenerationAnimations(this);
    }

    document.getElementById("startButtonCreateMazeWeights").onclick = () => {
      this.clearWalls();
      this.clearPath("clickedButton");
      this.createMazeOne("weight");
    }

    document.getElementById("startButtonClearBoard").onclick = () => {
      let navbarHeight = document.getElementById("navbarDiv").clientHeight;
      let textHeight = document.getElementById("mainText").clientHeight;
      let height = Math.floor((document.documentElement.clientHeight - navbarHeight - textHeight) / 28);
      let width = Math.floor(document.documentElement.clientWidth / 25);
      let start = Math.floor(height / 2).toString() + "-" + Math.floor(width / 4).toString();
      let target = Math.floor(height / 2).toString() + "-" + Math.floor(3 * width / 4).toString();

        Object.keys(this.nodes).forEach(id => {
          let currentNode = this.nodes[id];
          let currentHTMLNode = document.getElementById(id);
          if (id === start) {
            currentHTMLNode.className = "start";
            currentNode.status = "start";
          } else if (id === target) {
            currentHTMLNode.className = "target";
            currentNode.status = "target"
          } else {
            currentHTMLNode.className = "unvisited";
            currentNode.status = "unvisited";
          }
          currentNode.previousNode = null;
          currentNode.path = null;
          currentNode.direction = null;
          currentNode.storedDirection = null;
          currentNode.distance = Infinity;
          currentNode.totalDistance = Infinity;
          currentNode.heuristicDistance = null;
          currentNode.weight = 0;
          currentNode.relatesToObject = false;
          currentNode.overwriteObjectRelation = false;

        });
      this.start = start;
      this.target = target;
      this.object = null;
      this.nodesToAnimate = [];
      this.objectNodesToAnimate = [];
      this.shortestPathNodesToAnimate = [];
      this.objectShortestPathNodesToAnimate = [];
      this.wallsToAnimate = [];
      this.mouseDown = false;
      this.pressedNodeStatus = "normal";
      this.previouslyPressedNodeStatus = null;
      this.previouslySwitchedNode = null;
      this.previouslySwitchedNodeWeight = 0;
      this.keyDown = false;
      this.algoDone = false;
      this.numberOfObjects = 0;
      this.isObject = false;
    }

    document.getElementById("startButtonClearWalls").onclick = () => {
      this.clearWalls();
    }

    document.getElementById("startButtonClearPath").onclick = () => {
      this.clearPath("clickedButton");
    }

    document.getElementById("startButtonCreateMazeThree").onclick = () => {
      this.clearWalls();
      this.clearPath("clickedButton");
      this.toggleButtons();
      otherMaze(this, 2, this.height - 3, 2, this.width - 3, "vertical", false);
      mazeGenerationAnimations(this);
    }

    document.getElementById("startButtonCreateMazeFour").onclick = () => {
      this.clearWalls();
      this.clearPath("clickedButton");
      this.toggleButtons();
      otherOtherMaze(this, 2, this.height - 3, 2, this.width - 3, "horizontal", false);
      mazeGenerationAnimations(this);
    }

    document.getElementById("startButtonAddObject").onclick = () => {
      let innerHTML = document.getElementById("startButtonAddObject").innerHTML;
      if (this.currentAlgorithm !== "bidirectional") {
        if (innerHTML.includes("Add")) {
          let r = Math.floor(this.height / 2);
          let c = Math.floor(2 * this.width / 4);
          let objectNodeId = `${r}-${c}`;
          if (this.target === objectNodeId || this.start === objectNodeId || this.numberOfObjects === 1) {
            console.log("Failure to place object.");
          } else {
            document.getElementById("startButtonAddObject").innerHTML = '<a href="#">Remove Bomb</a></li>';
            this.clearPath("clickedButton");
            this.object = objectNodeId;
            this.numberOfObjects = 1;
            this.nodes[objectNodeId].status = "object";
            document.getElementById(objectNodeId).className = "object";
          }
        } else {
          let objectNodeId = this.object;
          document.getElementById("startButtonAddObject").innerHTML = '<a href="#">Add a Bomb</a></li>';
          document.getElementById(objectNodeId).className = "unvisited";
          this.object = null;
          this.numberOfObjects = 0;
          this.nodes[objectNodeId].status = "unvisited";
          this.isObject = false;
          this.clearPath("clickedButton");
        }
      }

    }

    document.getElementById("startButtonClearPath").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonClearWalls").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonClearBoard").className = "navbar-inverse navbar-nav";
    if (this.currentAlgorithm !== "bidirectional") {
      document.getElementById("startButtonAddObject").className = "navbar-inverse navbar-nav";
    }
    document.getElementById("startButtonCreateMazeOne").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonCreateMazeTwo").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonCreateMazeThree").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonCreateMazeFour").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonCreateMazeWeights").className = "navbar-inverse navbar-nav";
    document.getElementById("startStairDemonstration").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonDFS").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonBFS").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonDijkstra").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonAStar").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonAStar2").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonAStar3").className = "navbar-inverse navbar-nav";
    document.getElementById("adjustFast").className = "navbar-inverse navbar-nav";
    document.getElementById("adjustAverage").className = "navbar-inverse navbar-nav";
    document.getElementById("adjustSlow").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonBidirectional").className = "navbar-inverse navbar-nav";
    document.getElementById("startButtonGreedy").className = "navbar-inverse navbar-nav";
    document.getElementById("actualStartButton").style.backgroundColor = "";

  } else {
    this.buttonsOn = false;
    document.getElementById("startButtonDFS").onclick = null;
    document.getElementById("startButtonBFS").onclick = null;
    document.getElementById("startButtonDijkstra").onclick = null;
    document.getElementById("startButtonAStar").onclick = null;
    document.getElementById("startButtonGreedy").onclick = null;
    document.getElementById("startButtonAddObject").onclick = null;
    document.getElementById("startButtonAStar2").onclick = null;
    document.getElementById("startButtonAStar3").onclick = null;
    document.getElementById("startButtonBidirectional").onclick = null;
    document.getElementById("startButtonCreateMazeOne").onclick = null;
    document.getElementById("startButtonCreateMazeTwo").onclick = null;
    document.getElementById("startButtonCreateMazeThree").onclick = null;
    document.getElementById("startButtonCreateMazeFour").onclick = null;
    document.getElementById("startButtonCreateMazeWeights").onclick = null;
    document.getElementById("startStairDemonstration").onclick = null;
    document.getElementById("startButtonClearPath").onclick = null;
    document.getElementById("startButtonClearWalls").onclick = null;
    document.getElementById("startButtonClearBoard").onclick = null;
    document.getElementById("startButtonStart").onclick = null;
    document.getElementById("adjustFast").onclick = null;
    document.getElementById("adjustAverage").onclick = null;
    document.getElementById("adjustSlow").onclick = null;

    document.getElementById("adjustFast").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("adjustAverage").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("adjustSlow").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonClearPath").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonClearWalls").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonClearBoard").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonAddObject").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeOne").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeTwo").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeThree").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeFour").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonCreateMazeWeights").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startStairDemonstration").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonDFS").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonBFS").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonDijkstra").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonAStar").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonGreedy").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonAStar2").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonAStar3").className = "navbar-inverse navbar-nav disabledA";
    document.getElementById("startButtonBidirectional").className = "navbar-inverse navbar-nav disabledA";

    document.getElementById("actualStartButton").style.backgroundColor = "rgb(185, 15, 15)";
  }


}

let navbarHeight = document.getElementById("navbarDiv").clientHeight;
let textHeight = document.getElementById("mainText").clientHeight + document.getElementById("otherText").clientHeight;
let height = Math.floor((document.documentElement.clientHeight - navbarHeight - textHeight) / 28);
let width = Math.floor(document.documentElement.clientWidth / 25);
let newBoard = new Board(height, width)
newBoard.initialise();

window.onkeydown = (e) => {
  newBoard.keyDown = e.keyCode;
}

window.onkeyup = (e) => {
  newBoard.keyDown = false;
}
