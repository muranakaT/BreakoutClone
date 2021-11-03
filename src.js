
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

const stateDefine = {
    setup: 0,           // セットアップ
    prepare: 1,         // 準備中
    playing: 2,         // プレイ中
    gameover: 3,        // ゲームオーバー
    stageclear: 4,      // ステージクリア
    gameclear: 5        // ゲームクリア
}

const state = {
    current: stateDefine.setup
};

const balls = {
    obj: [],
 
    draw: function() {
        for(var i=0; i < this.obj.length; i++) {
            if(this.obj[i].alive) {
                ball.draw(this.obj[i]);
            }else {
                // オブジェクト削除
                this.obj.splice(i, 1);
                i--;
            }
        }
    }
};

const ball = {
    x: null,
    y: null,
    radius: null,
    speed: null,
    dx: null,
    dy: null,
    color: 'rgb(' + randomColor() + ',' + randomColor() + ',' + randomColor() + ')',
    alive: true,
    timeoutId: [], 

    draw: function(obj) {
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, 2*Math.PI, 0);
        ctx.fillStyle = obj.color;
        ctx.fill();
        ctx.closePath();

        obj.x += obj.dx;
        obj.y += obj.dy;
    }
};

// 生存しているボールの個数を返す
function getLiveBall() {
    var survivor = 0;
    for(var i=0; i < balls.obj.length; i++) {
        if(balls.obj[i].alive) {
            survivor++;
        }
    }
    return survivor;
}

// ボールのディープコピーを作成する
function copyBall() {
    return JSON.parse(JSON.stringify(ball));
}

// ボールオブジェクトを設定する
function createBall(obj) {
//    obj.alive = true;       // コピー元がtrueであるため不使用
    obj.color = 'rgb(' + randomColor() + ',' + randomColor() + ',' + randomColor() + ')';
    balls.obj.push(obj);
}

// ボールオブジェクトを全削除する
function clearBall() {
    balls.obj.splice(0);
}

const paddle = {
    x: null,
    y: null,
    width: null,
    height: null,
//    speed: 0,       // マウスカーソルで動かすため不使用
    timeoutId: [],

    draw: function() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "rgba(100, 0, 255, 0.3)";
        ctx.fill();
        ctx.closePath();

//        this.x += this.speed;
//        this.y += this.speed;
    }
};

const blocks = {
    map: null,
    pos: [],
    row: null,
    column: null,
    paddingX: null,
    paddingY: null,
    offsetLeft: null,
    offsetTop: null,

    draw: function() {
        for(var r=0; r < this.row; r++) {
            this.pos[r] = [];
            for(var c=0; c < this.column; c++) {
                // ブロックなし
                if(this.map[r][c] == gimmick.none) {
                    continue;
                }

                block.draw(r, c);
            }
        } 
    }
};

const block = {
    x: null,
    y: null,
    width: 20,
    height: 10,
    color: null,

    draw: function(r, c) {

        this.x = c*(this.width + blocks.paddingX)+blocks.offsetLeft;
        this.y = r*(this.height + blocks.paddingY)+blocks.offsetTop;
        blocks.pos[r][c] = {x: this.x, y: this.y};

        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = getBlockColor(blocks.map[r][c]);
	    ctx.fill();
        ctx.closePath();
    }
}

// ブロックのカラーを返す
function getBlockColor(gimmickNo) {
    switch(gimmickNo) {
        case gimmick.longpaddle:
            return "rgba(0, 0, 255, 1.0)";
        case gimmick.shortpaddle:
            return "rgba(0, 0, 255, 0.3)";
        case gimmick.speedup:
            return "rgba(0, 255, 0, 1.0)";
        case gimmick.speeddown:
            return "rgba(0, 255, 0, 0.3)";
        case gimmick.deleterow:
            return "rgba(0, 100, 100, 0.3)";
        case gimmick.deletecol:
            return "rgba(100, 0, 100, 0.3)";
        case gimmick.addball:
            return "rgba(100, 100, 0, 0.5)";
        case gimmick.rupture:
            return "rgba(100, 0, 255, 0.7)";
        case gimmick.bomb:
            return "rgba(200, 0, 0, 1.0)";
        default:
            return "rgba(0, 0, 0, 1.0)";
    }
}

const score = {
    num: 0,

    draw: function() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillText("Score: " + this.num, 8, 20);
    }
};

const life = {
    num: null,

    draw: function() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillText("Lives: " + this.num, canvas.width-65, 20);
    }
};

const finish = {
    draw: function(){
        // ゲームオーバー
        if(state.current == stateDefine.gameover) {
            draw();
            field("#000");
            alert("Game Over!!");
            
        }
        // ステージクリア
        else if(state.current == stateDefine.stageclear) {
            init();
            stage.level++;
            blocks.map = getMap(stage.level);

            // ゲームクリア
            if(blocks.map == null){
                draw();
                alert("Congratulations");
            }
        }
    }
};

const stage = {
    level: null,

    draw: function() {
        var stageId = document.getElementById("myStage");
        stageId.innerText = "STAGE: " + this.level;
    }
};

//rgbカラーの数値をランダムで指定
function randomColor() {
    return Math.floor(Math.random() * 256);
}

