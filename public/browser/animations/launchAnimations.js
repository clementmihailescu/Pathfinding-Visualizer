const weightedSearchAlgorithm = require("../pathfindingAlgorithms/weightedSearchAlgorithm");
const unweightedSearchAlgorithm = require("../pathfindingAlgorithms/unweightedSearchAlgorithm");

function launchAnimations(board, success, type, object, algorithm, heuristic) {
  let nodes = object ? board.objectNodesToAnimate.slice(0) : board.nodesToAnimate.slice(0);
  let speed = board.speed === "fast" ?
    0 : board.speed === "average" ?
      100 : 500;
  let shortestNodes;
  function timeout(index) {
    setTimeout(function () {
      if (index === nodes.length) {
        if (object) {
          board.objectNodesToAnimate = [];
          if (success) {
            board.addShortestPath(board.object, board.start, "object");
            board.clearNodeStatuses();
            let newSuccess;
            if (board.currentAlgorithm === "bidirectional") {

            } else {
              if (type === "weighted") {
                newSuccess = weightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm, heuristic);
              } else {
                newSuccess = unweightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm);
              }
            }
            document.getElementById(board.object).className = "visitedObjectNode";
            launchAnimations(board, newSuccess, type);
            return;
          } else {
            console.log("Failure.");
            board.reset();
            board.toggleButtons();
            return;
          }
        } else {
          board.nodesToAnimate = [];
          if (success) {
            if (document.getElementById(board.target).className !== "visitedTargetNodeBlue") {
              document.getElementById(board.target).className = "visitedTargetNodeBlue";
            }
            if (board.isObject) {
              board.addShortestPath(board.target, board.object);
              board.drawShortestPathTimeout(board.target, board.object, type, "object");
              board.objectShortestPathNodesToAnimate = [];
              board.shortestPathNodesToAnimate = [];
              board.reset("objectNotTransparent");
            } else {
              board.drawShortestPathTimeout(board.target, board.start, type);
              board.objectShortestPathNodesToAnimate = [];
              board.shortestPathNodesToAnimate = [];
              board.reset();
            }
            shortestNodes = board.objectShortestPathNodesToAnimate.concat(board.shortestPathNodesToAnimate);
            return;
          } else {
            console.log("Failure.");
            board.reset();
            board.toggleButtons();
            return;
          }
        }
      } else if (index === 0) {
        if (object) {
          document.getElementById(board.start).className = "visitedStartNodePurple";
        } else {
          if (document.getElementById(board.start).className !== "visitedStartNodePurple") {
            document.getElementById(board.start).className = "visitedStartNodeBlue";
          }
        }
        if (board.currentAlgorithm === "bidirectional") {
          document.getElementById(board.target).className = "visitedTargetNodeBlue";
        }
        change(nodes[index])
      } else if (index === nodes.length - 1 && board.currentAlgorithm === "bidirectional") {
        change(nodes[index], nodes[index - 1], "bidirectional");
      } else {
        change(nodes[index], nodes[index - 1]);
      }
      timeout(index + 1);
    }, speed);
  }

  function change(currentNode, previousNode, bidirectional) {
    let currentHTMLNode = document.getElementById(currentNode.id);
    let relevantClassNames = ["start", "target", "object", "visitedStartNodeBlue", "visitedStartNodePurple", "visitedObjectNode", "visitedTargetNodePurple", "visitedTargetNodeBlue"];
    if (!relevantClassNames.includes(currentHTMLNode.className)) {
      currentHTMLNode.className = !bidirectional ?
        "current" : currentNode.weight === 15 ?
          "visited weight" : "visited";
    }
    if (currentHTMLNode.className === "visitedStartNodePurple" && !object) {
      currentHTMLNode.className = "visitedStartNodeBlue";
    }
    if (currentHTMLNode.className === "target" && object) {
      currentHTMLNode.className = "visitedTargetNodePurple";
    }
    if (previousNode) {
      let previousHTMLNode = document.getElementById(previousNode.id);
      if (!relevantClassNames.includes(previousHTMLNode.className)) {
        if (object) {
          previousHTMLNode.className = previousNode.weight === 15 ? "visitedobject weight" : "visitedobject";
        } else {
          previousHTMLNode.className = previousNode.weight === 15 ? "visited weight" : "visited";
        }
      }
    }
  }

  function shortestPathTimeout(index) {
    setTimeout(function () {
      if (index === shortestNodes.length){
        board.reset();
        if (object) {
          shortestPathChange(board.nodes[board.target], shortestNodes[index - 1]);
          board.objectShortestPathNodesToAnimate = [];
          board.shortestPathNodesToAnimate = [];
          board.clearNodeStatuses();
          let newSuccess;
          if (type === "weighted") {
            newSuccess = weightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm);
          } else {
            newSuccess = unweightedSearchAlgorithm(board.nodes, board.object, board.target, board.nodesToAnimate, board.boardArray, algorithm);
          }
          launchAnimations(board, newSuccess, type);
          return;
        } else {
          shortestPathChange(board.nodes[board.target], shortestNodes[index - 1]);
          board.objectShortestPathNodesToAnimate = [];
          board.shortestPathNodesToAnimate = [];
          return;
        }
      } else if (index === 0) {
        shortestPathChange(shortestNodes[index])
      } else {
        shortestPathChange(shortestNodes[index], shortestNodes[index - 1]);
      }
      shortestPathTimeout(index + 1);
    }, 40);
  }

  function shortestPathChange(currentNode, previousNode) {
    let currentHTMLNode = document.getElementById(currentNode.id);
    if (type === "unweighted") {
      currentHTMLNode.className = "shortest-path-unweighted";
    } else {
      if (currentNode.direction === "up") {
        currentHTMLNode.className = "shortest-path-up";
      } else if (currentNode.direction === "down") {
        currentHTMLNode.className = "shortest-path-down";
      } else if (currentNode.direction === "right") {
        currentHTMLNode.className = "shortest-path-right";
      } else if (currentNode.direction === "left") {
        currentHTMLNode.className = "shortest-path-left";
      } else if (currentNode.direction = "down-right") {
        currentHTMLNode.className = "wall"
      }
    }
    if (previousNode) {
      let previousHTMLNode = document.getElementById(previousNode.id);
      previousHTMLNode.className = "shortest-path";
    } else {
      let element = document.getElementById(board.start);
      element.className = "shortest-path";
      element.removeAttribute("style");
    }
  }

  timeout(0);

};

module.exports = launchAnimations;
