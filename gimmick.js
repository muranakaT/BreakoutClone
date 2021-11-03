
const gimmick = {
    none: 0,

    // 正の場合、ブロックにライフあり
    normal: 1,

    // 負の場合、ブロックに仕掛けあり
    longpaddle: -1,             // パドルが長くなる
    shortpaddle: -2,            // パドルが短くなる
    speedup: -3,                // ボールが加速する
    largesize: -4,              // ボールを大きくする
    deleterow: -5,              // 同じ行のブロックを破壊する
    deletecol: -6,              // 同じ列のブロックを破壊する
    addball: -7,                // ボールをもう一個追加する
    rupture: -8,                // 四方にボールを拡散させる
    bomb: -9                    // 周囲のブロックを破壊する
}

// ギミック判定(true: ギミックあり、false: ギミックなし)
function checkGimmick(objb, r, c) {
    // 負の場合
    if(gimmick.none > blocks.map[r][c]) {
        effect(objb, r, c);
        return true;
    }
    return false;
}

// ギミックで破壊したブロックのギミックは作動しない
function effect(objb, r, c) {
    switch(blocks.map[r][c]) {
        case gimmick.longpaddle:
            paddle.width *= 2;
            setTimeoutId(reset.longpaddle)
            break;
        case gimmick.shortpaddle:
            paddle.width /= 2;
            setTimeoutId(reset.shortpaddle)
            break;
        case gimmick.speedup:
            objb.dx *= 2;
            objb.dy *= 2;
            setTimeoutId(reset.speedup, objb);
            break;
        case gimmick.largesize:
            objb.radius = 10;
            setTimeoutId(reset.largesize, objb);
            break;
        case gimmick.deleterow:
            deleteRow(r);
            break;
        case gimmick.deletecol:
            deleteCol(c);
            break;
        case gimmick.addball:
            addBall(objb, r, c);
            break;
        case gimmick.rupture:
            rupture(objb, r, c);
            break;
        case gimmick.bomb:
            bomb(r, c);
            break;
        default:
            console.log("gimmickNo: " + gimmickNo + " は作成していないギミックです。");
            break;
    }
}

const reset = {
    time: 10000,

    longpaddle: function() {
        paddle.width /= 2;
        paddle.timeoutId.splice(0, 0);
    },
    shortpaddle: function() {
        paddle.width *= 2;
        paddle.timeoutId.splice(0, 0);
    },
    speedup: function(objb) {
        objb.dx /= 2;
        objb.dy /= 2;
        objb.timeoutId.splice(0, 0);
    },
    largesize: function(objb){
        objb.radius = 4;
        objb.timeoutId.splice(0, 0);
    }
}

// タイムアウトIDを保持する
function setTimeoutId(resetFunc, objb) {

    /* パドル */
    if(objb == undefined){
        var id = setTimeout(resetFunc, reset.time);
        paddle.timeoutId.push(id);
    }
    /* ボール */
    else{
        var id = setTimeout(resetFunc, reset.time, objb);
        objb.timeoutId.push(id);
    }
}

// タイムアウトIDをクリアする
function clearTimeoutId(objb) {

    /* パドル */
    if(objb == undefined){
        for(var i=0; i < paddle.timeoutId.length; i++){
            clearTimeout(paddle.timeoutId[i]);
        }
        paddle.timeoutId.splice(0);
    }
    /* ボール */
    else {
        for(var i=0; i < objb.timeoutId.length; i++) {
            clearTimeout(objb.timeoutId[i]); 
        }
        objb.timeoutId.splice(0);
    }
}

// 1行削除(ライフに関わらず破壊する)
function deleteRow(r) {
    for(var i=0; i < blocks.column; i++) {
        blocks.map[r][i] = gimmick.none;
    } 
}

// 1列削除(ライフに関わらず破壊する)
function deleteCol(c) {
    for(var i=0; i < blocks.row; i++) {
        blocks.map[i][c] = gimmick.none;
    }
}

