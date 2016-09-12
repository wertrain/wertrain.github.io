// ------------------------------------------------------------------------------------------------
// Vector3
// ------------------------------------------------------------------------------------------------
var Vector3 = function() {
};
Vector3.create = function(x, y, z) {
    let vec = new Float32Array(3);
    vec[0] = x || 0;
    vec[1] = y || 0;
    vec[2] = z || 0;
    return vec;
};
Vector3.negative = function(vec, dest) {
    dest[0] = -vec[0];
    dest[1] = -vec[1];
    dest[2] = -vec[2];
    return dest;
};
Vector3.add = function(v1, v2, dest) {
    if (typeof (v2) === 'object') {
        dest[0] = v1[0] + v2[0];
        dest[1] = v1[1] + v2[1];
        dest[2] = v1[2] + v2[2];
    } else {
        dest[0] = v1[0] + v2;
        dest[1] = v1[1] + v2;
        dest[2] = v1[2] + v2;
    }
    return dest;
};
Vector3.subtract = function(v1, v2, dest) {
    if (typeof (v2) === 'object') {
        dest[0] = v1[0] - v2[0];
        dest[1] = v1[1] - v2[1];
        dest[2] = v1[2] - v2[2];
    } else {
        dest[0] = v1[0] - v2;
        dest[1] = v1[1] - v2;
        dest[2] = v1[2] - v2;
    }
};
Vector3.multiply = function(v1, v2, dest) {
    if (typeof (v2) === 'object') {
        dest[0] = v1[0] * v2[0];
        dest[1] = v1[1] * v2[1];
        dest[2] = v1[2] * v2[2];
    } else {
        dest[0] = v1[0] * v2;
        dest[1] = v1[1] * v2;
        dest[2] = v1[2] * v2;
    }
    return dest;
};
Vector3.divide = function(v1, v2, dest) {
    if (typeof (v2) === 'object') {
        dest[0] = v1[0] / v2[0];
        dest[1] = v1[1] / v2[1];
        dest[2] = v1[2] / v2[2];
    } else {
        dest[0] = v1[0] / v2;
        dest[1] = v1[1] / v2;
        dest[2] = v1[2] / v2;
    }
    return dest;
};
Vector3.equals = function(v1, v2) {
    return v1[0] == v2[0] && v1[1] == v2[1] && v1[2] == v2[2];
};
Vector3.dot = function(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};
Vector3.cross = function(v1, v2, dest) {
    dest[0] = v1[1] * v2[2] - v1[2] * v2[1];
    dest[1] = v1[2] * v2[0] - v1[0] * v2[2];
    dest[2] = v1[0] * v2[1] - v1[1] * v2[0];
    return dest;
};
var Vector3Length = function (vec) {
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
};
Vector3.size = function(vec) { // length
    return Vector3Length(vec);
};
Vector3.unit = function(vec, dest) {
    return this.divide(vec, Vector3Length(vec), dest);
};
Vector3.normalize = function(vec, dest) {
    let x = vec[0], y = vec[1], z = vec[2];
    let len = Vector3Length(vec);
    let m = (len === 0 ? 1.0 : 1.0 / len);
    dest[0] = x * m;
    dest[1] = y * m;
    dest[2] = z * m;
    return dest;
};
Vector3.min = function(vec) {
    return Math.min(Math.min(vec[0], vec[1]), vec[2]);
},
Vector3.max = function(vec) {
    return Math.max(Math.max(vec[0], vec[1]), vec[2]);
};
Vector3.toAngle = function(vec) {
    return {
        theta: Math.atan2(vec[2], vec[0]),
        phi: Math.asin(vec[1] / Vector3Length(vec))
    };
};
Vector3.angleTo = function(vec, a) {
    return Math.acos(this.dot(a) / (Vector3Length(vec) * Vector3Length(a)));
};
Vector3.clone = function(vec, dest) {
    if (typeof dest === 'undefined') {
        dest = this.create();
    }
    dest[0] = vec[0];
    dest[1] = vec[1];
    dest[2] = vec[2];
    return dest;
};
Vector3.fromAngles = function(theta, phi, dest) {
    if (typeof dest === 'undefined') {
        dest = this.create();
    }
    dest[0] = Math.cos(theta) * Math.cos(phi);
    dest[1] = Math.sin(phi);
    dest[2] = Math.sin(theta) * Math.cos(phi);
    return dest;
};
Vector3.randomDirection = function() {
    return this.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
};
Vector3.lerp = function(vec1, vec2, fraction, dest) {
    this.subtract(vec2, vec1, dest);
    this.multiply(dest, fraction, dest);
    return this.add(dest, vec1, dest);
};
Vector3.angleBetween = function(v1, v2) {
    return this.angleTo(v1, v2);
};
Vector3.innerProduct = function(vec, x, y, z) {
    return vec[0] * x + vec[1] * y + vec[2] * z;
};

