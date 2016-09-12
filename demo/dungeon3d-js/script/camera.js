'use strict';

{
    /** @const */
    const outer = typeof (dungeon3d) === 'undefined' ? exports : dungeon3d;
    /** カメラ */
    let Camera = function() {
        this.position = [];
        this.target = [];
        this.up = [];
        this.near = 0;
        this.far = 0;
    };
    Camera.prototype.getViewRotation = function() {
        let v = this.getViewDistance();
        let yaw = 0;
        if (v[0] >= 0.0) {
            yaw = -Math.atan(v[2] / v[0]) - Math.PI / 2;
        } else {
            yaw = -Math.atan(v[2] / v[0]) + Math.PI / 2;
        }
        let dist = Math.sqrt(v[2] * v[2] + v[0] * v[0]);
        let pitch = 0;
        if (v[1] >= 0.0) {
            pitch = -Math.atan(dist / v[1]) + Math.PI / 2;
        } else {
            pitch = -Math.atan(dist / v[1]) - Math.PI / 2;
        }
        return { yaw: yaw, pitch: pitch };
    };
    Camera.prototype.getViewDistance = function() {
        // this.position - this.target
        return [
            this.position[0] - this.target[0], 
            this.position[1] - this.target[1],
            this.position[2] - this.target[2]
        ];
    };
    Camera.prototype.setViewParams = function(rotX, rotY, dist, target) {
        let position = [0.0, 0.0, dist];
        let mRotX = Matrix44.createIdentity();
        let mRotY = Matrix44.createIdentity();
        Matrix44.rotate(mRotX, rotX, [1.0, 0.0, 0.0], mRotX);
        Matrix44.rotate(mRotY, rotY, [0.0, 1.0, 0.0], mRotY);
        let mRot = Matrix44.createIdentity();
        Matrix44.multiply(mRotY, mRotX, mRot);
        MathUtil.transformCoord(position, mRot, this.position);
        this.target = target;
        this.position[0] = this.position[0] + this.target[0];
        this.position[1] = this.position[1] + this.target[1];
        this.position[2] = this.position[2] + this.target[2];
        this.view = Matrix44.createIdentity();
        Matrix44.lookAt(this.position, this.target, this.up, this.view);
    };
    /** 透視投影カメラ */
    let PerspectiveCamera = function() {
        this.fovy = 0;
        this.aspect = 0;
        this.view = null;
        this.projection = null;
    };
    Object.setPrototypeOf(PerspectiveCamera.prototype, Camera.prototype);
    PerspectiveCamera.getConfig = function() {
        return {
            position: [0.0, 0.0, 0.0],
            target: [0, 0, 0],
            up: [0, 1, 0],
            near: 0.001,
            far: 1000,
            fovy: 45.0,
            aspect: 640 / 480
        };
    };
    PerspectiveCamera.prototype.initalize = function(config) {
        this.position = config.position;
        this.target = config.target;
        this.up = config.up;
        this.near = config.near;
        this.far = config.far;
        this.fovy = config.fovy;
        this.aspect = config.aspect;
    };
    PerspectiveCamera.prototype.update = function() {
        this.view = Matrix44.createIdentity();
        this.projection = Matrix44.createIdentity();
        Matrix44.lookAt(this.position, this.target, this.up, this.view);
        Matrix44.perspective(this.fovy, this.aspect, this.near, this.far, this.projection);
    };
    PerspectiveCamera.prototype.getViewMatrix = function() {
        return this.view;
    };
    PerspectiveCamera.prototype.getProjectionMatrix = function() {
        return this.projection;
    };

    outer.PerspectiveCamera = PerspectiveCamera;
}
