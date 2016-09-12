'use strict';

/** 
 * WebGL ユーティリティ
 * @constructor 
 */
var SimpleGL = function() {
    this.canvas = null;
    this.gl = null;
};
/** 
 * 初期化
 * @param {string} canvasId キャンバス要素のId
 * @param {number} width キャンバスの幅
 * @param {number} height キャンバスの高さ
 * @return {boolean} 初期化に成功すれば true
 */
SimpleGL.prototype.initalize = function(canvasId, width, height) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = width;
    this.canvas.height = height;
    
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (this.gl === null || typeof this.gl === 'undefined') {
        console.log('WebGL not supported.');
        return false;
    }
    return true;
};
/** 
 * キャンバスをクリアする
 * @param {number} r クリアする色 R
 * @param {number} g クリアする色 G
 * @param {number} b クリアする色 B
 */
SimpleGL.prototype.clear = function(r, g, b) {
    this.gl.clearColor(r, g, b, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
};
/** 
 * ファイルを読み込む
 * @param {string} url 読み込み先 URL
 * @param {object} data コールバックに渡すオブジェクト
 * @param {function(string, object)} successCallback 成功時に呼び出されるコールバック
 * @param {function(string)} errorCallback 失敗時に呼び出されるコールバック
 */
SimpleGL.prototype.loadFile = function(url, data, successCallback, errorCallback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status == 200) {
                successCallback(request.responseText, data);
            } else {
                errorCallback(url);
            }
        }
    };
    request.send(null);
};
/** 
 * 複数のファイルを読み込む
 * @param {Array.<string|Array.<string>>} urls 読み込み先 URL 配列
 * @return {Promise} プロミスオブジェクト
 */
SimpleGL.prototype.loadFiles = function(urls) {
    function XHRCollector(allItemCount, cb, ecb, param) {
        var count = 0;
        return function(e) {
            if (this.status == 200) {
                var target = param;
                if (this.arrayIndex !== -1) {
                    if (typeof param[this.arrayIndex] === 'undefined') {
                        param[this.arrayIndex] = new Array();
                    }
                    target = param[this.arrayIndex];
                }
                if (this.responseType === 'blob') {
                    var image = new Image();
                    image.onload = function() {
                        window.URL.revokeObjectURL(image.src);
                        if (++count === allItemCount) {
                            cb(param);
                        }
                    };
                    image.src = window.URL.createObjectURL(this.response);
                    target[this.fileIndex] = image;
                } else {
                    target[this.fileIndex] = this.response;
                    if (++count === allItemCount) {
                        cb(param);
                    }
                }
            } else {
                ecb(e.currentTarget.responseURL);
            }
        };
    }
    function createRequest(arrayIndex, fileIndex, url, onload) {
        var request = new XMLHttpRequest();
        request.arrayIndex = arrayIndex;
        request.fileIndex = fileIndex;
        request.url = url;
        request.open('GET', url, true);
        switch (url.split('.').pop().toLowerCase()) {
            case 'jpg':
            case 'png':
            case 'gif':
                request.responseType = 'blob';
                break;
            default:
                request.responseType = 'text';
                break;
        }
        request.onload = onload;
        request.send(null);
    }
    return new Promise(function(resolve, reject){
        var responses = new Array(urls.length);
        var allItemCount = 0;
        var i, j;
        for (i = 0; i < urls.length; ++i) {
            if (typeof urls[i] === 'string') {
                ++allItemCount;
            } else if (typeof urls[i] === 'object') {
                allItemCount += urls[i].length;
            }
        }
        var collector = new XHRCollector(allItemCount, resolve, reject, responses);
        var fileIndex = 0;
        for (i = 0; i < urls.length; ++i) {
            if (typeof urls[i] === 'string') {
                createRequest(-1, fileIndex++, urls[i], collector);
            } else if (typeof urls[i] === 'object') {
                for (j = 0; j < urls[i].length; ++j) {
                    createRequest(fileIndex, j, urls[i][j], collector);
                }
                fileIndex++;
            } else {
                console.log('unsupport type.');
            }
        }
    });
};
/** 
 * シェーダーファイルをコンパイルする
 * @param {number} type 0:バーテックスシェーダー, 1:フラグメントシェーダー
 * @param {string} text コンパイルするシェーダー
 * @return {object} シェーダーオブジェクト
 */
SimpleGL.prototype.compileShader = function(type, text) {
    var shader = null;
    switch(type) {
        case 0: // 'x-shader/x-vertex'
            shader = this.gl.createShader(this.gl.VERTEX_SHADER);
            break;
        case 1: // 'x-shader/x-fragment'
            shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            break;
        default:
            return null;
    }
    this.gl.shaderSource(shader, text);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.log('compile error.');
        return null;
    }
    return shader;
};
/** 
 * コンパイル済みシェーダーオブジェクトをリンクする
 * @param {object} vs バーテックスシェーダーオブジェクト
 * @param {object} fs フラグメントシェーダーオブジェクト
 * @return {object} プログラムオブジェクト
 */
SimpleGL.prototype.linkProgram = function(vs, fs) {
    var program = this.gl.createProgram();

    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);

    if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.log('link error:' + this.gl.getProgramInfoLog(program));
        return null;
    }
    return program;
};
/** 
 * 頂点バッファオブジェクトを作成する
 * @param {Array.<number>} data 頂点バッファ配列
 * @return {object} 頂点バッファオブジェクト
 */
SimpleGL.prototype.createVBO = function(data) {
    var vbo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    return vbo;
};
/** 
 * インデックスバッファオブジェクトを作成する
 * @param {Array.<number>} data インデックスバッファ配列
 * @return {object} インデックスバッファオブジェクト
 */
SimpleGL.prototype.createIBO = function(data) {
    var ibo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
};
/** 
 * テクスチャオブジェクトを作成する
 * @param {object} data Image データ
 * @return {object} テクスチャオブジェクト
 */
SimpleGL.prototype.createTexture = function(data) {
    var texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return texture;
};
/** 
 * WebGL オブジェクトを取得する
 * @return {object} WebGL オブジェクト
 */
SimpleGL.prototype.getGL = function() {
    return this.gl;
};
/** 
 * キャンバス幅を取得する
 * @return {number} キャンバス幅
 */
SimpleGL.prototype.getWidth = function() {
    return this.canvas.width;
};
/** 
 * キャンバス高さを取得する
 * @return {number} キャンバス高さ
 */
SimpleGL.prototype.getHeight = function() {
    return this.canvas.height;
};