// ------------------------------------------------------------------------------------------------
// Matrix44
// based on minMatrix.js (https://wgld.org/j/minMatrix.js)
// ------------------------------------------------------------------------------------------------
var Matrix44 = function() {
};
Matrix44.create = function() {
    return new Float32Array(16);
};
Matrix44.identity = function(dest) {
    dest[0]  = 1; dest[1]  = 0; dest[2]  = 0; dest[3]  = 0;
    dest[4]  = 0; dest[5]  = 1; dest[6]  = 0; dest[7]  = 0;
    dest[8]  = 0; dest[9]  = 0; dest[10] = 1; dest[11] = 0;
    dest[12] = 0; dest[13] = 0; dest[14] = 0; dest[15] = 1;
    return dest;
};
Matrix44.createIdentity = function() {
    let mat = this.create();
    return this.identity(mat);
};
Matrix44.multiply = function(mat1, mat2, dest) {
    let a = mat1[0],  b = mat1[1],  c = mat1[2],  d = mat1[3],
        e = mat1[4],  f = mat1[5],  g = mat1[6],  h = mat1[7],
        i = mat1[8],  j = mat1[9],  k = mat1[10], l = mat1[11],
        m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15],
        A = mat2[0],  B = mat2[1],  C = mat2[2],  D = mat2[3],
        E = mat2[4],  F = mat2[5],  G = mat2[6],  H = mat2[7],
        I = mat2[8],  J = mat2[9],  K = mat2[10], L = mat2[11],
        M = mat2[12], N = mat2[13], O = mat2[14], P = mat2[15];
    dest[0] = A * a + B * e + C * i + D * m;
    dest[1] = A * b + B * f + C * j + D * n;
    dest[2] = A * c + B * g + C * k + D * o;
    dest[3] = A * d + B * h + C * l + D * p;
    dest[4] = E * a + F * e + G * i + H * m;
    dest[5] = E * b + F * f + G * j + H * n;
    dest[6] = E * c + F * g + G * k + H * o;
    dest[7] = E * d + F * h + G * l + H * p;
    dest[8] = I * a + J * e + K * i + L * m;
    dest[9] = I * b + J * f + K * j + L * n;
    dest[10] = I * c + J * g + K * k + L * o;
    dest[11] = I * d + J * h + K * l + L * p;
    dest[12] = M * a + N * e + O * i + P * m;
    dest[13] = M * b + N * f + O * j + P * n;
    dest[14] = M * c + N * g + O * k + P * o;
    dest[15] = M * d + N * h + O * l + P * p;
    return dest;
};
Matrix44.scale = function(mat, vec, dest) {
    dest[0]  = mat[0]  * vec[0];
    dest[1]  = mat[1]  * vec[0];
    dest[2]  = mat[2]  * vec[0];
    dest[3]  = mat[3]  * vec[0];
    dest[4]  = mat[4]  * vec[1];
    dest[5]  = mat[5]  * vec[1];
    dest[6]  = mat[6]  * vec[1];
    dest[7]  = mat[7]  * vec[1];
    dest[8]  = mat[8]  * vec[2];
    dest[9]  = mat[9]  * vec[2];
    dest[10] = mat[10] * vec[2];
    dest[11] = mat[11] * vec[2];
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
    return dest;
};
Matrix44.translate = function(mat, vec, dest) {
    dest[0] = mat[0]; dest[1] = mat[1]; dest[2]  = mat[2];  dest[3]  = mat[3];
    dest[4] = mat[4]; dest[5] = mat[5]; dest[6]  = mat[6];  dest[7]  = mat[7];
    dest[8] = mat[8]; dest[9] = mat[9]; dest[10] = mat[10]; dest[11] = mat[11];
    dest[12] = mat[0] * vec[0] + mat[4] * vec[1] + mat[8]  * vec[2] + mat[12];
    dest[13] = mat[1] * vec[0] + mat[5] * vec[1] + mat[9]  * vec[2] + mat[13];
    dest[14] = mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14];
    dest[15] = mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15];
    return dest;
};
Matrix44.rotate = function(mat, angle, axis, dest) {
    let sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    if(!sq){return null;}
    let a = axis[0], b = axis[1], c = axis[2];
    if(sq != 1){sq = 1 / sq; a *= sq; b *= sq; c *= sq;}
    let d = Math.sin(angle), e = Math.cos(angle), f = 1 - e,
        g = mat[0],  h = mat[1], i = mat[2],  j = mat[3],
        k = mat[4],  l = mat[5], m = mat[6],  n = mat[7],
        o = mat[8],  p = mat[9], q = mat[10], r = mat[11],
        s = a * a * f + e,
        t = b * a * f + c * d,
        u = c * a * f - b * d,
        v = a * b * f - c * d,
        w = b * b * f + e,
        x = c * b * f + a * d,
        y = a * c * f + b * d,
        z = b * c * f - a * d,
        A = c * c * f + e;
    if(angle){
        if(mat != dest){
            dest[12] = mat[12]; dest[13] = mat[13];
            dest[14] = mat[14]; dest[15] = mat[15];
        }
    } else {
        dest = mat;
    }
    dest[0] = g * s + k * t + o * u;
    dest[1] = h * s + l * t + p * u;
    dest[2] = i * s + m * t + q * u;
    dest[3] = j * s + n * t + r * u;
    dest[4] = g * v + k * w + o * x;
    dest[5] = h * v + l * w + p * x;
    dest[6] = i * v + m * w + q * x;
    dest[7] = j * v + n * w + r * x;
    dest[8] = g * y + k * z + o * A;
    dest[9] = h * y + l * z + p * A;
    dest[10] = i * y + m * z + q * A;
    dest[11] = j * y + n * z + r * A;
    return dest;
},
Matrix44.lookAt = function(eye, center, up, dest) {
    let eyeX    = eye[0],    eyeY    = eye[1],    eyeZ    = eye[2],
        upX     = up[0],     upY     = up[1],     upZ     = up[2],
        centerX = center[0], centerY = center[1], centerZ = center[2];
    if(eyeX == centerX && eyeY == centerY && eyeZ == centerZ){return this.identity(dest);}
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, l;
    z0 = eyeX - center[0]; z1 = eyeY - center[1]; z2 = eyeZ - center[2];
    l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= l; z1 *= l; z2 *= l;
    x0 = upY * z2 - upZ * z1;
    x1 = upZ * z0 - upX * z2;
    x2 = upX * z1 - upY * z0;
    l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if(!l){
        x0 = 0; x1 = 0; x2 = 0;
    } else {
        l = 1 / l;
        x0 *= l; x1 *= l; x2 *= l;
    }
    y0 = z1 * x2 - z2 * x1; y1 = z2 * x0 - z0 * x2; y2 = z0 * x1 - z1 * x0;
    l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if(!l){
        y0 = 0; y1 = 0; y2 = 0;
    } else {
        l = 1 / l;
        y0 *= l; y1 *= l; y2 *= l;
    }
    dest[0] = x0; dest[1] = y0; dest[2]  = z0; dest[3]  = 0;
    dest[4] = x1; dest[5] = y1; dest[6]  = z1; dest[7]  = 0;
    dest[8] = x2; dest[9] = y2; dest[10] = z2; dest[11] = 0;
    dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
    dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
    dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
    dest[15] = 1;
    return dest;
};
Matrix44.perspective = function(fovy, aspect, near, far, dest) {
    let t = near * Math.tan(fovy * Math.PI / 360);
    let r = t * aspect;
    let a = r * 2, b = t * 2, c = far - near;
    dest[0] = near * 2 / a;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = near * 2 / b;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = -(far + near) / c;
    dest[11] = -1;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = -(far * near * 2) / c;
    dest[15] = 0;
    return dest;
};
Matrix44.transpose = function(mat, dest) {
    dest[0]  = mat[0];  dest[1]  = mat[4];
    dest[2]  = mat[8];  dest[3]  = mat[12];
    dest[4]  = mat[1];  dest[5]  = mat[5];
    dest[6]  = mat[9];  dest[7]  = mat[13];
    dest[8]  = mat[2];  dest[9]  = mat[6];
    dest[10] = mat[10]; dest[11] = mat[14];
    dest[12] = mat[3];  dest[13] = mat[7];
    dest[14] = mat[11]; dest[15] = mat[15];
    return dest;
};
Matrix44.inverse = function(mat, dest) {
    let a = mat[0],  b = mat[1],  c = mat[2],  d = mat[3],
        e = mat[4],  f = mat[5],  g = mat[6],  h = mat[7],
        i = mat[8],  j = mat[9],  k = mat[10], l = mat[11],
        m = mat[12], n = mat[13], o = mat[14], p = mat[15],
        q = a * f - b * e, r = a * g - c * e,
        s = a * h - d * e, t = b * g - c * f,
        u = b * h - d * f, v = c * h - d * g,
        w = i * n - j * m, x = i * o - k * m,
        y = i * p - l * m, z = j * o - k * n,
        A = j * p - l * n, B = k * p - l * o,
        ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);
    dest[0]  = ( f * B - g * A + h * z) * ivd;
    dest[1]  = (-b * B + c * A - d * z) * ivd;
    dest[2]  = ( n * v - o * u + p * t) * ivd;
    dest[3]  = (-j * v + k * u - l * t) * ivd;
    dest[4]  = (-e * B + g * y - h * x) * ivd;
    dest[5]  = ( a * B - c * y + d * x) * ivd;
    dest[6]  = (-m * v + o * s - p * r) * ivd;
    dest[7]  = ( i * v - k * s + l * r) * ivd;
    dest[8]  = ( e * A - f * y + h * w) * ivd;
    dest[9]  = (-a * A + b * y - d * w) * ivd;
    dest[10] = ( m * u - n * s + p * q) * ivd;
    dest[11] = (-i * u + j * s - l * q) * ivd;
    dest[12] = (-e * z + f * x - g * w) * ivd;
    dest[13] = ( a * z - b * x + c * w) * ivd;
    dest[14] = (-m * t + n * r - o * q) * ivd;
    dest[15] = ( i * t - j * r + k * q) * ivd;
    return dest;
};

