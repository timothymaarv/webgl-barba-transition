uniform float time;
// varying float pulse;

varying vec2 vUv;
// varying vec3 vNormal;


uniform float uProgress;

uniform vec2 uResolution;
uniform vec2 uQuadSize;
uniform vec4 uCorners;

varying vec2 vSize;



void main() {

    float PI = 3.1415926;
    vUv = uv;

    float sine = sin(PI * uProgress);

    float waves = sine*0.1*sin(5.*length(uv) + 15.*uProgress);

    vec4 defaultState = modelMatrix*vec4(position, 1.0);
    vec4 fullScreenState = vec4(position, 1.0);
    fullScreenState.x *= uResolution.x;
    fullScreenState.y *= uResolution.y;
    fullScreenState.z += uCorners.x;
    
    float cornersProgress = mix
    (
        mix(uCorners.z, uCorners.w, uv.x), 
        mix(uCorners.x, uCorners.y, uv.x),
        uv.y
    );

    vec4 finalState = mix(defaultState, fullScreenState, cornersProgress);

    vSize = mix(uQuadSize, uResolution, cornersProgress);

    gl_Position = projectionMatrix * viewMatrix * finalState;
}


//	Simplex 4D Noise 
//	by Ian McEwan, Ashima Arts
    // vNormal = normal;

    // vec3 newPosition = position;
    // float noise = snoise(vec4(normal*15., time*0.4));
    // newPosition = position + 0.1*normal * noise;
    // newPosition.z = -0.05*sin(length(position)*30. + time);
    // pulse = noise;