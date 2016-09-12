'use strict';

{
    /** 
     * 2次元配列拡張クラス
     * @constructor 
     */
    let Array2d = function(width, height) {
        let o = new Array(height);
        for (let i = 0; i < o.length; ++i) {
            o[i] = new Array(width);
        }
        o.getWidth = function() {
            return width;
        };
        o.getHeight = function() {
            return height;
        };
        return o;
    };
    
    /** 
     * 四角形の配置管理クラス
     * @constructor 
     */
    let RectManager = function() {
        this.rect = null; // Array2d型に配列で4頂点分格納される [位置x, 位置y, 位置z, 法線x, 法線y, 法線z, テクスチャUV, テクスチャUV] * 4つ
        this.rectOrder = null;
        this.vertexArray = null;
        this.wall = null;
        
        this.width = 0;
        this.height = 0;
        
        this.wallNum = 0;
        this.rectNum = 0;
        this.endVertex = 0;
        this.section = [0, 0, 0, 0];
    };
    /** 
     * 初期化
     * @param {Array.<Array.<number>>} map マップ二次元配列 
     * @param {number} width map の要素数
     * @param {number} height map の要素数
     */
    RectManager.prototype.initalize = function(map, width, height) {
        this.width = width;
        this.height = height;
        
        this.rect = new Array2d(this.width, this.height);
        
        let count = 0;
        for (let z = 1; z < this.height; ++z) {
            for (let x = 0; x < this.width; ++x) {
                if (map[z-1][x] !== map[z][x]) {
                    ++count;
                }
            }
        }
        for (let z = 0; z < this.height; ++z) {
            for (let x = 1; x < this.width; ++x) {
                ++count;
            }
        }
        this.wall = new Array((this.width + this.height) * 2 + count);
        this.rectOrder = new Array((this.width * this.height) + this.width);
        this.vertexArray = new Array((this.width * this.height * 4) + (this.width * 4));
    };
    /** 
     * 床を構築する
     * @param {Array.<Array.<number>>} map マップ二次元配列 
     * @param {number} mulx 床面テクスチャの縦
     * @param {number} muly 床面テクスチャの横
     */
    RectManager.prototype.makeFloor = function(map, mulx, muly) {
        let index = 0;
        for (let z = 0; z < this.height; ++z) {
            for (let x = 0; x < this.width; ++x) {
                let y = map[z][x];
                if (y <= 0) {
                    let x1 = x;
                    let x2 = x + 1;
                    let z1 = z;
                    let z2 = z + 1;
                    let u1 = x1 * mulx;
                    let v1 = z1 * muly;
                    let u2 = x2 * mulx;
                    let v2 = z2 * muly;

                    let flag = 0;
                    if (x > 0 && map[z][x-1] === y) {
                        flag = 1;
                    }
                    if (z > 0) {
                        if (map[z-1][x] === y) {
                            flag += 2;
                        } else if (x < this.width - 1 && map[z-1][x+1] === y) {
                            flag += 4;
                        }
                    }
                    this.rect[z][x] = new Array(4);
                    switch (flag) {
                        case 0:
                            this.rect[z][x][0] = index; this.vertexArray[index++] = [x1, y, z1, 0, 1, 0, u1, v1];
                            this.rect[z][x][1] = index; this.vertexArray[index++] = [x1, y, z2, 0, 1, 0, u1, v2];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, u2, v2];
                            this.rect[z][x][3] = index; this.vertexArray[index++] = [x2, y, z1, 0, 1, 0, u2, v1];
                            break;

                        case 1:
                            this.rect[z][x][0] = this.rect[z][x-1][3];
                            this.rect[z][x][1] = this.rect[z][x-1][2];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, u2, v2];
                            this.rect[z][x][3] = index; this.vertexArray[index++] = [x2, y, z1, 0, 1, 0, u2, v1];
                            break;

                        case 2:
                            this.rect[z][x][0] = this.rect[z-1][x][1];
                            this.rect[z][x][1] = index; this.vertexArray[index++] = [x1, y, z2, 0, 1, 0, u1, v2];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, u2, v2];
                            this.rect[z][x][3] = this.rect[z-1][x][2];
                            break;

                        case 3:
                            this.rect[z][x][0] = this.rect[z][x-1][3];
                            this.rect[z][x][1] = this.rect[z][x-1][2];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, u2, v2];
                            this.rect[z][x][3] = this.rect[z-1][x][2];
                            break;

                        case 4:
                            this.rect[z][x][0] = index; this.vertexArray[index++] = [x1, y, z1, 0, 1, 0, u1, v1];
                            this.rect[z][x][1] = index; this.vertexArray[index++] = [x1, y, z2, 0, 1, 0, u1, v2];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, u2, v2];
                            this.rect[z][x][3] = this.rect[z-1][x+1][1];
                            break;

                        case 5:
                            this.rect[z][x][0] = this.rect[z][x-1][3];
                            this.rect[z][x][1] = this.rect[z][x-1][2];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, u2, v2];
                            this.rect[z][x][3] = this.rect[z-1][x+1][1];
                            break;
                    }
                    this.rectOrder[this.rectNum++] = this.rect[z][x];
                }
            }
        }
        this.section[0] = this.rectNum * 2;
        this.endVertex = index;
    };
    /** 
     * 壁を構築する
     * @param {Array.<Array.<number>>} map マップ二次元配列 
     */
    RectManager.prototype.makeTopWall = function(map) {
        let index = this.endVertex;
        for (let z = 0; z < this.height; ++z) {
            for (let x = 0; x < this.width; ++x) {
                let y = map[z][x];
                if (y > 0) {
                    let x1 = x;
                    let x2 = x + 1;
                    let z1 = z;
                    let z2 = z + 1;

                    let flag = 0;
                    if (x > 0 && map[z][x-1] === y) {
                        flag = 1;
                    }
                    if (z > 0) {
                        if (map[z-1][x] === y) {
                            flag += 2;
                        } else if (x < this.width - 1 && map[z-1][x+1] === y) {
                            flag += 4;
                        }
                    }
                    this.rect[z][x] = new Array(4);
                    switch (flag) {
                        case 0:
                            this.rect[z][x][0] = index; this.vertexArray[index++] = [x1, y, z1, 0, 1, 0, 0, 0];
                            this.rect[z][x][1] = index; this.vertexArray[index++] = [x1, y, z2, 0, 1, 0, 0, 0];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, 0, 0];
                            this.rect[z][x][3] = index; this.vertexArray[index++] = [x2, y, z1, 0, 1, 0, 0, 0];
                            break;

                        case 1:
                            this.rect[z][x][0] = this.rect[z][x-1][3];
                            this.rect[z][x][1] = this.rect[z][x-1][2];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, 0, 0];
                            this.rect[z][x][3] = index; this.vertexArray[index++] = [x2, y, z1, 0, 1, 0, 0, 0];
                            break;

                        case 2:
                            this.rect[z][x][0] = this.rect[z-1][x][1];
                            this.rect[z][x][1] = index; this.vertexArray[index++] = [x1, y, z2, 0, 1, 0, 0, 0];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, 0, 0];
                            this.rect[z][x][3] = this.rect[z-1][x][2];
                            break;
                            
                        case 3:
                            this.rect[z][x][0] = this.rect[z][x-1][3];
                            this.rect[z][x][1] = this.rect[z][x-1][2];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, 0, 0];
                            this.rect[z][x][3] = this.rect[z-1][x][2];
                            break;

                        case 4:
                            this.rect[z][x][0] = index; this.vertexArray[index++] = [x1, y, z1, 0, 1, 0, 0, 0];
                            this.rect[z][x][1] = index; this.vertexArray[index++] = [x1, y, z2, 0, 1, 0, 0, 0];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, 0, 0];
                            this.rect[z][x][3] = this.rect[z-1][x+1][1];
                            break;
                            
                        case 5:
                            this.rect[z][x][0] = this.rect[z][x-1][3];
                            this.rect[z][x][1] = this.rect[z][x-1][2];
                            this.rect[z][x][2] = index; this.vertexArray[index++] = [x2, y, z2, 0, 1, 0, 0, 0];
                            this.rect[z][x][3] = this.rect[z-1][x+1][1];
                            break;
                    }
                    this.rectOrder[this.rectNum++] = this.rect[z][x];
                }
            }
        }
        this.section[1] = this.rectNum * 2;
        this.endVertex = index;
    };
    /** 
     * 外壁を構築する
     * @param {Array.<Array.<number>>} map マップ二次元配列 
     */
    RectManager.prototype.makeOuterWall = function(map) {
        let index = this.endVertex;
        let widX = 0;
        for (let x = 0; x < this.width; ++x) {
            let y1 = map[0][x];
            let x1 = x;
            let x2 = x + 1;
            let z1 = 0;

            this.wall[widX] = new Array(4);
            this.wall[widX][0] = index; this.vertexArray[index++] = [x2, y1, z1, 0, 0, -1, 0, 0];
            this.wall[widX][1] = index; this.vertexArray[index++] = [x2, -1, z1, 0, 0, -1, 0, 0];

            if (x > 0) {
                this.wall[widX][2] = this.wall[widX-1][1];
                if (map[0][x-1] === y1) {
                    this.wall[widX][3] = this.wall[widX-1][0];
                } else {
                    this.wall[widX][3] = this.vertexArray[index++] = [x1, y1, z1, 0, 0, -1, 0, 0];
                }
            } else {
                this.wall[widX][2] = index; this.vertexArray[index++] = [x1, -1, z1, 0, 0, -1, 0, 0];
                this.wall[widX][3] = index; this.vertexArray[index++] = [x1, y1, z1, 0, 0, -1, 0, 0];
            }
            this.rectOrder[this.rectNum++] = this.wall[widX++];
        }

        for (let x = 0; x < this.width; ++x) {
            let y2 = map[this.height-1][x];
            let x1 = x;
            let x2 = x + 1;
            let z2 = this.height;

            this.wall[widX] = new Array(4);
            if (x > 0) {
                if (map[this.height-1][x-1] === y2) {
                    this.wall[widX][0] = this.wall[widX-1][3];
                } else {
                    this.wall[widX][0] = index; this.vertexArray[index++] = [x1, y2, z2, 0, 0, 1, 0, 0];
                }
                this.wall[widX][1] = this.wall[widX-1][2];
            } else {
                this.wall[widX][0] = index; this.vertexArray[index++] = [x1, y2, z2, 0, 0, 1, 0, 0];
                this.wall[widX][1] = index; this.vertexArray[index++] = [x1, -1, z2, 0, 0, 1, 0, 0];
            }
            this.wall[widX][2] = index; this.vertexArray[index++] = [x2, -1, z2, 0, 0, 1, 0, 0];
            this.wall[widX][3] = index; this.vertexArray[index++] = [x2, y2, z2, 0, 0, 1, 0, 0];
            this.rectOrder[this.rectNum++] = this.wall[widX++];
        }

        for (let z = 0; z < this.height; ++z) {
            let y1 = map[z][0];
            let x1 = 0;
            let z1 = z;
            let z2 = z + 1;

            this.wall[widX] = new Array(4);
            if (z > 0) {
                if (map[z-1][2] === y1) {
                    this.wall[widX][0] = this.wall[widX-1][3];
                } else {
                    this.wall[widX][0] = index; this.vertexArray[index++] = [x1, y1, z1, -1, 0, 0, 0, 0];
                }
                this.wall[widX][1] = this.wall[widX-1][2];
            } else {
                this.wall[widX][0] = index; this.vertexArray[index++] = [x1, y1, z1, -1, 0, 0, 0, 0];
                this.wall[widX][1] = index; this.vertexArray[index++] = [x1, -1, z1, -1, 0, 0, 0, 0];
            }
            this.wall[widX][2] = index; this.vertexArray[index++] = [x1, -1, z2, -1, 0, 0, 0, 0];
            this.wall[widX][3] = index; this.vertexArray[index++] = [x1, y1, z2, -1, 0, 0, 0, 0];
            this.rectOrder[this.rectNum++] = this.wall[widX++];
        }

        for (let z = 0; z < this.height; ++z) {
            let y2 = map[z][this.width-1];
            let x2 = this.width;
            let z1 = z;
            let z2 = z + 1;

            this.wall[widX] = new Array(4);
            this.wall[widX][0] = index; this.vertexArray[index++] = [x2, y2, z2, 1, 0, 0, 0, 0];
            this.wall[widX][1] = index; this.vertexArray[index++] = [x2, -1, z2, 1, 0, 0, 0, 0];
            if (z > 0) {
                this.wall[widX][2] = this.wall[widX-1][1];
                if (map[z-1][this.width-1] === y2) {
                    this.wall[widX][3] = this.wall[widX - 1][0];
                } else {
                    this.wall[widX][3] = index; this.vertexArray[index++] = [x2, y2, z1, 1, 0, 0, 0, 0];
                }
            } else {
                this.wall[widX][2] = index; this.vertexArray[index++] = [x2, -1, z1, 1, 0, 0, 0, 0];
                this.wall[widX][3] = index; this.vertexArray[index++] = [x2, y2, z1, 1, 0, 0, 0, 0];
            }
            this.rectOrder[this.rectNum++] = this.wall[widX++];
        }
        this.section[1] = this.rectNum * 2;
        this.endVertex = index;
        this.wallNum = widX;
    };
    /** 
     * 内壁を構築する
     * @param {Array.<Array.<number>>} map マップ二次元配列
     * @param {number} mulx 壁テクスチャの縦
     * @param {number} muly 壁テクスチャの横
     */
    RectManager.prototype.makeInnerWall = function(map, mulx, muly) {
        let sign = function(x) {
            return x < 0 ? -1.0: 1.0;
        }
        let index = this.endVertex;
        let widX = this.wallNum;
        for (let z = 1; z < this.height; ++z) {
            for (let x = 0; x < this.width; ++x) {
                this.wall[widX] = new Array(4);
                if (map[z-1][x] !== map[z][x]) {
                    let y1 = map[z-1][x];
                    let y2 = map[z][x];
                    let x1 = x;
                    let x2 = x + 1;
                    let z1 = z;
                    let u1 = x1 * mulx;
                    let v1 = (1.0 - y1) * muly;
                    let u2 = x2 * mulx;
                    let v2 = (1.0 - y2) * muly;
                    let nz = sign(y1 - y2);

                    if (x > 0 && y1 === map[z-1][x-1] && y2 === map[z][x-1]) {
                        this.wall[widX][0] = this.wall[widX-1][3];
                        this.wall[widX][1] = this.wall[widX-1][2];
                    } else {
                        this.wall[widX][0] = index; this.vertexArray[index++] = [x1, y1, z1, 0, 0, nz, u1, v1];
                        this.wall[widX][1] = index; this.vertexArray[index++] = [x1, y2, z1, 0, 0, nz, u1, v2];
                    }
                    this.wall[widX][2] = index; this.vertexArray[index++] = [x2, y2, z1, 0, 0, nz, u2, v2];
                    this.wall[widX][3] = index; this.vertexArray[index++] = [x2, y1, z1, 0, 0, nz, u2, v1];
                    this.rectOrder[this.rectNum++] = this.wall[widX++];
                }
            }
        }
        for (let x = 1; x < this.width; ++x) {
            for (let z = 0; z < this.height; ++z) {
                this.wall[widX] = new Array(4);
                if (map[z][x-1] !== map[z][x]) {
                    let y1 = map[z][x-1];
                    let y2 = map[z][x];
                    let x1 = x;
                    let z1 = z;
                    let z2 = z + 1;
                    let v1 = (1.0 - y1) * muly;
                    let u1 = z1 * mulx;
                    let v2 = (1.0 - y2) * muly;
                    let u2 = z2 * mulx;
                    let nx = sign(y1 - y2);

                    if (z > 0 && y1 === map[z-1][x-1] && y2 === map[z-1][x]) {
                        this.wall[widX][0] = this.wall[widX-1][1];
                        this.wall[widX][3] = this.wall[widX-1][2];
                    } else {
                        this.wall[widX][0] = index; this.vertexArray[index++] = [x1, y1, z1, nx, 0, 0, u1, v1];
                        this.wall[widX][3] = index; this.vertexArray[index++] = [x1, y2, z1, nx, 0, 0, u1, v2];
                    }
                    this.wall[widX][1] = index; this.vertexArray[index++] = [x1, y1, z2, nx, 0, 0, u2, v1];
                    this.wall[widX][2] = index; this.vertexArray[index++] = [x1, y2, z2, nx, 0, 0, u2, v2];
                    this.rectOrder[this.rectNum++] = this.wall[widX++];
                }
            }
        }
        this.section[2] = this.rectNum * 2;
        this.endVertex = index;
        this.wallNum = widX;
    };
    /** 
     * 面数を取得する
     * @return {number} 面数
     */
    RectManager.prototype.getFaceCount = function() {
        return this.rectNum * 2;
    };
    /** 
     * 頂点数を取得する
     * @return {number} 頂点数
     */
    RectManager.prototype.getVertexCount = function() {
        return this.endVertex;
    };
    /** 
     * 矩形配列（床面のインデックス）を取得する
     * @return {Array2d.<Array.<Array.<number>>>} 矩形配列
     */
    RectManager.prototype.getRect = function() {
        return this.rect;
    };
    /** 
     * 矩形配列（壁面のインデックス）を取得する
     * @return {Array2d.<Array.<number>>} 壁数
     */
    RectManager.prototype.getWall = function() {
        return this.wall;
    };
    /** 
     * 壁面数を取得する
     * @return {number} 壁面数
     */
    RectManager.prototype.getWallNum = function() {
        return this.wallNum;
    };
    /** 
     * 頂点配列を取得する
     * @return {Array.<Array.<*>>} 頂点配列
     */
    RectManager.prototype.getVertexArray = function() {
        return this.vertexArray;
    };
    /** 
     * 矩形配列（順序考慮済み）を取得する
     * @return {Array2d.<Array.<Array.<number>>>} 矩形配列
     */
    RectManager.prototype.getRectOrder = function() {
        return this.rectOrder;
    };
    /** 
     * 構築した情報を表示
     */
    RectManager.prototype.debugPrint = function() {
        for (let z = 0; z < this.height; ++z) {
            for (let x = 0; x < this.width; ++x) {
                console.log('this.rect[' + z + '][' + x + ']: ' + this.rect[z][x]);
            }
        }
        console.log('this.rectOrder: ' + this.rectOrder.length);
        console.log('this.rectNum: ' + this.rectNum);
        console.log('this.section[0]: ' + this.section[0]);
        console.log('this.endVertex: ' + this.endVertex);
    };
    
    /** 
     * マップクラス
     * @constructor 
     */
    let Map = function() {
        this.map = null;
        this.width = 0;
        this.height = 0;
        this.rectManager = null;
    };
    /** 
     * マップを初期化する
     */
    Map.prototype.initalize = function() {
        this.width = 20;
        this.height = 20;
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1],
            [1,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1],
            [1,1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1],
            [1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,0,1],
            [1,1,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,1,0,1],
            [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
            [1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,0,1],
            [1,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,1,1,0,1],
            [1,1,1,1,1,0,0,1,1,0,0,0,1,1,0,0,1,1,0,1],
            [1,1,1,1,1,0,0,1,1,0,0,0,1,1,0,0,1,1,0,1],
            [1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1],
            [1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1],
            [1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1],
            [1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1],
            [1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1],
            [1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        let wallHeight = 1;
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                if (this.map[y][x] === 1) {
                    this.map[y][x] = wallHeight;
                }
            }
        }
        this.rectManager = new RectManager();
        this.rectManager.initalize(this.map, this.width, this.height);
        this.rectManager.makeFloor(this.map, 1, 1);
        this.rectManager.makeTopWall(this.map);
        this.rectManager.makeOuterWall(this.map);
        this.rectManager.makeInnerWall(this.map, 1, 1);
        return true;
    };
    /** 
     * 2Dマップ幅を取得する
     * @return {number} 2Dマップ幅
     */
    Map.prototype.getWidth = function() {
        return this.width;
    };
    /** 
     * 2Dマップ高さを取得する
     * @return {number} 2Dマップ高さ
     */
    Map.prototype.getHeight = function() {
        return this.height;
    };
    /** 
     * 床面の高さを取得する
     * @param {number} x 高さを取得する位置X
     * @param {number} y 高さを取得する位置Y
     */
    Map.prototype.getY = function(x, y) {
        return this.map[y][x];
    };
    /** 
     * 床面であるかを判定する
     * @param {number} x 判定する位置X
     * @param {number} y 判定する位置Y
     */
    Map.prototype.isFloor = function(x, y) {
        let rect = this.rectManager.getRect();
        let vertexArray = this.rectManager.getVertexArray();
        return vertexArray[rect[y][x][0]][1] === 0;
    };
    /** 
     * 床面とレイの交差判定を行う
     * @param {Array.<number>} ray レイの始点
     * @param {Array.<number>} rayDir レイの向き
     * @return {object} 交差しなければ null、交差すれば位置と頂点配列を返す
     */
    Map.prototype.intersectFloor = function(ray, rayDir) {
        let rect = this.rectManager.getRect();
        let vertexArray = this.rectManager.getVertexArray();
        let out = Vector3.create();
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                // 床面以外は判定しない
                if (vertexArray[rect[y][x][0]][1] !== 0) {
                    continue;
                }
                let vertices = [];
                for (let i = 0; i < 4; ++i) {
                    vertices.push(vertexArray[rect[y][x][i]].slice(0, 3));
                }
                let hit = MathUtil.intersectTriangle(
                    vertices[0], vertices[1], vertices[2],
                    ray, rayDir, out
                ) || MathUtil.intersectTriangle(
                    vertices[0], vertices[2], vertices[3],
                    ray, rayDir, out
                );
                if (hit) {
                    return {
                        x: x, y: y, v: vertices
                    };
                }
            }
        }
        return null;
    };

    /** 
     * マップ描画 
     * @constructor
     */
    let MapRenderer = function() {
        this.renderObject = {};
        this.program = null;
        this.textureArray = [];
        this.uniLocationArray = [];
        this.attLocationArray = [];
        this.attStrideArray = [];
    };
    /** 
     * マップ描画を初期化する 
     * @param {Map} map マップオブジェくtp
     * @param {SimpleGL} sgl WebGL ユーティリティ
     * @param {Array.<*>} resouces リソースデータ配列（getNeedResoucesで要求したデータ）
     */
    MapRenderer.prototype.initalize = function(map, sgl, resouces) {
        let gl = sgl.getGL();
        let vs = sgl.compileShader(0, resouces[0]);
        let fs = sgl.compileShader(1, resouces[1]);
        let wtex = sgl.createTexture(resouces[2]);
        let ftex = sgl.createTexture(resouces[3]);

        this.program = sgl.linkProgram(vs, fs);
        gl.useProgram(this.program);

        this.textureArray['wall'] = wtex;
        this.textureArray['floor'] = ftex;

        let rect = map.rectManager.getRectOrder();
        let vertexArray = map.rectManager.getVertexArray();
        let vboArray = [], tboArray = [];
        for (let i = 0; i < rect.length; ++i) { 
            let vertices = [], uvs = [];
            for (let j = 0; j < rect[i].length; ++j) {
                Array.prototype.push.apply(vertices, 
                    vertexArray[rect[i][j]].slice(0, 3));
                Array.prototype.push.apply(uvs, 
                    vertexArray[rect[i][j]].slice(6, 8));
            }
            let vbo = sgl.createVBO(vertices);
            vboArray.push(vbo);
            let tbo = sgl.createVBO(uvs);
            tboArray.push(tbo);
        }
        this.renderObject.vboArray = vboArray;
        this.renderObject.tboArray = tboArray;
        // テクスチャ判定に使用するため、床面数を計算しておく
        let floorNum = rect.length - map.rectManager.getWallNum();
        // 床面数から使用するテクスチャを判定する関数
        this.renderObject.getTexture = (face) => {
            return floorNum > face ? ftex : wtex;
        }

        // 描画順序を考慮しない構築方法
        // let rect = map.rectManager.getRect();
        // let vertexArray = map.rectManager.getVertexArray();
        // let vboArray = [], tboArray = [], textureIndexArray = [];
        // for (let y = 0; y < map.height; ++y) {
        //     for (let x = 0; x < map.width; ++x) {
        //         let vertices = [], uvs = [];
        //         for (let i = 0; i < 4; ++i) {
        //             Array.prototype.push.apply(vertices, 
        //                 vertexArray[rect[y][x][i]].slice(0, 3));
        //             Array.prototype.push.apply(uvs, 
        //                 vertexArray[rect[y][x][i]].slice(6, 8));
        //         }
        //         let vbo = sgl.createVBO(vertices);
        //         vboArray.push(vbo);
        //         let tbo = sgl.createVBO(uvs);
        //         tboArray.push(tbo);
        //         textureIndexArray.push(0);
        //     }
        // }
        // let wall = map.rectManager.getWall();
        // for (let z = 0; z < map.rectManager.getWallNum(); ++z) {
        //     let vertices = [], uvs = [];
        //     for (let i = 0; i < 4; ++i) {
        //         Array.prototype.push.apply(vertices, 
        //             vertexArray[wall[z][i]].slice(0, 3));
        //         Array.prototype.push.apply(uvs, 
        //             vertexArray[wall[z][i]].slice(6, 8));
        //     }
        //     let vbo = sgl.createVBO(vertices);
        //     vboArray.push(vbo);
        //     let tbo = sgl.createVBO(uvs);
        //     tboArray.push(tbo);
        //     textureIndexArray.push(1);
        // }
        // this.renderObject.vboArray = vboArray;
        // this.renderObject.tboArray = tboArray;
        // this.renderObject.textureArray = textureIndexArray;
        
        let vertexIndices = [0, 1, 3, 3, 2, 1];
        let ibo = sgl.createIBO(vertexIndices);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.renderObject.ibo = ibo;
        this.renderObject.indicesLength = vertexIndices.length;

        this.uniLocationArray['mvpMatrix'] = gl.getUniformLocation(this.program, 'mvpMatrix');
        this.uniLocationArray['texture'] = gl.getUniformLocation(this.program, 'texture');
        this.attLocationArray['position'] = gl.getAttribLocation(this.program, 'position');
        this.attLocationArray['color'] = gl.getAttribLocation(this.program, 'color');
        this.attLocationArray['textureCoord'] = gl.getAttribLocation(this.program, 'textureCoord');
        this.attLocationArray['normal'] = gl.getAttribLocation(this.program, 'normal');
        this.attStrideArray['position'] = 3;
        this.attStrideArray['color'] = 4;
        this.attStrideArray['textureCoord'] = 2;
        this.attStrideArray['normal'] = 3;
    };
    /** 
     * マップを描画する
     * @param {webgl} gl webgl オブジェクト
     * @param {Array.<number>} view ビュー行列
     * @param {Array.<number>} projection プロジェクション行列
     */
    MapRenderer.prototype.render = function(gl, view, projection) {
        let mMatrix = Matrix44.createIdentity();
        let mvpMatrix = Matrix44.createIdentity();
        Matrix44.multiply(projection, view, mvpMatrix);
        Matrix44.multiply(mvpMatrix, mMatrix, mvpMatrix);
        gl.useProgram(this.program);

        gl.uniformMatrix4fv(this.uniLocationArray['mvpMatrix'], false, mvpMatrix);
        //let textureNameArray = ['floor', 'wall'];
        for (let i = 0; i < this.renderObject.vboArray.length; ++i) {
            gl.activeTexture(gl.TEXTURE0);
            //gl.bindTexture(gl.TEXTURE_2D, this.textureArray[textureNameArray[this.renderObject.textureArray[i]]]);
            gl.bindTexture(gl.TEXTURE_2D, this.renderObject.getTexture(i));
            gl.bindBuffer(gl.ARRAY_BUFFER, this.renderObject.tboArray[i]);
            gl.enableVertexAttribArray(this.attLocationArray['textureCoord']);
            gl.vertexAttribPointer(this.attLocationArray['textureCoord'], this.attStrideArray['textureCoord'], gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.renderObject.vboArray[i]);
            gl.enableVertexAttribArray(this.attLocationArray['position']);
            gl.vertexAttribPointer(this.attLocationArray['position'], this.attStrideArray['position'], gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.renderObject.ibo);
            gl.drawElements(gl.TRIANGLES, this.renderObject.indicesLength, gl.UNSIGNED_SHORT, 0);
        }
    };
    /** 
     * 描画に必要なリソース配列を取得する
     * @return {Array.<string>} リソースまでのパスの配列
     */
    MapRenderer.getNeedResouces = function() {
        return ['shader/vertex.vs', 'shader/fragment.fs', 'image/wall.png', 'image/floor.png'];
    };

    if (typeof dungeon3d === 'undefined') {
        exports.Map = Map;
        exports.Array2d = Array2d;
    } else {
        dungeon3d.Map = Map;
        dungeon3d.MapRenderer = MapRenderer;
    }
}