// ------------------------------------------------------------------------------------------------
// MathUtil
// ------------------------------------------------------------------------------------------------
var MathUtil = function() {
};
MathUtil.intersectTriangle = function(v0, v1, v2, ray, rayDir, out) {
    let edge1 = Vector3.create(), edge2 = Vector3.create();
    Vector3.subtract(v1, v0, edge1);
    Vector3.subtract(v2, v0, edge2);
    let pvec = Vector3.create();
    Vector3.cross(rayDir, edge2, pvec);
    let det = Vector3.dot(edge1, pvec);
    if (det < Math.EPSILON) return null;
    let tvec = Vector3.create();
    Vector3.subtract(ray, v0, tvec);
    let u = Vector3.dot(tvec, pvec);
    if (u < 0 || u > det) return null;
    let qvec = Vector3.create();
    Vector3.cross(tvec, edge1, qvec);
    let v = Vector3.dot(rayDir, qvec);
    if (v < 0 || u + v > det) return null;
    let t = Vector3.dot(edge2, qvec) / det;
    if (typeof(out) === 'undefined') {
        out = Vector3.create();
    }
    out[0] = ray[0] + t * rayDir[0];
    out[1] = ray[1] + t * rayDir[1];
    out[2] = ray[2] + t * rayDir[2];
    return out;
};
MathUtil.transformCoord = function(vec, mat, dest) {
    let x = vec[0], y = vec[1], z = vec[2],
        w = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
        w = w || 1.0;
    dest[0] = (mat[0] * x + mat[4] * y + mat[8] * z + mat[12]) / w;
    dest[1] = (mat[1] * x + mat[5] * y + mat[9] * z + mat[13]) / w;
    dest[2] = (mat[2] * x + mat[6] * y + mat[10] * z + mat[14]) / w;
    return dest;
};
MathUtil.project = function(pos, view, proj, viewport, dest) {
    // Transformation vectors
    let temp = new Array(8);
    // Modelview transform
    temp[0] = view[0] * pos[0] + view[4] * pos[1] + view[ 8] * pos[2] + view[12]; // w is always 1
    temp[1] = view[1] * pos[0] + view[5] * pos[1] + view[ 9] * pos[2] + view[13];
    temp[2] = view[2] * pos[0] + view[6] * pos[1] + view[10] * pos[2] + view[14];
    temp[3] = view[3] * pos[0] + view[7] * pos[1] + view[11] * pos[2] + view[15];
    // Projection transform, the final row of projection matrix is always [0 0 -1 0]
    // so we optimize for that.
    temp[4] = proj[0] * temp[0] + proj[4] * temp[1] + proj[ 8] * temp[2] + proj[12] * temp[3];
    temp[5] = proj[1] * temp[0] + proj[5] * temp[1] + proj[ 9] * temp[2] + proj[13] * temp[3];
    temp[6] = proj[2] * temp[0] + proj[6] * temp[1] + proj[10] * temp[2] + proj[14] * temp[3];
    temp[7] = -temp[2];
    // The result normalizes between -1 and 1
    if (temp[7] === 0.0) { // The w value
        return 0;
    }
    temp[7] = 1.0 / temp[7];
    // Perspective division
    temp[4] *= temp[7];
    temp[5] *= temp[7];
    temp[6] *= temp[7];
    // Window coordinates
    // Map x, y to range 0-1
    dest[0] = (temp[4] * 0.5 + 0.5) * viewport[2] + viewport[0];
    dest[1] = (temp[5] * 0.5 + 0.5) * viewport[3] + viewport[1];
    // This is only correct when glDepthRange(0.0, 1.0)
    dest[2] = (1.0 + temp[6]) * 0.5; // Between 0 and 1
    return 1;
};
MathUtil.unproject = function(winpos, view, proj, viewport, dest) {
    // Transformation matrices
    let m = Matrix44.createIdentity(), A = Matrix44.createIdentity();
    let inArray = new Array(4), outArray = new Array(4);
    // Calculation for inverting a matrix, compute projection x modelview
    // and store in A[16]
    this._multiplyMatrices4by4(A, proj, view);
    // Now compute the inverse of matrix A
    Matrix44.inverse(A, m);
    //Transformation of normalized coordinates between -1 and 1
    inArray[0] = (winpos[0] - viewport[0]) / viewport[2] * 2.0 - 1.0;
    inArray[1] = (winpos[1] - viewport[1]) / viewport[3] * 2.0 - 1.0;
    inArray[2] = 2.0 * winpos[2] - 1.0;
    inArray[3] = 1.0;
    //Objects coordinates
    this._multiplyMatrixByVector4by4(outArray, m, inArray);
    if(outArray[3] === 0.0) {
        return 0;
    }
    outArray[3] = 1.0 / outArray[3];
    dest[0] = outArray[0] * outArray[3];
    dest[1] = outArray[1] * outArray[3];
    dest[2] = outArray[2] * outArray[3];
    return 1;
};
MathUtil._multiplyMatrices4by4 = function(result, matrix1, matrix2) {
    result[0]=matrix1[0]*matrix2[0]+
      matrix1[4]*matrix2[1]+
      matrix1[8]*matrix2[2]+
      matrix1[12]*matrix2[3];
    result[4]=matrix1[0]*matrix2[4]+
      matrix1[4]*matrix2[5]+
      matrix1[8]*matrix2[6]+
      matrix1[12]*matrix2[7];
    result[8]=matrix1[0]*matrix2[8]+
      matrix1[4]*matrix2[9]+
      matrix1[8]*matrix2[10]+
      matrix1[12]*matrix2[11];
    result[12]=matrix1[0]*matrix2[12]+
      matrix1[4]*matrix2[13]+
      matrix1[8]*matrix2[14]+
      matrix1[12]*matrix2[15];
    result[1]=matrix1[1]*matrix2[0]+
      matrix1[5]*matrix2[1]+
      matrix1[9]*matrix2[2]+
      matrix1[13]*matrix2[3];
    result[5]=matrix1[1]*matrix2[4]+
      matrix1[5]*matrix2[5]+
      matrix1[9]*matrix2[6]+
      matrix1[13]*matrix2[7];
    result[9]=matrix1[1]*matrix2[8]+
      matrix1[5]*matrix2[9]+
      matrix1[9]*matrix2[10]+
      matrix1[13]*matrix2[11];
    result[13]=matrix1[1]*matrix2[12]+
      matrix1[5]*matrix2[13]+
      matrix1[9]*matrix2[14]+
      matrix1[13]*matrix2[15];
    result[2]=matrix1[2]*matrix2[0]+
      matrix1[6]*matrix2[1]+
      matrix1[10]*matrix2[2]+
      matrix1[14]*matrix2[3];
    result[6]=matrix1[2]*matrix2[4]+
      matrix1[6]*matrix2[5]+
      matrix1[10]*matrix2[6]+
      matrix1[14]*matrix2[7];
    result[10]=matrix1[2]*matrix2[8]+
      matrix1[6]*matrix2[9]+
      matrix1[10]*matrix2[10]+
      matrix1[14]*matrix2[11];
    result[14]=matrix1[2]*matrix2[12]+
      matrix1[6]*matrix2[13]+
      matrix1[10]*matrix2[14]+
      matrix1[14]*matrix2[15];
    result[3]=matrix1[3]*matrix2[0]+
      matrix1[7]*matrix2[1]+
      matrix1[11]*matrix2[2]+
      matrix1[15]*matrix2[3];
    result[7]=matrix1[3]*matrix2[4]+
      matrix1[7]*matrix2[5]+
      matrix1[11]*matrix2[6]+
      matrix1[15]*matrix2[7];
    result[11]=matrix1[3]*matrix2[8]+
      matrix1[7]*matrix2[9]+
      matrix1[11]*matrix2[10]+
      matrix1[15]*matrix2[11];
    result[15]=matrix1[3]*matrix2[12]+
      matrix1[7]*matrix2[13]+
      matrix1[11]*matrix2[14]+
      matrix1[15]*matrix2[15];
    return result;
};
MathUtil._multiplyMatrixByVector4by4 = function (resultvector, matrix, pvector) {
    resultvector[0]=matrix[0]*pvector[0]+matrix[4]*pvector[1]+matrix[8]*pvector[2]+matrix[12]*pvector[3];
    resultvector[1]=matrix[1]*pvector[0]+matrix[5]*pvector[1]+matrix[9]*pvector[2]+matrix[13]*pvector[3];
    resultvector[2]=matrix[2]*pvector[0]+matrix[6]*pvector[1]+matrix[10]*pvector[2]+matrix[14]*pvector[3];
    resultvector[3]=matrix[3]*pvector[0]+matrix[7]*pvector[1]+matrix[11]*pvector[2]+matrix[15]*pvector[3];
    return resultvector;
};