function addBall(objb, r, c) {
    var objb = copyBall(ball);
    objb.x = blocks.pos[r][c].x;
    objb.y = blocks.pos[r][c].y;
    if(objb.dx > 0){
        objb.dx = -ball.speed;
    }else {
        objb.dx = ball.speed;
    }
    objb.dy = -ball.speed;
    createBall(objb);
}

// 4つのボールを追加する
function rupture(objb, r, c) {
    // 左上
    var objb1 = copyBall(ball);
    objb1.x = objb.x;
    objb1.y = objb.y;
    objb1.dx = -objb1.speed;
    objb1.dy = -objb1.speed;
    createBall(objb1);

    // 右上
    var objb2 = copyBall(ball);
    objb2.x = objb.x;
    objb2.y = objb.y;
    objb2.dx = objb2.speed;
    objb2.dy = -objb2.speed;
    createBall(objb2);

    // 右下
    var objb3 = copyBall(ball);
    objb3.x = objb.x;
    objb3.y = objb.y;
    objb3.dx = objb3.speed;
    objb3.dy = objb3.speed;
    createBall(objb3);

    // 左下
    var objb4 = copyBall(ball);
    objb4.x = objb.x;
    objb4.y = objb.y;
    objb4.dx = -objb4.speed;
    objb4.dy = objb4.speed;
    createBall(objb4);
}

// 周囲の1マス削除(ライフに関わらず破壊する)
function bomb(r, c) {
    // 左上
    if(c == 0 && r == 0) {
        blocks.map[r][c+1] = 0;
        blocks.map[r+1][c] = 0;
        blocks.map[r+1][c+1] = 0;
    }
    // 右上
    else if(c == blocks.column-1 && r == 0) {
        blocks.map[r][c-1] = 0;
        blocks.map[r+1][c-1] = 0;
        blocks.map[r+1][c] = 0;
    }

    // 右下
    else if(c == blocks.column-1 && r == blocks.row-1) {
        blocks.map[r-1][c-1] = 0;
        blocks.map[r-1][c] = 0;
        blocks.map[r][c-1] = 0;
    }
    // 左下
    else if(c == 0 && r == blocks.row-1) {
        blocks.map[r-1][c] = 0;
        blocks.map[r-1][c+1] = 0;
        blocks.map[r][c+1] = 0;
    }
    // 上端
    else if(r == 0) {
        blocks.map[r][c-1] = 0;
        blocks.map[r][c+1] = 0;
        blocks.map[r+1][c-1] = 0;
        blocks.map[r+1][c] = 0;
        blocks.map[r+1][c+1] = 0;
    }
    // 右端
    else if(c == blocks.column-1) {
        blocks.map[r-1][c-1] = 0;
        blocks.map[r-1][c] = 0;
        blocks.map[r][c-1] = 0;
        blocks.map[r+1][c-1] = 0;
        blocks.map[r+1][c] = 0;
    }
    // 下端
    else if(r == blocks.row-1) {
        blocks.map[r-1][c-1] = 0;
        blocks.map[r-1][c] = 0;
        blocks.map[r-1][c+1] = 0;
        blocks.map[r][c-1] = 0;
        blocks.map[r][c+1] = 0;
    }
    // 左端
    else if(c == 0) {
        blocks.map[r-1][c] = 0;
        blocks.map[r-1][c+1] = 0;
        blocks.map[r][c+1] = 0;
        blocks.map[r+1][c] = 0;
        blocks.map[r+1][c+1] = 0;
    }
    // 中
    else {
        blocks.map[r-1][c-1] = 0;
        blocks.map[r-1][c] = 0;
        blocks.map[r-1][c+1] = 0;
        blocks.map[r][c-1] = 0;
        blocks.map[r][c+1] = 0;
        blocks.map[r+1][c-1] = 0;
        blocks.map[r+1][c] = 0;
        blocks.map[r+1][c+1] = 0;
    }
}