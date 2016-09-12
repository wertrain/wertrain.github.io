'use strict';

{
    /** @const */
    const outer = typeof (dungeon3d) === 'undefined' ? exports : dungeon3d;
    /** 
     * キャラクター
     * @constructor 
     */
    let CharaData = function() {
        outer.RouteMovableObject.call(this);
    };
    Object.setPrototypeOf(CharaData.prototype, outer.RouteMovableObject.prototype);
    /** 
     * キャラクター管理
     * @constructor 
     */
    let CharaManager = function() {
        this.map = null;
        this.charaArray = [];
    };
    /** 
     * 初期化
     * @param {dungeon3d.Map} map マップオブジェクト
     */
    CharaManager.prototype.initalize = function(map) {
        this.map = map;
        this.routefinder = new outer.RouteFinder();
        this.routefinder.setIsMoveFunction((x, y) => {
            return map.isFloor(x, y);
        });
    };
    /** 
     * 全キャラクターを更新する
     * @param {number} time 現在時間
     */
    CharaManager.prototype.update = function(time) {
        let result = false;
        for (let i = 0; i < this.charaArray.length; ++i) {
            if (this.charaArray[i].moveStep(this.map, time)) {
                result = true;
            }
        }
        return result;
    };
    /** 
     * キャラクターを移動する
     * @param {number} index キャラクター配列のインデックス番号
     * @param {number} x 移動位置X
     * @param {number} y 移動位置Y
     * @param {number} time 現在時間
     * @return {boolean} 移動開始できれば true
     */
    CharaManager.prototype.moveTo = function(index, x, y, time) {
        if (!this.map.isFloor(x, y)) {
            return false;
        }
        let chara = this.charaArray[index];
        if (chara === null) {
            return false; 
        }
        let pos = {x: x, y: y};
        return this.routefinder.moveTo(chara, time, pos);
    };
    /** 
     * 指定された位置にキャラクターを設置する
     * @param {number} x 設置位置X
     * @param {number} y 設置位置Y
     * @param {number} dir キャラクターの向き
     * @param {number} type キャラクターのタイプ
     * @return {boolean} （現在は） 常に true
     */
    CharaManager.prototype.putChara = function(x, y, dir, type) {
        let chara = new CharaData();
        chara.x = x;
        chara.y = y;
        chara.direction = dir;
        chara.type = type;
        chara.pose = 0;
        chara.position = [chara.x + 0.5, this.map.getY(x, y), chara.y + 0.5];
        this.charaArray.push(chara);
        return true;
    };
    /** 
     * キャラクターデータ配列を取得する
     * @return {Array.<CharaData>} キャラクターデータ配列
     */
    CharaManager.prototype.getCharaArray = function() {
        return this.charaArray;
    };
    /** 
     * 指定された index 番目のキャラクターを取得する
     * @param {number} index インデックス
     * @return {CharaData} キャラクターデータ
     */
    CharaManager.prototype.getChara = function(index) {
        return this.charaArray[index];
    };
    /** 
     * キャラクター描画
     * @constructor 
     */
    let CharaRenderer = function() {
        this.charaManager = null;
        this.program = null;
        this.renderObject = {};
        this.textureArray = [];
        this.uniLocationArray = [];
        this.attLocationArray = [];
        this.attStrideArray = [];
    };
    /** 
     * 初期化
     * @param {dungeon3d.CharaManager} charaManager キャラクター管理
     * @param {SimpleGL} sgl WebGL ユーティリティ
     * @param {Array.<*>} resouces リソースデータ配列（getNeedResoucesで要求したデータ）
     */
    CharaRenderer.prototype.initalize = function(charaManager, sgl, resouces) {
        let gl = sgl.getGL();
        let vs = sgl.compileShader(0, resouces[0]);
        let fs = sgl.compileShader(1, resouces[1]);
        let ptex = sgl.createTexture(resouces[2]);
        this.program = sgl.linkProgram(vs, fs);
        gl.useProgram(this.program);

        this.textureArray['player_move'] = ptex; 
        
        this.charaManager = charaManager;
        let charaV = [-0.2, 0.6, -0.0, -0.2, 0.0, 0.0, 0.2, 0.0, 0.0, 0.2, 0.6, -0.0];
        let charaArray = this.charaManager.getCharaArray();
        let vboArray = [];
        for (let i = 0; i < charaArray.length; ++i) {
            let vbo = sgl.createVBO(charaV);
            vboArray.push(vbo);
        }
        // 姿勢とポーズごとに作成
        const CHARA_DIR = 10, CHARA_POSE = 9;
        let tboArray = [];
        for (let i = 0; i < charaArray.length; ++i) {
            let uvArray = new Array(CHARA_DIR);
            for (let dir = 0; dir < CHARA_DIR; ++dir) {
                uvArray[dir] = new Array(CHARA_POSE);
                for (let pose = 0; pose < CHARA_POSE; ++pose) {
                    let u1 = (pose * 48.0) / 512.0;
                    let u2 = (pose * 48.0 + 48.0) / 512.0;
                    let v1 = (dir * 96.0) / 512.0;
                    let v2 = (dir * 96.0 + 96.0) / 512.0;
                    let vbo = sgl.createVBO([u1, v1, u1, v2, u2, v2, u2, v1]);
                    uvArray[dir][pose] = vbo;
                }
            }
            tboArray.push(uvArray);
        }
        this.renderObject.vboArray = vboArray;
        this.renderObject.tboArray = tboArray;
        this.renderObject.charaArray = charaArray;
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
     * 描画
     * @param {dungeon3d.CharaManager} charaManager キャラクター管理
     * @param {webgl} gl webgl オブジェクト
     * @param {dungeon3d.Camera} camera カメラオブジェクト
     */
    CharaRenderer.prototype.render = function(gl,camera) {
        let viewRot = camera.getViewRotation();
        let mRot = Matrix44.createIdentity();
        //Matrix44.rotate(mRot, Math.PI / 2, [1.0, 0.0, 0.0], mRot);
        Matrix44.rotate(mRot, viewRot.yaw, [0.0, 1.0, 0.0], mRot);
        Matrix44.rotate(mRot, viewRot.pitch, [1.0, 0.0, 0.0], mRot);
        let mScale = Matrix44.createIdentity();
        Matrix44.scale(mScale, [1.0, 1.0 / Math.cos(viewRot.pitch), 1.0], mScale);
        Matrix44.multiply(mScale, mRot, mRot);

        let dir = Math.floor(((Math.floor(viewRot.yaw * 8.0 / Math.PI) + 17) & 15) / 2);
        
        let v = camera.getViewDistance();
        let vx = 0.15 * v[0] / v[1];
        let vz = 0.15 * v[2] / v[1];
        let vy = 0;

        gl.useProgram(this.program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        let textureNameArray = ['player_move'];
        for (let i = 0; i < this.renderObject.charaArray.length; ++i) {
            let chara = this.renderObject.charaArray[i];
            let charDir = (chara.direction + dir) % 8;
            let charPose = chara.pose;
            let mMatrix = Matrix44.createIdentity();
            let mTrans = Matrix44.createIdentity();
            Matrix44.translate(mTrans, [
                vx + chara.position[0],
                vy + chara.position[1],
                vz + chara.position[2],
            ], mTrans);
            if (charDir > 4) {
                charDir = 8 - charDir;
            } else {
                mRot = Matrix44.createIdentity();
                Matrix44.rotate(mRot, viewRot.yaw + Math.PI, [0.0, 1.0, 0.0], mRot);
                Matrix44.rotate(mRot, -viewRot.pitch, [1.0, 0.0, 0.0], mRot);
                Matrix44.multiply(mScale, mRot, mRot);
            }
            Matrix44.multiply(mTrans, mRot, mMatrix);
            let mvpMatrix = Matrix44.createIdentity();
            Matrix44.multiply(camera.getProjectionMatrix(), camera.getViewMatrix(), mvpMatrix);
            Matrix44.multiply(mvpMatrix, mMatrix, mvpMatrix);
            gl.uniformMatrix4fv(this.uniLocationArray['mvpMatrix'], false, mvpMatrix);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.textureArray[textureNameArray[chara.type]]);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.renderObject.tboArray[i][charDir][charPose]);
            gl.enableVertexAttribArray(this.attLocationArray['textureCoord']);
            gl.vertexAttribPointer(this.attLocationArray['textureCoord'], this.attStrideArray['textureCoord'], gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.renderObject.vboArray[i]);
            gl.enableVertexAttribArray(this.attLocationArray['position']);
            gl.vertexAttribPointer(this.attLocationArray['position'], this.attStrideArray['position'], gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.renderObject.ibo);
            gl.drawElements(gl.TRIANGLES, this.renderObject.indicesLength, gl.UNSIGNED_SHORT, 0);
        }

        gl.disable(gl.BLEND);
    };
    /** 
     * 描画に必要なリソース配列を取得する
     * @return {Array.<string>} リソースまでのパスの配列
     */
    CharaRenderer.getNeedResouces = function() {
        return ['shader/vertex.vs', 'shader/fragment.fs', 'image/player_move.png'];
    };
    outer.CharaRenderer = CharaRenderer;
    outer.CharaManager = CharaManager;
}
