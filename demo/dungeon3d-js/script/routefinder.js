'use strict';

{
    /** @const */
    const outer = typeof (dungeon3d) === 'undefined' ? exports : dungeon3d;
    /** 
     * ルート探索用の足跡クラス 
     * @constructor 
     */
    let Footprint = function() {
        this.start = null;
        this.depth = 0;
        this.width = 0;
        this.footprint = null;
    };
    /** 
     * 初期化する
     * @param {object} start 探索開始位置 {x, y} 
     * @param {number} maxdepth 最大深度
     */
    Footprint.prototype.initalize = function(start, maxdepth) {
        this.start = start;
        this.depth = maxdepth;
        this.width = maxdepth * 2 + 1;
        // 配列作成 & 0 初期化
        // NOTE: この方法は速度的にどうか調べる
        this.footprint = Array.apply(null, Array(this.width * this.width))
                              .map(function () {return 0;});
    };
    /** 
     * 探索済みの位置をマークする
     * @param {object} pos 探索位置 {x, y} 
     * @param {number} no 設定する数値
     */
    Footprint.prototype.mark = function(pos, no) {
        let x = pos.x - this.start.x + this.depth;
        let y = pos.y - this.start.y + this.depth;
        this.footprint[y * this.width + x] = no;
    };
    /** 
     * 指定された位置に移動可能か判定する
     * @param {object} pos 探索位置 {x, y} 
     * @param {number} count 設定する数値
     * @return {boolean} 移動可能なら true
     */
    Footprint.prototype.isMove = function(pos, count) {
        let x = pos.x - this.start.x + this.depth;
        let y = pos.y - this.start.y + this.depth;
        let mark = this.footprint[y * this.width + x];
        return mark === 0 || mark === count;
    };
    /** @const */
    const MOVE_STATE = {
        STOP: 0,
        MOVE: 1
    };
    /** 
     * 移動可能オブジェクト 
     * @constructor 
     */
    let RouteMovableObject = function() {
        this.x = 0; // 2D マップ上のX位置
        this.y = 0; // 2D マップ上のY位置
        this.direction = 0; // 方向
        this.pose = 0; // 姿勢
        this.position = []; // 3D 上の位置

        this.prevX = 0; // 2D マップ上の以前のX位置
        this.prevY = 0; // 2D マップ上の以前のY位置
        this.moveQueue = []; // 移動先キュー
        this.moveStartTime = 0; // 移動開始時間
        this.moveGridStartTime = 0; // 移動開始時間（1マス）
        this.moveState = MOVE_STATE.STOP; // キャラ状態
    };
    /** 
     * 移動キューをクリアする
     */
    RouteMovableObject.prototype.clearMoveQueue = function() {
        // 参照を切らさない方法2つ
        // this.moveQueue.clear();
        // this.moveQueue.length = 0;
        // 今は参照が切れても問題ない
        this.moveQueue = [];
    };
    /** 
     * キューに移動先を追加
     * @param {object} pos 2Dマップ上の移動先
     */
    RouteMovableObject.prototype.addMoveQueue = function(pos) {
        this.moveQueue.push(pos);
    };
    /** 
     * 次の移動場所を求める
     * @return {boolean} 移動できれば true
     */
    RouteMovableObject.prototype._getNextPos = function() {
        if (this.moveQueue.length === 0) {
            return false;
        }
        this.prevX = this.x;
        this.prevY = this.y;

        let pos = this.moveQueue.pop();
        this.x = pos.x;
        this.y = pos.y;
        if (this.prevX === this.x) {
            if (this.prevY < this.y) {
                this.direction = 4;
            } else {
                this.direction = 0;
            }
        } else {
            if (this.prevY < this.y) {
                this.direction = 3;
            } else if (this.prevY > this.y) {
                this.direction = 1;
            } else {
                this.direction = 2;
            }
            if (this.prevX > this.x) {
                this.direction = 8 - this.direction;
            }
        }
        return true;
    };
    /** 
     * 指定位置に移動できるか判定する
     * @param {number} x 2Dマップ上の移動先X
     * @param {number} y 2Dマップ上の移動先Y
     * @return {boolean} 移動できれば true
     */
    RouteMovableObject.prototype.isMove = function(x, y) {
        if (this.x === x && this.y === y) {
            return false;
        }

        if (this.moveQueue.length > 0 && this.moveQueue[0].x === x && this.moveQueue[0].y === y) {
            return false;
        }
        return true;
    };
    /** 
     * 移動を開始する
     * @param {number} time 移動開始時間
     */
    RouteMovableObject.prototype.startMove = function(time) {
        if (this.moveState === MOVE_STATE.STOP) {
            if (this._getNextPos()) {
                this.moveState = MOVE_STATE.MOVE;
                this.moveStartTime = this.moveGridStartTime = time;
            }
        }
    };
    /** 
     * 移動を進める
     * @param {dungeon3d.Map} map マップオブジェクト
     * @param {number} time 現在時間
     */
    RouteMovableObject.prototype.moveStep = function(map, time) {
        if (this.moveState !== MOVE_STATE.MOVE) {
            return false;
        }
        let diffTime = time - this.moveGridStartTime;
        let moveX = this.x - this.prevX;
        let moveY = this.y - this.prevY;
        let stepTime = Math.sqrt(moveX * moveX + moveY * moveY) * 400;
        while (diffTime >= stepTime) {
            if (!this._getNextPos()) {
                this.position = [
                    this.x + 0.5, 
                    map.getY(this.x, this.y), 
                    this.y + 0.5
                ];
                this.moveState = MOVE_STATE.STOP;
                this.pose = 0;
                return false;
            }
            this.moveGridStartTime += stepTime;
            diffTime -= stepTime;
        }
        diffTime /= stepTime;
        this.position[0] = (this.x - this.prevX) * diffTime + this.prevX + 0.5;
        this.position[2] = (this.y - this.prevY) * diffTime + this.prevY + 0.5;
        if (diffTime < 0.5) {
            this.position[1] = map.getY(this.prevX, this.prevY);
        } else {
            this.position[1] = map.getY(this.x, this.y);
        }
        diffTime = time - this.moveStartTime;
        this.pose = Math.floor(diffTime / 64) % 8;
        return true;
    };
    /** 
     * 2Dマップ上の位置を取得する
     * @return {object} 移動できれば true
     */
    RouteMovableObject.prototype.getPos = function() {
        return {
            x: this.x,
            y: this.y
        };
    };
    /** @const */
    const DIRECTION = {
        UP: 0,
        DN: 1,
        LE: 2,
        RI: 3,
        UL: 4,
        UR: 5,
        DL: 6,
        DR: 7
    };
    /** 
     * 方向を検索する
     * @param {object} now 現在位置
     * @param {object} pos 移動位置
     * @return {number} DIRECTION 定数
     */
    let CalcTargetDir = function(now, pos) {
        let distX = pos.x - now.x;
        let distY = pos.y - now.y;
        let absX = Math.abs(distX);
        let absY = Math.abs(distY);

        if (absX * 2 <= absY) {
            if (distY > 0) {
                return DIRECTION.DL;
            }
            return DIRECTION.UP;
        }
        if (absY * 2 <= absX) {
            if (distX > 0) {
                return DIRECTION.RI;
            }
            return DIRECTION.LE;
        }
        if (now.x < pos.X) {
            if (now.y < pos.y) {
                return DIRECTION.DR;
            }
            return DIRECTION.UR;
        }
        if (now.x > pos.X) {
            if (now.y < pos.y) {
                return DIRECTION.DL;
            }
            return DIRECTION.UL;
        }
        // Unreachable
        return DIRECTION.UP;
    };
    /** @const */
    const MOVE = {
        UP: { x: 0, y:-1 },
        DN: { x: 0, y: 1 },
        LE: { x:-1, y: 0 },
        RI: { x: 1, y: 0 },
        UL: { x:-1, y:-1 },
        UR: { x:-1, y: 1 },
        DL: { x: 1, y:-1 },
        DR: { x: 1, y: 1 }
    };
    /** 
     * ルート探索クラス 
     * @constructor 
     */
    let RouteFinder = function() {
        this.isMoveFunction = null;
    };
    /** @const */
    RouteFinder.FindStatus = {
        OK: 0, 
        NotFound: 1, 
        Error: -1
    };
    /** @const */
    RouteFinder._TABLE = [
        [MOVE.UP, MOVE.UL, MOVE.UR, MOVE.LE, MOVE.RI, MOVE.DL, MOVE.DR, MOVE.DN], // 上
        [MOVE.DN, MOVE.DL, MOVE.DR, MOVE.LE, MOVE.RI, MOVE.UL, MOVE.UR, MOVE.UP], // 下
        [MOVE.LE, MOVE.UL, MOVE.DL, MOVE.UP, MOVE.DN, MOVE.UR, MOVE.DR, MOVE.RI], // 左
        [MOVE.RI, MOVE.UR, MOVE.DR, MOVE.UP, MOVE.DN, MOVE.UL, MOVE.DL, MOVE.LE], // 右
        [MOVE.UL, MOVE.UP, MOVE.LE, MOVE.UR, MOVE.DL, MOVE.RI, MOVE.DN, MOVE.DR], // 上左
        [MOVE.UR, MOVE.UP, MOVE.RI, MOVE.UL, MOVE.DR, MOVE.LE, MOVE.DN, MOVE.DL], // 上右
        [MOVE.DL, MOVE.DN, MOVE.LE, MOVE.DR, MOVE.UL, MOVE.RI, MOVE.UP, MOVE.UR], // 下左
        [MOVE.DR, MOVE.DN, MOVE.RI, MOVE.DL, MOVE.UR, MOVE.LE, MOVE.UP, MOVE.UL]  // 下右
    ];
    /** 
     * ルート探索
     * @param {RouteMovableObject} movable 移動対象
     * @param {Footprint} footprint ルート探索用の足跡オブジェクト
     * @param {number} depth 深度
     * @param {number} maxDepth 最大深度
     * @param {object} oldPos 古い位置
     * @param {object} newPos 新しい位置
     * @return {number} FindStatus 定数
     */
    RouteFinder.prototype.findRoute = function(movable, footprint, depth, maxDepth, oldPos, newPos) {
        footprint.mark(oldPos, -1);
        ++depth;
        if (depth >= maxDepth) {
            //console.log('RouteFinder: 探索深度超過');
            return RouteFinder.FindStatus.NotFound;
        }
        let dir = CalcTargetDir(oldPos, newPos);
        let tbl = RouteFinder._TABLE[dir];
        for (let i = 0; i < 8; ++i) {
            let pos = {x: oldPos.x + tbl[i].x, y: oldPos.y + tbl[i].y};
            if (pos.x === newPos.x && pos.y === newPos.y) {
                return RouteFinder.FindStatus.OK;
            }
            if (this._isMove(footprint, depth, pos)) {
                footprint.mark(pos, depth);
            }
        }
        for (let i = 0; i < 8; ++i) {
            let pos = {x: oldPos.x + tbl[i].x, y: oldPos.y + tbl[i].y};
            if (this._isMove(footprint, depth, pos)) {
                switch (this.findRoute(movable, footprint, depth, maxDepth, pos, newPos)) {
                    case RouteFinder.FindStatus.OK:
                        movable.addMoveQueue(pos);
                        return RouteFinder.FindStatus.OK;
                    case RouteFinder.FindStatus.Error:
                        return RouteFinder.FindStatus.Error;
                }
            }
        }
        return RouteFinder.FindStatus.NotFound;
    };
    /** 
     * ルート探索
     * @param {RouteMovableObject} movable 移動対象
     * @param {object} newPos 新しい位置
     */
    RouteFinder.prototype.calcRoute = function(movable, newPos) {
        movable.clearMoveQueue();
        movable.addMoveQueue(newPos);

        let mapPos = movable.getPos();
        let maxDepth = Math.abs(newPos.x - mapPos.x);
        let yDist = Math.abs(newPos.y - mapPos.y);
        if (maxDepth < yDist) {
            maxDepth = yDist;
        }
        maxDepth = maxDepth * 2; // 最大探索距離を直線距離の2倍に制限する。
        let footprint = new Footprint();
        footprint.initalize(mapPos, maxDepth);
        if (this.findRoute(movable, footprint, 0, maxDepth, mapPos, newPos) !== RouteFinder.FindStatus.OK) {
            movable.clearMoveQueue();
        }
    };
    /** 
     * 移動開始させる
     * @param {RouteMovableObject} movable 移動対象
     * @param {object} newPos 新しい位置
     * @return {boolean} 移動開始すれば true
     */
    RouteFinder.prototype.moveTo = function(movable, time, newPos) {
        if (!movable.isMove(newPos.x, newPos.y)) {
            return false;
        }
        this.calcRoute(movable, newPos);
        movable.startMove(time);
        return true;
    };
    /** 
     * 外部移動判定関数を設定する
     * @param {function(number, number)} func 移動判定関数 
     */
    RouteFinder.prototype.setIsMoveFunction = function(func) {
        this.isMoveFunction = func;
    };
    /** 
     * 移動可能か判定する
     * @param {Footprint} footprint ルート探索用の足跡クラス 
     * @param {number} count 移動カウンタ
     * @return {boolean} 移動できるなら true
     */
    RouteFinder.prototype._isMove = function(footprint, count, pos) {
        if (this.isMoveFunction && !this.isMoveFunction(pos.x, pos.y)) {
            return false;
        }
        return footprint.isMove(pos, count);
    };

    outer.Footprint = Footprint;
    outer.RouteFinder = RouteFinder;
    outer.RouteMovableObject = RouteMovableObject;
}
