'use strict';

{
    /** 配列拡張 */
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
    
    /** 四角形の配置管理 */
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
    RectManager.prototype.getFaceCount = function() {
        return this.rectNum * 2;
    };
    RectManager.prototype.getVertexCount = function() {
        return this.endVertex;
    };
    RectManager.prototype.getRect = function() {
        return this.rect;
    };
    RectManager.prototype.getWall = function() {
        return this.wall;
    };
    RectManager.prototype.getWallNum = function() {
        return this.wallNum;
    };
    RectManager.prototype.getVertexArray = function() {
        return this.vertexArray;
    };
    RectManager.prototype.getRectOrder = function() {
        return this.rectOrder;
    };
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
    
    /** マップ */
    let Map = function() {
        this.map = null;
        this.width = 0;
        this.height = 0;
        this.rectManager = null;
    };
    Map.prototype.initalize = function() {
        this.width = 20;
        this.height = 20;
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,0,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
            [1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1],
            [1,0,1,0,0,1,0,1,0,1,0,1,1,1,0,0,0,1,0,1],
            [1,0,1,0,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,0,1,0,1,0,0,0,1,1,1,0,1,0,1],
            [1,0,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,1],
            [1,0,1,0,1,0,0,1,0,0,0,0,1,1,0,1,0,1,0,1],
            [1,0,1,0,1,1,0,1,1,0,0,1,1,0,0,1,0,1,0,1],
            [1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,0,0,1,0,1,1,1,1,0,0,1,1,1,0,1,0,1],
            [1,0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,1],
            [1,0,1,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1],
            [1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
            [1,0,1,0,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,0,1,0,1,1,1,0,1,0,1,0,1],
            [1,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
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
    Map.prototype.getWidth = function() {
        return this.width;
    };
    Map.prototype.getHeight = function() {
        return this.height;
    };
    Map.prototype.getY = function(x, y) {
        return this.map[y][x];
    };
    Map.prototype.isFloor = function(x, y) {
        let rect = this.rectManager.getRect();
        let vertexArray = this.rectManager.getVertexArray();
        return vertexArray[rect[y][x][0]][1] === 0;
    };
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

    /** マップ描画 */
    let MapRenderer = function() {
        this.renderObject = {};
        this.program = null;
        this.textureArray = [];
        this.uniLocationArray = [];
        this.attLocationArray = [];
        this.attStrideArray = [];
    };
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

        let rect = map.rectManager.getRect();
        let vertexArray = map.rectManager.getVertexArray();
        let vboArray = [], tboArray = [], textureIndexArray = [];
        for (let y = 0; y < map.height; ++y) {
            for (let x = 0; x < map.width; ++x) {
                let vertices = [], uvs = [];
                for (let i = 0; i < 4; ++i) {
                    Array.prototype.push.apply(vertices, 
                        vertexArray[rect[y][x][i]].slice(0, 3));
                    Array.prototype.push.apply(uvs, 
                        vertexArray[rect[y][x][i]].slice(6, 8));
                }
                let vbo = sgl.createVBO(vertices);
                vboArray.push(vbo);
                let tbo = sgl.createVBO(uvs);
                tboArray.push(tbo);
                textureIndexArray.push(0);
            }
        }
        let wall = map.rectManager.getWall();
        for (let z = 0; z < map.rectManager.getWallNum(); ++z) {
            let vertices = [], uvs = [];
            for (let i = 0; i < 4; ++i) {
                Array.prototype.push.apply(vertices, 
                    vertexArray[wall[z][i]].slice(0, 3));
                Array.prototype.push.apply(uvs, 
                    vertexArray[wall[z][i]].slice(6, 8));
            }
            let vbo = sgl.createVBO(vertices);
            vboArray.push(vbo);
            let tbo = sgl.createVBO(uvs);
            tboArray.push(tbo);
            textureIndexArray.push(1);
        }
        this.renderObject.vboArray = vboArray;
        this.renderObject.tboArray = tboArray;
        this.renderObject.textureArray = textureIndexArray;

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
    MapRenderer.prototype.render = function(gl, view, projection) {
        let mMatrix = Matrix44.createIdentity();
        let mvpMatrix = Matrix44.createIdentity();
        Matrix44.multiply(projection, view, mvpMatrix);
        Matrix44.multiply(mvpMatrix, mMatrix, mvpMatrix);
        gl.useProgram(this.program);

        gl.uniformMatrix4fv(this.uniLocationArray['mvpMatrix'], false, mvpMatrix);
        let textureNameArray = ['floor', 'wall'];
        for (let i = 0; i < this.renderObject.vboArray.length; ++i) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.textureArray[textureNameArray[this.renderObject.textureArray[i]]]);
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
