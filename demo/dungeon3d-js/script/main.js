'use strict';

{
    let sgl = new SimpleGL();
    sgl.initalize('canvas', 640, 480);
    let files = new Array();
    files[0] = dungeon3d.MapRenderer.getNeedResouces();
    files[1] = dungeon3d.CharaRenderer.getNeedResouces();
    files[2] = dungeon3d.CursorRenderer.getNeedResouces();
    sgl.loadFiles(files).then(responses => {
        let map = new dungeon3d.Map();
        let mapRenderer = new dungeon3d.MapRenderer();
        map.initalize();
        mapRenderer.initalize(map, sgl, responses[0]);

        let camera = new dungeon3d.PerspectiveCamera();
        let config = dungeon3d.PerspectiveCamera.getConfig();
        config.position = [0.0, 20.0, 0.0];
        config.target = [10, 0, 10];
        camera.initalize(config);

        let charaManager = new dungeon3d.CharaManager();
        charaManager.initalize(map);
        charaManager.putChara(10, 10, 0, 0);
        let charaRenderer = new dungeon3d.CharaRenderer();
        charaRenderer.initalize(charaManager, sgl, responses[1]);

        let cursor = new dungeon3d.Cursor();
        let cursorRenderer = new dungeon3d.CursorRenderer();
        cursorRenderer.initalize(cursor, sgl, responses[2]);

        let cameraRotX = Math.PI * 0.3;
        let cameraRotY = 0;
        let cameraZoom = 4.0;

        let gl = sgl.getGL();
        let viewport = gl.getParameter(gl.VIEWPORT);

        let date = new Date();

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);

        camera.update();
        let currentTime = 0;
        let charaMove = false;
        setInterval(() => {
            // update
            currentTime = Date.now();
            charaManager.update(currentTime);
            if (charaMove) {
                let cursorPos = cursor.getPos();
                charaManager.moveTo(0, cursorPos.x, cursorPos.y, currentTime);
            }
            // render
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            camera.setViewParams(cameraRotX, -cameraRotY, -cameraZoom, charaManager.getChara(0).position);
            mapRenderer.render(gl, camera.getViewMatrix(), camera.getProjectionMatrix());
            cursorRenderer.render(gl, camera.getViewMatrix(), camera.getProjectionMatrix());
            charaRenderer.render(gl, camera);
            gl.flush();
        }, 32);

        //-----------------------------------------------------------
        // マウスイベント
        $(window).on('mousewheel', event => {
            if (event.deltaY > 0) {
                cameraZoom += 0.25;
                if (cameraZoom > 6.0) {
                    cameraZoom = 6.0;
                }
            } else {
                cameraZoom -= 0.25;
                if (cameraZoom <= 2.5) {
                    cameraZoom = 2.5;
                }
            }
        });
        let cameraDrag = false;
        let dragStartX = 0, dragStartY = 0;
        $('canvas').on('mousedown', event => {
            switch (event.which) {
                case 1: // 左クリック
                    charaMove = true;
                    break;
                case 3: // 右クリック
                    cameraDrag = true;
                    dragStartX = event.clientX;
                    dragStartY = event.clientY;
                    break;
            }
        });
        $('canvas').on('mouseup', event => {
            switch (event.which) {
                case 1: // 左クリック
                    charaMove = false;
                    break;
                case 3: // 右クリック
                    cameraDrag = false;
                    break;
            }
        });
        $('canvas').on('mousemove', event => {
            if (cameraDrag) {
                cameraRotY -= (event.clientX - dragStartX) * (Math.PI  * 0.002);
                cameraRotX -= (event.clientY - dragStartY) * (Math.PI  * 0.0005);
                if (cameraRotX < 0.3) {
                    cameraRotX = 0.3;
                } else if (cameraRotX > 0.8) {
                    cameraRotX = 0.8;
                }
                dragStartX = event.clientX;
                dragStartY = event.clientY;
            } else {
                // カーソルの移動
                let view = camera.getViewMatrix();
                let proj = camera.getProjectionMatrix();

                let mouseX = event.clientX;
                let mouseY = viewport[3] - event.clientY;
                let vecNear = Vector3.create(mouseX, mouseY, 0.0);
                let vecFar = Vector3.create(mouseX, mouseY, 1.0);
                MathUtil.unproject(vecNear, view, proj, viewport, vecNear);
                MathUtil.unproject(vecFar, view, proj, viewport, vecFar);
                let rayDir = Vector3.create();
                Vector3.subtract(vecFar, vecNear, rayDir);
                Vector3.normalize(rayDir, rayDir);

                let hit = map.intersectFloor(vecNear, rayDir);
                if (hit) {
                    cursor.put(hit.x, hit.y);
                } else {
                    cursor.hide();
                }
            }
        });
        // カメラ操作で使用するので、キャンバス上では右クリックメニューを表示しないようにする
        $('canvas').on('contextmenu', event => {
            event; // unused-varsへの対処
            return false;
        });
    })
    .catch((e) => {
        console.log('error: ' + e);
    });
}
