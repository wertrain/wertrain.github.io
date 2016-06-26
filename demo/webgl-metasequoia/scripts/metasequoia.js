(function () {
    var MQOPerser = {};

    MQOPerser.parseSceneParam = function(scene) {
        var posMatch = scene.match(/pos ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+)/);
        var posArray = new Array(3);
        posArray[0] = parseFloat(posMatch[1]);
        posArray[1] = parseFloat(posMatch[2]);
        posArray[2] = parseFloat(posMatch[3]);
        var lookatMatch = scene.match(/lookat ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+)/);
        var lookatArray = new Array(3);
        lookatArray[0] = parseFloat(lookatMatch[1]);
        lookatArray[1] = parseFloat(lookatMatch[2]);
        lookatArray[2] = parseFloat(lookatMatch[3]);
        var headMatch = scene.match(/head ([+-]?\d*[\.]?\d+)/);
        var headValue = parseFloat(headMatch[1]);
        var pichMatch = scene.match(/pich ([+-]?\d*[\.]?\d+)/);
        var pichValue = parseFloat(pichMatch[1]);
        var orthoMatch = scene.match(/ortho ([-]?\d+)/);
        var orthoValue = parseInt(orthoMatch[1]);
        var zoomMatch = scene.match(/zoom2 ([+-]?\d*[\.]?\d+)/);
        var zoomValue = parseFloat(zoomMatch[1]);
        var ambMatch = scene.match(/amb ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+)/);
        var ambArray = new Array(3);
        ambArray[0] = parseFloat(ambMatch[1]);
        ambArray[1] = parseFloat(ambMatch[2]);
        ambArray[2] = parseFloat(ambMatch[3]);
        return { 
            'pos': posArray, 'lookat': lookatArray, 'head': headValue, 
            'pich': pichValue, 'ortho': orthoValue, 'zoom2': zoomValue, 'amb': ambArray
        };
    };
    MQOPerser.parseMaterialParam = function(materialLine) {
        var nameMatch = materialLine.match(/"(.+)"/);
        var materialName = nameMatch[1];
        
        var shaderMatch = materialLine.match(/shader\((\d)\)/);
        var shaderNum = shaderMatch === null ? null : parseInt(shaderMatch[1]);
        
        var colMatch = materialLine.match(/col\((\d+\.\d+) (\d+\.\d+) (\d+\.\d+) (\d+\.\d+)\)/);
        var colArray = null;
        if (colMatch !== null) {
            colArray = new Array(4);
            colArray[0] = parseFloat(colMatch[1]);
            colArray[1] = parseFloat(colMatch[2]);
            colArray[2] = parseFloat(colMatch[3]);
            colArray[3] = parseFloat(colMatch[4]);
        }
        
        var difMatch = materialLine.match(/dif\((\d+\.\d+)\)/);
        var difValue = difMatch === null ? null : parseFloat(difMatch[1]);
        
        var ambMatch = materialLine.match(/amb\((\d+\.\d+)\)/);
        var ambValue = ambMatch === null ? null : parseFloat(ambMatch[1]);
        
        var emiMatch = materialLine.match(/emi\((\d+\.\d+)\)/);
        var emiValue = emiMatch === null ? null : parseFloat(emiMatch[1]);
        
        var spcMatch = materialLine.match(/spc\((\d+\.\d+)\)/);
        var spcValue = spcMatch === null ? null : parseFloat(spcMatch[1]);
        
        var reflectMatch = materialLine.match(/reflect\((\d+\.\d+)\)/);
        var reflectValue = reflectMatch === null ? null : parseFloat(reflectMatch[1]);
        
        var powerMatch = materialLine.match(/power\((\d+\.\d+)\)/);
        var powerValue = powerMatch === null ? null : parseFloat(powerMatch[1]);
        
        var texMatch = materialLine.match(/tex\("(.+)"\)/);
        var texValue = (texMatch === null ? null : texMatch[1]);
        
        var aplaneMatch = materialLine.match(/aplane\("(.+)"\)/);
        var aplaneValue = (aplaneMatch === null ? null : aplaneMatch[1]);
        
        var bumpMatch = materialLine.match(/bump\("(.+)"\)/);
        var bumpValue = (bumpMatch === null ? null : bumpMatch[1]);
        
        return { 
            'name': materialName, 'shader': shaderNum, 'col': colArray, 
            'dif': difValue, 'amb': ambValue, 'emi': emiValue,
            'spc': spcValue, 'power': powerValue, 'reflect': reflectValue,
            'tex': texValue, 'texObject': null,
            'aplane': aplaneValue, 'aplaneTexObject': null,
            'bump': bumpValue, 'bumpTexObject': null
        };
    };
    MQOPerser.parseObjectParam = function(object) {
        var nameMatch = object.match(/"(.+)"/);
        var objectName = nameMatch[1];
        
        var visibleMatch = object.match(/visible (\d+)/);
        var visibleValue = visibleMatch === null ? null : parseInt(visibleMatch[1]);
        
        var lockingMatch = object.match(/locking (\d+)/);
        var lockingValue = lockingMatch === null ? null : parseInt(lockingMatch[1]);
        
        var shadingMatch = object.match(/shading (\d+)/);
        var shadingValue = shadingMatch === null ? null : parseInt(shadingMatch[1]);
        
        var facetMatch = object.match(/facet (\d+\.\d+)/);
        var facetValue = facetMatch === null ? null : parseFloat(facetMatch[1]);
        
        var colorMatch = object.match(/color ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+)/);
        var colorArray = null;
        if (colorMatch !== null) {
            colorArray = new Array(3);
            colorArray[0] = parseFloat(colorMatch[1]);
            colorArray[1] = parseFloat(colorMatch[2]);
            colorArray[2] = parseFloat(colorMatch[3]);
        }
        
        var colorTypeMatch = object.match(/color_type ([-]?\d+)/);
        var colorTypeValue = colorTypeMatch === null ? null : parseInt(colorTypeMatch[1]);
        
        var mirrorMatch = object.match(/mirror (\d+)/);
        var mirrorValue = mirrorMatch === null ? null : parseInt(mirrorMatch[1]);
        
        var mirrorAxisMatch = object.match(/mirror_axis (\d+)/);
        var mirrorAxisValue = mirrorAxisMatch === null ? null : parseInt(mirrorAxisMatch[1]);
        
        var depthMatch = object.match(/depth ([-]?\d+)/);
        var depthValue = depthMatch === null ? null : parseInt(depthMatch[1]);
        
        var foldingMatch = object.match(/folding (\d+)/);
        var foldingValue = foldingMatch === null ? null : parseInt(foldingMatch[1]);
        
        var scaleMatch = object.match(/scale ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+)/);
        var scaleArray = null;
        if (scaleMatch !== null) {
            scaleArray = new Array(3);
            scaleArray[0] = parseFloat(scaleMatch[1]);
            scaleArray[1] = parseFloat(scaleMatch[2]);
            scaleArray[2] = parseFloat(scaleMatch[3]);
        }
        
        var rotationMatch = object.match(/rotation ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+)/);
        var rotationArray = null;
        if (rotationMatch !== null) {
            rotationArray = new Array(3);
            rotationArray[0] = parseFloat(rotationMatch[1]);
            rotationArray[1] = parseFloat(rotationMatch[2]);
            rotationArray[2] = parseFloat(rotationMatch[3]);
        }

        var translationMatch = object.match(/translation ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+)/);
        var translationArray = null;
        if (translationMatch !== null) {
            translationArray = new Array(3);
            translationArray[0] = parseFloat(translationMatch[1]);
            translationArray[1] = parseFloat(translationMatch[2]);
            translationArray[2] = parseFloat(translationMatch[3]);
        }
        
        var vertexMatch = object.match(/vertex (\d+) \{[\s\S]+?\}/);
        var vertexArray = null;
        if (vertexMatch !== null) {
            var vertexNum = parseInt(vertexMatch[1]);
            var vertexParams = vertexMatch[0].match(/([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+)[\n\r]/g);
            vertexArray = new Array(vertexParams.length);
            for (let i = 0; i < vertexParams.length; ++i) {
                let vertexParamMatch = vertexParams[i].match(/([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+) ([+-]?\d*[\.]?\d+)/);
                let vertex = new Array(3);
                vertex[0] = vertexParamMatch[1];
                vertex[1] = vertexParamMatch[2];
                vertex[2] = vertexParamMatch[3];
                vertexArray[i] = vertex;
            }
        }
        
        var faceMatch = object.match(/face (\d+) \{[\s\S]+?\}/);
        var faceNum = parseInt(faceMatch[1]);
        
        var faceParams = faceMatch[0].match(/\d+ V\(\d+(?: \d+)*\).+[\n\r]?/g);
        var faceArray = new Array(faceParams.length);
        for (let i = 0; i < faceParams.length; ++i) {
            // 頂点数
            let faceValueMatch = faceParams[i].match(/^\d+/);
            let faceValue = parseInt(faceValueMatch[0]);
            // 頂点のインデックス
            let vReg = /V\((.+?)\)/;
            let faceVMatch = faceParams[i].match(vReg);
            let vArray = faceVMatch[1].split(' ');
            for (let j = 0; j < vArray.length; ++j) {
                vArray[j] = parseInt(vArray[j]);
            }
            // マテリアルのインデックス
            let faceMMatch = faceParams[i].match(/M\(([-]?\d+)\)/);
            let mValue = faceMMatch === null ? null : parseInt(faceMMatch[1]);
            // テクスチャUV
            let uvReg = /UV\((.+?)\)/;
            let faceUVMatch = faceParams[i].match(uvReg);
            let uvArray = null;
            if (faceUVMatch !== null) {
                uvArray = faceUVMatch[1].split(' ');
                for (let j = 0; j < uvArray.length; ++j) {
                    uvArray[j] = parseFloat(uvArray[j]);
                }
            }
            // 頂点カラー
            let colReg = /COL\((.+?)\)/;
            let colArray = null;
            let faceCOLMatch = faceParams[i].match(colReg);
            if (faceCOLMatch !== null) {
                colArray = faceCOLMatch[1].split(' ');
                for (let j = 0; j < colArray.length; ++j) {
                    colArray[j] = parseFloat(colArray[j]);
                }
            }
            faceArray[i] = {'value': faceValue, 'V': vArray, 'M': mValue, 'UV': uvArray, 'COL': colArray};
        }
        return {
            'name': objectName, 'visible': visibleValue, 'locking': lockingValue,
            'depth': depthValue, 'folding': foldingValue,
            'scale': scaleArray, 'rotation': rotationArray, 'translation': translationArray,
            'shading': shadingValue, 'facet': facetValue, 'color': colorArray,
            'color_type': colorTypeValue, 'mirror': mirrorValue, 'mirror_axis': mirrorAxisValue,
            'vertex': vertexArray, 'face': faceArray
        };
    };
    var Metasequoia = function() {
        this.materials = [];
        this.scene = null;
        this.objects = [];
        this.groups = [];
    };
    Metasequoia.prototype.create = function(url) {
        return new Promise((resolve, reject) => {
            var directory = url.substring(0, url.lastIndexOf('/'));
            this._loadMQO(url).then(mqo => {
                if (!this._parseMQO(mqo)) {
                    console.log('error: invalid model.');
                    return Promise.reject(url);
                }
                var urls = [];
                for (let i = 0; i < this.materials.length; ++i) {
                    if (this.materials[i].tex !== null) {
                        let url = (directory + '/' + this.materials[i].tex);
                        this.materials[i].tex = url;
                        urls.push(url);
                    }
                }
                return this._loadTextures(urls);
            })
            .then(images => {
                let index = 0;
                for (let i = 0; i < this.materials.length; ++i) {
                    if (this.materials[i].tex !== null) {
                        this.materials[i].texObject = images[index++];
                    }
                }
                this._createGroups();
                resolve();
            })
            .catch(e => {
                console.log('load error:' + e);
                reject();
            });
        });
    };
    Metasequoia.prototype._loadMQO = function(url) {
        return new Promise(function(resolve, reject){
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'text';
            request.onload = function(e) {
                if (this.status == 200) {
                    resolve(this.response);
                } else {
                    reject(url);
                }
            };
            request.onerror = function(e) {
                reject(url);
            };
            request.send(null);
        });
    };
    Metasequoia.prototype._loadTextures = function(urls) {
        return new Promise(function(resolve, reject){
            var images = new Array(urls.length);
            if (urls.length === 0) {
                resolve(images);
                return;
            }
            var collector = new XHRCollector(urls.length, resolve, reject, images);
            for (var i = 0; i < urls.length; ++i) {
                var request = new XMLHttpRequest();
                request.index = i;
                request.url = urls[i];
                request.open('GET', urls[i], true);
                request.responseType = 'blob';
                request.onload = collector;
                (function(url) {
                    request.onerror = function(e) {
                        reject(url);
                    };
                })(urls[i]);
                request.send(null);
            }
        });
        function XHRCollector(allCount, resolve, reject, images) {
            var count = 0;
            return function(e) {
                if (this.status == 200) {
                    var image = new Image();
                    image.onload = function(ee) {
                        window.URL.revokeObjectURL(image.src);
                        if (++count === allCount) {
                            resolve(images);
                        }
                    };
                    image.src = window.URL.createObjectURL(this.response);
                    images[this.index] = image;
                } else {
                    reject(this.url);
                }
            };
        }
    };
    Metasequoia.prototype._parseMQO = function(mqo) {
        var sceneMatch = mqo.match(/Scene \{[\s\S]+?\}/);
        if (sceneMatch === null) {
            console.log('Scene: not found.');
            return false;
        }
        var scene = sceneMatch[0];
        this.scene = MQOPerser.parseSceneParam(scene);
        
        var materialMatch = mqo.match(/Material (\d+) \{[\s\S]+?\}/);
        if (materialMatch === null) {
            console.log('Material: not found.');
            return false;
        }
        var material = materialMatch[0];
        var materialNum = parseInt(materialMatch[1]);
        
        var materialParams = material.match(/\t".+" .+[\n\r]?/g);
        if (materialParams.length !== materialNum) {
            console.log('Material: invalid data.' + materialParams.length);
            return false;
        }
        this.materials = new Array(materialNum);
        for (let i = 0; i < materialNum; ++i) {
            this.materials[i] = MQOPerser.parseMaterialParam(materialParams[i]);
        }
        var objectsMatch = mqo.match(/Object "(.+)" \{[\s\S]+?[\n\r]\}/g);
        if (objectsMatch === null) {
            console.log('Object: not found.');
            return false;
        }
        this.objects = new Array(objectsMatch.length);
        for (let i = 0; i < this.objects.length; ++i) {
            this.objects[i] = MQOPerser.parseObjectParam(objectsMatch[i]);
        }
        return true;
    };
    Metasequoia.prototype._createGroups = function(mqo) {
        // パースしたデータから、表示用にデータを展開する
        for(let i = 0; i < this.objects.length; ++i) {
            // 法線リストの作成
            var normalList = [];
            for (let j = 0; j < this.objects[i].face.length; ++j) {
                var vertexArray = [];
                for (let k = 0; k < this.objects[i].face[j].V.length; ++k) {
                    vertexArray.push(
                        this.objects[i].vertex[
                            this.objects[i].face[j].V[k]
                        ]
                    );
                }
                var normal = [];
                if (vertexArray.length === 3) {
                    normal = this._getFaceNormal(vertexArray[0], vertexArray[1], vertexArray[2]);
                } else if (vertexArray.length === 4) {
                    normal = this._getFaceNormal(vertexArray[0], vertexArray[1], vertexArray[3]);
                }
                // 面法線リストに書き込み
                for (let k = 0; k < this.objects[i].face[j].V.length; ++k) {
                    if (typeof normalList[this.objects[i].face[j].V[k]] === 'undefined') {
                        normalList[this.objects[i].face[j].V[k]] = normal;
                    } else {
                        normalList[this.objects[i].face[j].V[k]][0] += normal[0];
                        normalList[this.objects[i].face[j].V[k]][1] += normal[1];
                        normalList[this.objects[i].face[j].V[k]][2] += normal[2];
                    }
                }
            }
            // 面法線リストの法線を正規化し、頂点ごとの法線のリストとする
            for (let j = 0; j < normalList.length; ++j) {
                normalList[j] = this._getNormalizedVector(normalList[j]);
            }
            
            // 頂点情報などの作成
            for (let j = 0; j < this.objects[i].face.length; ++j) {
                var vertexArray = [];
                var normalArray = [];
                for (let k = 0; k < this.objects[i].face[j].V.length; ++k) {
                    vertexArray.push(
                        this.objects[i].vertex[
                            this.objects[i].face[j].V[k]
                        ]
                    );
                    normalArray.push(
                        normalList[
                            this.objects[i].face[j].V[k]
                        ]
                    );
                }
                var uvArray = [];
                if (this.objects[i].face[j].UV !== null) {
                    for (let k = 0; k < this.objects[i].face[j].UV.length; ++k) {
                        uvArray.push(this.objects[i].face[j].UV[k]);
                    }
                }
                var colArray = null;
                if (this.objects[i].face[j].COL !== null) {
                    colArray = [];
                    for (let k = 0; k < this.objects[i].face[j].COL.length; ++k) {
                        let color = this.objects[i].face[j].COL[k];
                        let r = (color & 0x000000FF) >>   0;
                        let g = (color & 0x0000FF00) >>   8;
                        let b = (color & 0x00FF0000) >>  16;
                        let a = (color & 0xFF000000) >>> 24; // 符号なし右シフト
                        colArray.push([r, g, b, a]);
                    }
                }
                var materialId = this.objects[i].face[j].M;
                this.groups.push({'name': this.objects[i].name, 'vertex': vertexArray, 'uv': uvArray, 'normal': normalArray, 'color':colArray, 'materialId': materialId});
            }
        }
    };
    Metasequoia.prototype.genaratePlainColorTexture = function(canvasId, color) {
        return true;
    };
    Metasequoia.prototype.getScene = function() {
        return this.scene;
    };
    Metasequoia.prototype.getMaterial = function(index) {
        return this.materials[index];
    };
    Metasequoia.prototype.getMaterialLength = function() {
        return this.materials.length;
    };
    Metasequoia.prototype.getGroup = function(index) {
        return this.groups[index];
    };
    Metasequoia.prototype.getGroupLength = function() {
        return this.groups.length;
    };
    Metasequoia.prototype.getVertexIndices = function() {
        return [0, 1, 3, 3, 2, 1];
    };
    Metasequoia.prototype._getFaceNormal = function(v0, v1, v2) {
        var normal = new Array(3);
        // 頂点を結ぶベクトルを算出
        var vec1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
        var vec2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
        // ベクトル同士の外積
        normal[0] = vec1[1] * vec2[2] - vec1[2] * vec2[1];
        normal[1] = vec1[2] * vec2[0] - vec1[0] * vec2[2];
        normal[2] = vec1[0] * vec2[1] - vec1[1] * vec2[0];
        return this._getNormalizedVector(normal);
    };
    Metasequoia.prototype._getNormalizedVector = function(v) {
        var normalized = [];
        var veclen = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        var m = (veclen === 0 ? 1.0 : 1.0 / veclen);
        normalized[0] = v[0] * m;
        normalized[1] = v[1] * m;
        normalized[2] = v[2] * m;
        return normalized;
    };
    webglmetasequoia.Metasequoia = Metasequoia;
}());