// 開始（1ゲームで1回だけ実行される）
function start() {
    field("#ddd");

    life.num = 3;
    score.num = 0;
    stage.level = 1;

    blocks.map = getMap(stage.level);
    blocks.row = blocks.map.length;
    blocks.column = blocks.map[0].length;
    blocks.paddingX = (canvas.width-(block.width*blocks.column)) / (blocks.column-1);
    blocks.paddingY = 5;
}

// 初期化
function init() {

    /* パドル */
    paddle.width = 50;
    paddle.height = 10;
    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.y = canvas.height - paddle.height;
    clearTimeoutId();

    /* ボール */
    ball.radius = 4;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - paddle.height - ball.radius;
    ball.speed = 3;
    ball.dx = 0;
    ball.dy = 0;
    var objb = copyBall(ball);
    clearBall();
    createBall(objb);

    /* ブロック */
    blocks.offsetLeft = 5;
    blocks.offsetTop = 7;

    /* ステージマップ */
    stage.draw();

    state.current = stateDefine.prepare;
}

// ステージ
function field(colorStr) {
    canvas.setAttribute("style", 'display:block;margin:auto;background-color:' + colorStr);
}

// マウス移動
document.addEventListener('mousemove', mouseMoveHandler, false);
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        // パドル（とボール）
        movable(relativeX);
    }
}

// パドル移動
function movable(relativeX) {
    // ボール（準備状態の場合のみ）
    if(state.current == stateDefine.prepare) {
        balls.obj[0].x = relativeX;
        if(balls.obj[0].x < paddle.width / 2) {
            balls.obj[0].x = paddle.width / 2;
        }else if(balls.obj[0].x > canvas.width - paddle.width / 2) {
            balls.obj[0].x = canvas.width - paddle.width / 2;
        }
    }
    // パドル
    paddle.x = relativeX - paddle.width / 2;
    if(paddle.x < 0) {
        paddle.x = 0;
    }else if(paddle.x > canvas.width - paddle.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// マウスクリック
document.addEventListener('click', mouseclickHandler, false);
function mouseclickHandler(e) {
    if(state.current == stateDefine.prepare) {
        shot();
    }
    state.current = stateDefine.playing;
}

// ボール発射
function shot() {
    balls.obj[0].dx = balls.obj[0].speed;
    balls.obj[0].dy = -balls.obj[0].speed;
}

// 衝突判定(壁)
function collodeWall(objb) {
    // 上
    if(objb.y - objb.radius < 0) {
        reflectY(objb);
    }
    // 下
    else if(objb.y + objb.radius > canvas.height - paddle.height) {
        if(objb.x >= paddle.x && objb.x <= paddle.x + paddle.width) {
            reflectY(objb);
        }
        // ボールがパドルの上面より下、キャンバス下部より上の場合
//        else if (objb.y + objb.radius <= canvas.height 
//              && objb.y + objb.radius >= canvas.height - paddle.height) {
            // NOP
//        }
        // キャンバス下部より下にボールが落ちた時に死亡判定
        else {
            death(objb);
        }
    }

    // 左右
    if(objb.x - objb.radius < 0 || objb.x + objb.radius > canvas.width){
        reflectX(objb);
    }
}

// 衝突判定(ブロック)
function collodeBlock(objb) {
    for(var r=0; r < blocks.row; r++) {
        for(var c=0; c < blocks.column; c++) {
            if(blocks.map[r][c] != 0) {
                var blockX = blocks.pos[r][c].x;
                var blockY = blocks.pos[r][c].y;

                // 衝突!!
                if(objb.x > blockX 
                && objb.x < blockX + block.width 
                && objb.y > blockY 
                && objb.y < blockY + block.height
                ) {

                    if(!checkGimmick(objb, r, c)) {
                        blocks.map[r][c]--;
                    }else {
                        blocks.map[r][c] = gimmick.none;
                    }

                    reflectY(objb);
                    score.num++;
                    return;
                }
            }
        }
    }
}

// 生存している全ボールの衝突判定
function checkCollode() {
    for(var i=0; i < balls.obj.length; i++) {
        collodeWall(balls.obj[i]);
        collodeBlock(balls.obj[i]);
    }
}

// ボールを跳ね返す
function reflectX(objb) {
    objb.dx = -objb.dx;
}
function reflectY(objb) {
    objb.dy = -objb.dy;
}

// 死亡処理
function death(objb) {

    objb.alive = false;
    clearTimeoutId(objb);
    
    if(getLiveBall() == 0){
        // ライフを一つ減らす
        life.num--;

        if(life.num == 0) {
            state.current = stateDefine.gameover;
            finish.draw();
        } else {
            init();
        }
    }
}

// クリア判定
function checkClear() {
    for(var r=0; r < blocks.row; r++) {
        for(var c=0; c < blocks.column; c++) {
            if(blocks.map[r][c] != 0) {
                return;
            }
        }
    }

    clear();
}

// クリア処理
function clear() {
    state.current = stateDefine.stageclear;
    finish.draw();
}

function draw() {
    balls.draw();
    paddle.draw();
    blocks.draw();
    score.draw();
    life.draw();
    stage.draw();
}

function loop (){
    // 描画クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 描画
    draw();

    // 衝突検知
    checkCollode();

    // クリア判定
    checkClear();

    // 再帰
    if(state.current != stateDefine.gameover && state.current != stateDefine.gameclear){
        window.requestAnimationFrame(loop);
    }
}

function main() {
    start();
    init();
    loop();
}

main();
