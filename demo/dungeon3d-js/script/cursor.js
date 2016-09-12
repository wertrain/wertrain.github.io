'use strict';

{
    /** @const */
    const outer = typeof (dungeon3d) === 'undefined' ? exports : dungeon3d;
    /** カーソル */
    let Cursor = function() {
        this.x = 0; // 2D マップ上のX位置
        this.y = 0; // 2D マップ上のY位置
        this.position = []; // 3D 上の位置
        this.visible = false;
    };
    Cursor.prototype.put = function(x, y) {
        this.x = x;
        this.y = y;
        this.position = [this.x + 0.5, 0.01, this.y + 0.5];
        this.visible = true;
        return true;
    };
    Cursor.prototype.hide = function() {
        this.visible = false;
    };
    Cursor.prototype.getPos = function() {
        return {
            x: this.x,
            y: this.y
        };
    };
    Cursor.prototype.isVisible = function() {
        return this.visible;
    };
    /** カーソル描画 */
    let CursorRenderer = function() {
        this.cursor = null;
        this.program = null;
        this.renderObject = {};
        this.texture = null;
        this.uniLocationArray = [];
        this.attLocationArray = [];
        this.attStrideArray = [];
    };
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
    CursorRenderer.getNeedResouces = function() {
        return ['shader/vertex.vs', 'shader/fragment.fs', 'image/cursor.png'];
    };

    outer.CursorRenderer = CursorRenderer;
    outer.Cursor = Cursor;
}
