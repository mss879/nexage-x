/**
 * Minimal WebGL helpers for the preloader's single particle draw call.
 *
 * The preloader used to pull in all of three.js (the largest chunk on the
 * site) just to draw one THREE.Points object. These few functions replace the
 * pieces it actually used. Every function here mirrors three r184's behaviour
 * so the rendered result is identical — see the notes on each.
 */

type GL = WebGLRenderingContext | WebGL2RenderingContext;

/** Same context attributes three's WebGLRenderer requested for this scene. */
export function createContext(canvas: HTMLCanvasElement): GL | null {
  const attrs: WebGLContextAttributes = {
    alpha: true,
    depth: true,
    stencil: false,
    antialias: false, // round sprites are shader-feathered; MSAA buys nothing
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  };
  return (
    (canvas.getContext("webgl2", attrs) as WebGL2RenderingContext | null) ??
    (canvas.getContext("webgl", attrs) as WebGLRenderingContext | null)
  );
}

// What THREE.ShaderMaterial prepends to a vertex shader (the parts this one uses)
const VERT_PREFIX = /* glsl */ `
  precision highp float;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec3 position;
`;

function compile(gl: GL, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("preloader: shader allocation failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`preloader: shader compile failed — ${log}`);
  }
  return shader;
}

export function createProgram(gl: GL, vertexSource: string, fragmentSource: string): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("preloader: program allocation failed");
  const vs = compile(gl, gl.VERTEX_SHADER, VERT_PREFIX + vertexSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  // Shaders are owned by the program once linked
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`preloader: program link failed — ${log}`);
  }
  return program;
}

/** Upload a static float attribute and point the named shader input at it. */
export function bindAttribute(
  gl: GL,
  program: WebGLProgram,
  name: string,
  data: Float32Array,
  itemSize: number
): WebGLBuffer | null {
  const location = gl.getAttribLocation(program, name);
  if (location < 0) return null; // optimised out by the compiler
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, itemSize, gl.FLOAT, false, 0, 0);
  return buffer;
}

/**
 * sRGB → linear, identical to three's SRGBToLinear. THREE.Color.setHex()
 * linearises hex colours (ColorManagement is on by default) and a raw
 * ShaderMaterial never re-encodes them, so the particle colours the old
 * preloader put on screen were these linear values.
 */
export function srgbToLinear(c: number): number {
  return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}

/** Column-major perspective matrix — same as THREE.PerspectiveCamera. */
export function perspective(out: Float32Array, fovDeg: number, aspect: number, near: number, far: number) {
  const top = near * Math.tan((fovDeg * Math.PI) / 360);
  const height = 2 * top;
  const width = aspect * height;
  out.fill(0);
  out[0] = (2 * near) / width;
  out[5] = (2 * near) / height;
  out[10] = -(far + near) / (far - near);
  out[11] = -1;
  out[14] = (-2 * far * near) / (far - near);
  return out;
}

/**
 * modelView for the old scene graph, flattened:
 *   camera at (0,0,camZ) · parent group (y offset, uniform scale) ·
 *   sphere group (Euler XYZ rotation with z = 0, uniform scale)
 * Group matrices compose as T·R·S, so the parent's y offset is not scaled.
 */
export function sphereModelView(
  out: Float32Array,
  camZ: number,
  parentY: number,
  parentScale: number,
  rotX: number,
  rotY: number,
  sphereScale: number
) {
  const a = Math.cos(rotX), b = Math.sin(rotX);
  const c = Math.cos(rotY), d = Math.sin(rotY);
  const s = parentScale * sphereScale;
  // Rx · Ry, column-major (THREE.Matrix4.makeRotationFromEuler, order XYZ)
  out[0] = c * s;      out[1] = b * d * s;  out[2] = -a * d * s; out[3] = 0;
  out[4] = 0;          out[5] = a * s;      out[6] = b * s;      out[7] = 0;
  out[8] = d * s;      out[9] = -b * c * s; out[10] = a * c * s; out[11] = 0;
  out[12] = 0;         out[13] = parentY;   out[14] = -camZ;     out[15] = 1;
  return out;
}
