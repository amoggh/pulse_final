import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl';

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uPulseSpeed;
uniform float uGlowIntensity;

#define PI 3.1415926538

float heartbeatWave(float x, float time, float speed) {
    // Create a repeating pulse shape
    float t = mod(time * speed, 2.0 * PI);
    float pulse = exp(-10.0 * abs(sin(t) - x)); // sharp heartbeat peaks
    return pulse;
}

float waveform(float x, float time, float speed) {
    float base = sin(x * 8.0 + time * speed * 2.0) * 0.1;
    float pulse = heartbeatWave(x, time, speed);
    return base + pulse * 0.3;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    uv = uv * 2.0 - 1.0; // -1 to 1 space
    uv.x *= iResolution.x / iResolution.y;

    float y = waveform(uv.x, iTime, uPulseSpeed);
    float line = smoothstep(0.02, 0.0, abs(uv.y - y));

    // Glow effect around the line
    float glow = smoothstep(0.15, 0.0, abs(uv.y - y)) * uGlowIntensity;

    vec3 color = uColor * (line + glow * 0.8);
    fragColor = vec4(color, line + glow);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

const PulseAnimation = ({
  color = [1.0, 0.2, 0.3], // soft red
  pulseSpeed = 1.5,
  glowIntensity = 0.6,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uColor: { value: new Color(...color) },
        uPulseSpeed: { value: pulseSpeed },
        uGlowIntensity: { value: glowIntensity },
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.iResolution.value.r = clientWidth;
      program.uniforms.iResolution.value.g = clientHeight;
      program.uniforms.iResolution.value.b = clientWidth / clientHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function update(t: number) {
      program.uniforms.iTime.value = t * 0.001;
      renderer.render({ scene: mesh });
      animationFrameId.current = requestAnimationFrame(update);
    }
    animationFrameId.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resize);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color, pulseSpeed, glowIntensity]);

  return <div ref={containerRef} className="w-full h-full relative" {...rest} />;
};

export default PulseAnimation;
