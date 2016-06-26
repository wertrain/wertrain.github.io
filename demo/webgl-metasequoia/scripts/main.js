var main = function() {
    var sgl = new webglmetasequoia.SimpleGL();
    sgl.initalize('canvas', 640, 480);
    
    var mqo = new webglmetasequoia.Metasequoia();
    mqo.create('models/soldier/soldier.mqo').then(() => {
        return sgl.loadFiles([
            'shaders/vertex.vs',
            'shaders/fragment.fs'
        ]);
    })
    .then(responses => {
        var gl = sgl.getGL();
        var vs = sgl.compileShader(0, responses[0]);
        var fs = sgl.compileShader(1, responses[1]);
        var program = sgl.linkProgram(vs, fs);
        
        gl.useProgram(program);
        
        var uniLocation = new Array(8);
        uniLocation[0] = gl.getUniformLocation(program, 'mvpMatrix');
        uniLocation[1] = gl.getUniformLocation(program, 'color');
        uniLocation[2] = gl.getUniformLocation(program, 'texture');
        uniLocation[3] = gl.getUniformLocation(program, 'hasTexture');
        uniLocation[4] = gl.getUniformLocation(program, 'invMatrix');
        uniLocation[5] = gl.getUniformLocation(program, 'lightDirection');
        uniLocation[6] = gl.getUniformLocation(program, 'ambientColor');
        uniLocation[7] = gl.getUniformLocation(program, 'eyeDirection');
          
        var attLocation = new Array(3);
        attLocation[0] = gl.getAttribLocation(program, 'position');
        attLocation[1] = gl.getAttribLocation(program, 'color');
        attLocation[2] = gl.getAttribLocation(program, 'textureCoord');
        attLocation[3] = gl.getAttribLocation(program, 'normal');
        attLocation[4] = gl.getAttribLocation(program, 'materialColor');
        var attStride = new Array(5);
        attStride[0] = 3;
        attStride[1] = 4;
        attStride[2] = 2;
        attStride[3] = 3;
        attStride[4] = 4;
        
        var materials = [];
        for (let i = 0; i < mqo.getMaterialLength(); ++i) {
            let material = mqo.getMaterial(i);
            let texture = material.texObject === null ? null : sgl.createTexture(material.texObject);
            let color = material.col;
            materials.push({'texture': texture, 'color': color});
        }
        var objects = [];
        for (let i = 0; i < mqo.getGroupLength(); ++i) {
            let group = mqo.getGroup(i);
            let vertex = [];
            for (let j = 0; j < group.vertex.length; ++j) {
                Array.prototype.push.apply(vertex, group.vertex[j]);
            }
            let normal = [];
            for (let j = 0; j < group.normal.length; ++j) {
                Array.prototype.push.apply(normal, group.normal[j]);
            }
            let vertexColor = [];
            for (let j = 0; j < group.vertex.length; ++j) {
                Array.prototype.push.apply(vertexColor, 
                    (group.color === null ? [1.0, 1.0, 1.0, 0.0] : group.color[j]));
            }
            let materialColor = [];
            for (let j = 0; j < group.vertex.length; ++j) {
                Array.prototype.push.apply(materialColor,
                    (group.materialId === -1 ? [1.0, 1.0, 1.0, 0.0] : materials[group.materialId].color));
            }
            let textureUV = group.uv;
            
            let pvbo = sgl.createVBO(vertex);
            let tvbo = sgl.createVBO(textureUV);
            let cvbo = sgl.createVBO(vertexColor);
            let mvbo = sgl.createVBO(materialColor);
            let texture = (group.materialId === -1 ? null : materials[group.materialId].texture);
            let nvbo = sgl.createVBO(normal);
            objects.push({'v': pvbo, 'length': group.vertex.length, 'uv': tvbo, 'texture': texture, 'c': cvbo, 'mc': mvbo, 'n': nvbo});
        }
        var ibo = sgl.createIBO(mqo.getVertexIndices());
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        
        var minMatrix = new matIV();
        var mtxView = minMatrix.identity(minMatrix.create());
        var mtxProj = minMatrix.identity(minMatrix.create());
        var mtxMVP = minMatrix.identity(minMatrix.create());
        var mtxTmp = minMatrix.identity(minMatrix.create());
        var mtxModel = minMatrix.identity(minMatrix.create());
        var mtxInv = minMatrix.identity(minMatrix.create());
        
        //var vecLook = mqo.getScene().pos;
        //minMatrix.lookAt(vecLook, mqo.getScene().lookat, [0, 1, 0], mtxView);
        var vecLook = [0.0, 130.0, 450.0]
        minMatrix.lookAt(vecLook, [0, 130, 0], [0, 1, 0], mtxView);
        minMatrix.perspective(45, sgl.getWidth() / sgl.getHeight(), 0.1, 10000, mtxProj);
        minMatrix.multiply(mtxProj, mtxView, mtxTmp);

        var ambient = mqo.getScene().amb;
        var lightDirection = [0, 100, -140];
        var ambientColor = [ambient[0], ambient[1], ambient[2], 1.0];
        var eyeDirection = vecLook;
        
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        //gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CW);
        gl.cullFace(gl.FRONT);
        
        var count = 0;
        (function() {
            var rad = (count++ % 360) * Math.PI / 180;
            
            gl.clearColor(0.0, 0.0, 255.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
            minMatrix.identity(mtxModel);
            var mtxTrans = minMatrix.identity(minMatrix.create());
            var mtxRot = minMatrix.identity(minMatrix.create());
            minMatrix.identity(mtxTrans);
            minMatrix.identity(mtxRot);
            
            minMatrix.translate(mtxTrans, [0, 0, 0], mtxTrans);
            minMatrix.rotate(mtxRot, rad, [0, 1, 0], mtxRot);
            minMatrix.multiply(mtxTrans, mtxRot, mtxModel);
            minMatrix.multiply(mtxTmp, mtxModel, mtxMVP);
            minMatrix.inverse(mtxModel, mtxInv);
            
            gl.uniformMatrix4fv(uniLocation[0], false, mtxMVP);
            gl.uniformMatrix4fv(uniLocation[4], false, mtxInv);
            gl.uniform3fv(uniLocation[5], lightDirection);
            gl.uniform4fv(uniLocation[6], ambientColor);
            gl.uniform3fv(uniLocation[7], eyeDirection);

            for (let i = 0; i < objects.length; ++i) {
                gl.bindBuffer(gl.ARRAY_BUFFER, objects[i].c);
                gl.enableVertexAttribArray(attLocation[1]);
                gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, false, 0, 0);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, objects[i].n);
                gl.enableVertexAttribArray(attLocation[3]);
                gl.vertexAttribPointer(attLocation[3], attStride[3], gl.FLOAT, false, 0, 0);
                
                gl.bindBuffer(gl.ARRAY_BUFFER, objects[i].mc);
                gl.enableVertexAttribArray(attLocation[4]);
                gl.vertexAttribPointer(attLocation[4], attStride[4], gl.FLOAT, false, 0, 0);
                
                if (objects[i].texture !== null) {
                    gl.uniform1i(uniLocation[2], 0);
                    gl.uniform1i(uniLocation[3], true);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, objects[i].texture);
                    gl.bindBuffer(gl.ARRAY_BUFFER, objects[i].uv);
                    gl.enableVertexAttribArray(attLocation[2]);
                    gl.vertexAttribPointer(attLocation[2], attStride[2], gl.FLOAT, false, 0, 0);
                } else {
                    gl.uniform1i(uniLocation[3], false);
                }
                if (objects[i].length === 3) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, objects[i].v);
                    gl.enableVertexAttribArray(attLocation[0]);
                    gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0);
                    gl.drawArrays(gl.TRIANGLES, 0, objects[i].length);
                } else if (objects[i].length === 4) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, objects[i].v);
                    gl.enableVertexAttribArray(attLocation[0]);
                    gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
                    gl.drawElements(gl.TRIANGLES, mqo.getVertexIndices().length, gl.UNSIGNED_SHORT, 0);
                }
            }
            gl.flush();
            setTimeout(arguments.callee, 1000 / 30);
        })();
    })
    .catch((e) => {
        console.log('error: ' + e);
    });
}();
