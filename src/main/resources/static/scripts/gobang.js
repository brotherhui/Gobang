function Gobang(canvasDOM, rows, cols) {
	function Background(rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.draw = function() {
			this.canvas.fillStyle = "rgb(208, 141, 47)";
			this.canvas.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
			this.canvas.fillStyle = "#000000";

			this.canvas.beginPath();
			var cellWidth = this.canvasWidth / (this.cols + 1);
			var cellHeight = this.canvasHeight / (this.rows + 1);
			for ( var i = 1; i <= this.cols; i++) {
				this.canvas.fillText(i-1, cellWidth * i - 3, cellHeight*15 + 15);
				this.canvas.moveTo(cellWidth * i, cellHeight);
				this.canvas.lineTo(cellWidth * i, this.canvasHeight
						- cellHeight);
			}
			for ( var i = 1; i <= this.rows; i++) {
				this.canvas.fillText(rowIndex[i-1], cellWidth - 20, cellHeight * i + 5);
				this.canvas.moveTo(cellWidth, cellHeight * i);
				this.canvas
						.lineTo(this.canvasWidth - cellWidth, cellHeight * i);
			}
			this.canvas.closePath();
			this.canvas.stroke();
		}
	}

	function StonePool(rows, cols) {
		this.draw = function(currentPlayer) {
			var white = (currentPlayer == 0);
			var radius = this.game.cellWidth + this.game.cellHeight;
			radius /= 4;
			this.canvas.fillStyle = white ? '#fff' : '#000';
			for ( var i = this.moves.length - 1; i >= 0; i--) {
				this.canvas.fillStyle = currentPlayer == 0 ? "#000" : "#fff";
				this.canvas.beginPath();
				this.canvas.arc(this.moves[i][1] * this.game.cellWidth
						+ this.game.cellWidth, this.moves[i][0]
						* this.game.cellHeight + this.game.cellHeight, radius,
						0, 2 * Math.PI);
				this.canvas.closePath();
				this.canvas.fill();
				currentPlayer = 1 - currentPlayer;

				if (i == this.moves.length - 1) {
					this.canvas.fillStyle = "#f00";
					this.canvas.beginPath();
					this.canvas.arc(this.moves[i][1] * this.game.cellWidth
							+ this.game.cellWidth, this.moves[i][0]
							* this.game.cellHeight + this.game.cellHeight, 3,
							0, 2 * Math.PI);
					this.canvas.closePath();
					this.canvas.fill();
				}
			}
		}
	}

	//初始化一些参数，行数， 列数
	/* utils */
	this.inBoard = function(row, col) {
		return row >= 0 && col >= 0 && row < this.rows && col < this.cols;
	}

	this.rows = rows ? rows : 15;
	this.cols = cols ? cols : 15;
	function UUID(){
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
	}
	
	var drawNum;
	
//	drawNum = function() {
//	    function S4() {
//	       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
//	    }
//	    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
//	}

	this.currentPlayer = 0;
	this.moves = [];
	//var rowIndex = ["O","N","M","L","K","J","I","H","G","F","E","D","C","B","A"];
	var rowIndex = ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14"];
	this.grid = new Array(this.rows);
	for ( var i = 0; i < this.rows; i++)
		this.grid[i] = new Array(this.cols);

	//是否使用AI
	this.enableAI = true;
	//默认的难度等级
	this.hardness = 2;
	//等待移动的步骤
	this.newMove = function(row, col) {
		//倒记时
		countDown();
		if (this.grid[row][col] != -1)
			return;
		this.grid[row][col] = this.currentPlayer;
		this.moves.push([ row, col ]);
		//记录怎么走的到右边
		recordSteps(this.moves);
		this.draw();

		this.currentPlayer = 1 - this.currentPlayer;

	}
	
	this.regret = function() {
		var tmp = this.moves.pop();
		if (tmp)
			this.grid[tmp[0]][tmp[1]] = -1;
		tmp = this.moves.pop();
		if (tmp)
			this.grid[tmp[0]][tmp[1]] = -1;
		this.currentPlayer = 1 - this.currentPlayer;
		this.draw();
		this.currentPlayer = 1 - this.currentPlayer;
		recordSteps(this.moves);
		$.get("regret/"+drawNum+"/");
	}
	//记录怎么走的到右边
	function recordSteps (moves){
		var color = "";
		var steps = "";
		for(var i = 0; i < moves.length; i++){
			color = (i%2==0)?"Black: " : "White: ";
			steps +=(i+1)+":"+ color+" row-"+rowIndex[moves[i][0]]+", col-"+moves[i][1]+"\n";
		}
		$("#recordSteps").html(steps);
	}

	//倒记时
	function countDown(){
        if(this.intervalId){
            clearInterval(this.intervalId);
        }
		var remains = 60;
        this.intervalId=window.setInterval(function(){
			if(remains<0){
                clearInterval(this.intervalId);
                return;
            }
			$("#remaingTime").html(remains--);
		}, 1000);
		
	}
	
	this.init = function() {
		this.canvasDOM = canvasDOM;
		this.mainCanvas = canvasDOM.getContext("2d");
		if (!this.mainCanvas)
			return false;
		this.width = canvasDOM.width;
		this.height = canvasDOM.height;
		this.cellWidth = this.width / (this.cols + 1);
		this.cellHeight = this.height / (this.rows + 1);

		this.hoverCanvasDOM = document.createElement("canvas");
		this.hoverCanvasDOM.width = this.width;
		this.hoverCanvasDOM.height = this.height;
		this.hoverCanvas = this.hoverCanvasDOM.getContext("2d");
		document.getElementsByClassName("gobang-container")[0]
				.appendChild(this.hoverCanvasDOM);

		document.getElementById("gobang-result").style.display = "none";
		document.getElementById("gobang-welcome").style.display = "table";
		document.getElementById("chooseColor").style.display = "none";

		drawNum = UUID();
		var game = this;
		var buttons = document.getElementsByClassName("gobang-start");
		for ( var i = 0; i < buttons.length; i++)
			buttons[i].onclick = function() {
				$.get("reset/"+drawNum+"/")
				game.run();
			}

		Background.prototype.canvas = this.mainCanvas;
		Background.prototype.canvasWidth = this.width;
		Background.prototype.canvasHeight = this.height;
		Background.prototype.game = this;

		StonePool.prototype.canvas = this.mainCanvas;
		StonePool.prototype.canvasWidth = this.width;
		StonePool.prototype.canvasHeight = this.height;
		StonePool.prototype.moves = this.moves;
		StonePool.prototype.game = this;

		this.bg = new Background(this.rows, this.cols);
		this.stones = new StonePool(this.rows, this.cols);
		return true;
	}

	this.draw = function() {
		this.bg.draw();
		this.stones.draw(this.currentPlayer);
	}

	this.clearHover = function() {
		this.hoverCanvas.clearRect(0, 0, this.hoverCanvasDOM.width,
				this.hoverCanvasDOM.height);
	}

	this.drawFocus = function(row, col) {
		this.clearHover();
		this.hoverCanvas.beginPath();
		this.hoverCanvas.fillStyle = "#000000";
		this.hoverCanvas.rect(col * this.cellWidth + this.cellWidth / 2, row
				* this.cellHeight + this.cellHeight / 2, this.cellWidth,
				this.cellHeight);
		this.hoverCanvas.closePath();
		this.hoverCanvas.stroke();
	}

	this.run = function() {
		this.currentPlayer=0;
		this.moves.splice(0, this.moves.length);
		for ( var i = 0; i < this.rows; i++)
			for ( var j = 0; j < this.cols; j++)
				this.grid[i][j] = -1;

		this.draw();

		document.getElementById("gobang-welcome").style.display = "none";
		document.getElementById("gobang-result").style.display = "none";
		document.getElementById("chooseColor").style.display = "none";

		var game = this;
		//获取事件所点击的位置
		function coordOnBoard(element, e) {
			var ratioX = canvasDOM.width / canvasDOM.offsetWidth;
			var ratioY = canvasDOM.height / canvasDOM.offsetHeight;
			return {
				y : Math.round((e.pageY - element.offsetTop) * ratioY
						/ game.cellHeight) - 1,
				x : Math.round((e.pageX - element.offsetLeft) * ratioX
						/ game.cellWidth) - 1
			};
		}

		//绑定click事件
		this.hoverCanvasDOM.onclick = function(e) {
			pos = coordOnBoard(this, e);
			if (pos.x >= 0 && pos.y >= 0 && pos.x < game.cols
					&& pos.y < game.rows) {
				
				var row = pos.y;
				var col = pos.x;
				
				//judge whether have a piece in this cell
				if(judgeExist(row, col))
					return ;

				game.newMove(row, col);
				if(game.moves.length==1){					
					//初始化落子
					$.get("/init/"+drawNum+"/"+row+"/"+col);
					//如果走了1步， 开始选择哪一方是电脑
					//原程序是走了5步选的
					//选择哪一方
					choose();
				}else{
					play(row, col);
				}
			}
		}
		
		function choose(){
			$("#chooseColor").show();
			$("#chooseColor a").click(function(){
				$("#chooseColor").hide();
				$("#gobang-waiting").show();
				var color = $(this).hasClass("white")?1:-1;
				$.ajax({
					url : "/start/"+drawNum+"/"+color,
					type : "post",
					dataType : "json",
					success : function(res) {
						if(res!=null){
							var row = res.point.x;
							var col = res.point.y;
							game.newMove(row, col);
						}
						$("#gobang-waiting").hide();
					},
					error : function() {
						$("#gobang-waiting").hide();
					}
				});
			});
		}
		
		function judgeExist(row , col){
			var arr = [row, col];
			for(var i = 0; i < game.moves.length; i++){
				if(game.moves[i].toString() == arr.toString()){
					return true;
				}
			}
			return false;
		}
		
		function play(row, col) {
			$("#gobang-waiting").show();
			$.ajax({
				url : "play/"+drawNum+"/"+row+"/"+col,
				type : "post",
				dataType : "json",
				success : function(res) {
					if(res.win){
						var winner = res.stone==1? "WHITE":"BLACK";
						$("#gobang-winner").html(winner);
						$("#gobang-result").show();
					}
                    if(res.point) {
                        var row = res.point.x;
                        var col = res.point.y;
                        game.newMove(row, col);
                    }
					$("#gobang-waiting").hide();
				},
				error : function() {
					alert("play Something Wrong");
				}
			});
		}
		

		
		var mouseOnBoard = false;
		this.hoverCanvasDOM.addEventListener("mouseover", function(e) {
			mouseOnBoard = true;
		});
		this.hoverCanvasDOM.addEventListener("mousemove", function(e) {
			if (!mouseOnBoard)
				return;
			pos = coordOnBoard(this, e);
			if (pos.x >= 0 && pos.y >= 0 && pos.x < game.cols
					&& pos.y < game.rows)
				game.drawFocus(pos.y, pos.x);
		});
		this.hoverCanvasDOM.addEventListener("mouseout", function(e) {
			mouseOnBoard = false;
			game.clearHover();
		});
	}

	this.finish = function(winner) {
		document.getElementById("gobang-welcome").style.display = "none";
		document.getElementById("gobang-result").style.display = "table";
		canvasDOM.onclick = null;
	}
}
