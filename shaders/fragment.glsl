uniform float time;

varying float pulse;
varying vec2 vUv;
// varying vec3 vNormal;

uniform sampler2D uTexture;
uniform float uProgress;
uniform vec2 uTextureSize;

varying vec2 vSize;

vec2 getUV(vec2 uv, vec2 textureSize, vec2 quadSize){
    vec2 tempUV = uv - vec2(0.5);

    float quadAspect = quadSize.x / quadSize.y;
    float textureAspect = textureSize.x/textureSize.y;

    if(quadAspect < textureAspect){
        tempUV = tempUV * vec2(quadAspect/textureAspect,1.);
    } else {
        tempUV = tempUV * vec2(1.,textureAspect/quadAspect);
    }

    tempUV += vec2(0.5);
    return tempUV;
}

void main() {
    // vec4 myimage = texture(uTexture, vUv + 0.01*sin(vUv*10. + time));
    // float sinePulse = (1. + sin(vUv.x*30. + time ))*0.5; // between 0 and 1
    // gl_FragColor = vec4(vUv,0.,1.);
    // gl_FragColor = vec4(sinePulse, 0., 0., 1.);
    // gl_FragColor = myimage;
    // gl_FragColor = vec4(pulse,pulse,pulse,1.);

    // vec2 newUV = (vUv - vec2(0.5))*vec2(0.5) + vec2(0.5); // keep the scale in the center
    // vec2 newUV = vUv*2.;


    vec2 correctUV = getUV(vUv, uTextureSize, vSize);
    vec4 image = texture(uTexture, correctUV);
    // gl_FragColor = vec4(vUv,0.,1.);
    gl_FragColor = image;
}