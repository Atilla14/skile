var nodeObjects = [];
var lineObjects = [];
var papers = [];
var globalIds = {};
var GS = [];
var selectedNodeId = [];


function setRoot(id, index){
	nodeObjects[index][id].isRoot = true;
	return id;
}

function setNodeText(id, s, index){
	nodeObjects[index][id].text.content = s;
}

function setNodeLinkObject(o, index){
	nodeObjects[index][selectedNodeId].linkObject = o;
}

function setNodeLink(url, index){
	nodeObjects[index][selectedNodeId].link = url;
}

function initGlobalId(index){
	globalIds[index] = 0;
}

function getId(index){
	return globalIds[index] += 1;
}

function setCenter(pos, index){
	GS[index].CENTER = pos;
}

function getPaper(paperIndex){
	return papers[paperIndex];
}

function setPaper(paperIndex){
	var newPaper = new paper.PaperScope();
	newPaper.setup(String(paperIndex));
	papers[paperIndex] = newPaper;
}

function createNode(x, y, r, c, paper, index){
	var tempNode = new paper.Path.Circle(new paper.Point(x, y), r);
	tempNode.myId = getId(index);
	tempNode.onDoubleClick = function(event){
		if(paper.view.zoom != 1){
			paper.view.zoom = 1;
			paper.view.center = GS[index].CENTER;
		}else{
			paper.view.center = this.position;
			paper.view.zoom = 4;
		}
	}
	tempNode.text = new paper.PointText(new paper.Point(x-r-30, y+r+20));
	tempNode.fillColor = c;
	nodeObjects[index][globalIds[index]] = tempNode;
	tempNode.isRoot = false;
	return tempNode.myId;
}

function createLine(p1, p2, paper, index){
	var tempLine = new paper.Path.Line(p1.position, p2.position);
	tempLine.strokeColor = "red";
	tempLine.myId = getId(index);
	lineObjects[index][tempLine.myId] = tempLine;
	lineObjects[index][tempLine.myId].nodes = [p1, p2];
	return tempLine.myId;
}

function connectNode(id1, id2, paper, index){
	var oParent = nodeObjects[index][id1];
	var oChild = nodeObjects[index][id2];
	var line = createLine(oParent, oChild, paper, index);
}


var rootId;

function connectNodes(path, paper, index){
		var keys = Object.keys(path);
		keys.forEach(function(key){
			if(key !== "GS"){
				var node = path[key];
				node.children.forEach(function(child){
					connectNode(key, child, paper, index);
				});
			}
		});
}	


// make this function smaller
function decodeEncoded(encoded){
	var canvasCount = 0;
	var paper;
	if(encoded){
		encoded.forEach(function(encodedObj){
			setPaper(canvasCount);
			paper = getPaper(canvasCount);
			initGlobalId(canvasCount);
			var path = JSON.parse(encodedObj.path);
			var keys = Object.keys(path);
			GS.push(path.GS);
			setCenter(paper.view.center, canvasCount);

			keys.forEach(function(key){
				if(key != "GS"){
					if(path[key].type==="n"){
						if(path[key].id === 1){
							nodeObjects[canvasCount] = {};
							lineObjects[canvasCount] = {};
							rootId = setRoot(createNode(GS[canvasCount].ROOT_NODE_X, 
									GS[canvasCount].ROOT_NODE_Y, GS[canvasCount].NODE_RADIUS, 
									"red", paper, canvasCount), canvasCount);
						}else{
							var x = path[key].posRatio.x * paper.view.viewSize._width;
							var y = path[key].posRatio.y * paper.view.viewSize._height;
							createNode(x, y, GS[canvasCount].NODE_RADIUS, "red", paper, canvasCount);
							paper.view.draw();
						}

						setNodeText(key, path[key].link.title, canvasCount);
					}else if(path[key].type==="l"){			
						connectNode(path[key].nodes[0], path[key].nodes[1], paper, canvasCount);
					}	
				}
				
			});
			paper.view.draw();

			canvasCount += 1;
		});
	}
}
