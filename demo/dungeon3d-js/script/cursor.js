'use strict';

{
    /** @const */
    const outer = typeof (dungeon3d) === 'undefined' ? exports : dungeon3d;
    /** 
     * カーソルクラス
     * @constructor 
     */
    let Cursor = function() {
        this.x = 0; // 2D マップ上のX位置
        this.y = 0; // 2D マップ上のY位置
        this.position = []; // 3D 上の位置
        this.visible = false;
    };
    /** 
     * カーソルを設置する
     * @param {x} x 設置位置X
     * @param {y} y 設置位置Y
     * @return {boolean} 現在は常に true
     */
    Cursor.prototype.put = function(x, y) {
        this.x = x;
        this.y = y;
        this.position = [this.x + 0.5, 0.01, this.y + 0.5];
        this.visible = true;
        return true;
    };
    /** 
     * カーソルを非表示にする
     */
    Cursor.prototype.hide = function() {
        this.visible = false;
    };
    /** 
     * カーソルを位置を取得する
     * @return {object} カーソル位置 {x, y}
     */
    Cursor.prototype.getPos = function() {
        return {
            x: this.x,
            y: this.y
        };
    };
    /** 
     * カーソルの表示状態を取得する
     * @return {boolean} カーソルが表示されていれば true
     */
    Cursor.prototype.isVisible = function() {
        return this.visible;
    };
    /** 
     * カーソル描画クラス
     * @constructor 
     */
    let CursorRenderer = function() {
        this.cursor = null;
        this.program = null;
        this.renderObject = {};
        this.texture = null;
        this.uniLocationArray = [];
        this.attLocationArray = [];
        this.attStrideArray = [];
    };
    /** 
     * カーソル描画を初期化する
     * @param {Cursor} cursor カーソル
     * @param {SimpleGL} sgl WebGL ユーティリティ
     * @param {Array.<*>} resouces リソースデータ配列（getNeedResoucesで要求したデータ）
     */
    CursorRenderer.prototype.initalize = function(cursor, sgl, resouces) {
        let gl = sgl.getGL();
        let vs = sgl.compileShader(0, resouces[0]);
        let fs = sgl.compileShader(1, resouces[1]);
        this.texture = sgl.createTexture(resouces[2]);
        this.program = sgl.linkProgram(vs, fs);
        gl.useProgram(this.program);
        
        this.cursor = cursor;
        let vbo = sgl.createVBO([-0.5, 0.0, -0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5]);
        let tbo = sgl.createVBO([0, 0, 1, 0, 1, 1, 0, 1]);
        let vertexIndices = [0, 1, 3, 3, 2, 1];
        let ibo = sgl.createIBO(vertexIndices);
        this.renderObject.vbo = vbo;
        this.renderObject.tbo = tbo;
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
     * カーソルを描画する
     * @param {webgl} gl webgl オブジェクト
     * @param {Array.<number>|Matrix44} view ビュー行列
     * @param {Array.<number>|Matrix44} projection プロジェクション行列
     */
    CursorRenderer.prototype.render = function(gl, view, projection) {
        if (!this.cursor.visible) {
            return;
        }
        gl.useProgram(this.program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        let mMatrix = Matrix44.createIdentity();
        let mTrans = Matrix44.createIdentity();
        Matrix44.translate(mTrans, this.cursor.position, mTrans);
        Matrix44.multiply(mTrans, mMatrix, mMatrix);
        let mvpMatrix = Matrix44.createIdentity();
        Matrix44.multiply(projection, view, mvpMatrix);
        Matrix44.multiply(mvpMatrix, mMatrix, mvpMatrix);
        gl.uniformMatrix4fv(this.uniLocationArray['mvpMatrix'], false, mvpMatrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.renderObject.tbo);
        gl.enableVertexAttribArray(this.attLocationArray['textureCoord']);
        gl.vertexAttribPointer(this.attLocationArray['textureCoord'], this.attStrideArray['textureCoord'], gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.renderObject.vbo);
        gl.enableVertexAttribArray(this.attLocationArray['position']);
        gl.vertexAttribPointer(this.attLocationArray['position'], this.attStrideArray['position'], gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.renderObject.ibo);
        gl.drawElements(gl.TRIANGLES, this.renderObject.indicesLength, gl.UNSIGNED_SHORT, 0);

        gl.disable(gl.BLEND);
    };
    /** 
     * 描画に必要なリソース配列を取得する
     * @return {Array.<string>} リソースまでのパスの配列
     */
    CursorRenderer.getNeedResouces = function() {
        return ['shader/vertex.vs', 'shader/fragment.fs', 'image/cursor.png'];
    };

    outer.CursorRenderer = CursorRenderer;
    outer.Cursor = Cursor;
}
