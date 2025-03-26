#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D texture;

void main() {
  vec4 texColor = texture2D(texture, vTexCoord);
  vec3 fireColor = vec3(1.0, 0.5, 0.0); // Màu đỏ cam
  gl_FragColor = vec4(texColor.rgb * fireColor, texColor.a);
}