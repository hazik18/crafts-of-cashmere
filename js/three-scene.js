/* ============================================================
   VÁLLEY — hero 3D scene
   A flowing pashmina-like cloth: a high-segment plane displaced
   by layered waves in a custom shader, tinted ivory → gold.
   Degrades gracefully: no WebGL / reduced motion → static hero.
   ============================================================ */

(function () {
  const canvas = document.getElementById('heroCanvas');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canvas || reduced || typeof THREE === 'undefined') {
    if (canvas) canvas.style.display = 'none';
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    canvas.style.display = 'none';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 1.1, 7.5);
  camera.lookAt(0, -0.4, 0);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uInk: { value: new THREE.Color('#191613') },
    uIvory: { value: new THREE.Color('#F4EDE0') },
    uGold: { value: new THREE.Color('#C9A566') },
    uBg: { value: new THREE.Color('#FAF7F1') },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      varying float vElev;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float t = uTime * 0.55;

        float w1 = sin(pos.x * 1.15 + t) * 0.42;
        float w2 = sin(pos.x * 2.3 - t * 1.4 + pos.y * 1.6) * 0.22;
        float w3 = sin(pos.y * 3.2 + t * 0.8) * 0.14;
        float ripple = sin((pos.x + pos.y) * 4.5 - t * 2.0) * 0.05;

        float mouseWave = sin(pos.x * 1.6 + uMouse.x * 2.0) * uMouse.y * 0.18;

        pos.z += w1 + w2 + w3 + ripple + mouseWave;
        vElev = pos.z;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uIvory;
      uniform vec3 uGold;
      uniform vec3 uInk;
      uniform vec3 uBg;
      varying float vElev;
      varying vec2 vUv;

      void main() {
        float h = smoothstep(-0.6, 0.9, vElev);
        vec3 col = mix(uIvory, uGold, pow(h, 1.6));
        col = mix(col, uInk, smoothstep(0.15, -0.75, vElev) * 0.28);

        // weave threads
        float threadX = smoothstep(0.46, 0.5, abs(fract(vUv.x * 90.0) - 0.5));
        float threadY = smoothstep(0.46, 0.5, abs(fract(vUv.y * 90.0) - 0.5));
        col = mix(col, uInk, (threadX + threadY) * 0.03);

        // fade cloth into page background at edges
        float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x)
                   * smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.78, vUv.y);
        col = mix(uBg, col, edge);
        float alpha = edge * 0.92;

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const geometry = new THREE.PlaneGeometry(16, 9, 180, 110);
  const cloth = new THREE.Mesh(geometry, material);
  cloth.rotation.x = -Math.PI / 2.45;
  cloth.position.y = -1.6;
  scene.add(cloth);

  // floating golden dust
  const dustGeo = new THREE.BufferGeometry();
  const N = 90;
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = Math.random() * 4 - 1.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0xa67c3d, size: 0.035, transparent: true, opacity: 0.55 })
  );
  scene.add(dust);

  // mouse parallax (eased)
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  let heroVisible = true;

  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; })
    .observe(document.getElementById('hero'));

  function tick() {
    requestAnimationFrame(tick);
    if (!heroVisible) return;

    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.set(mouse.x * 3.0, 0.5 + mouse.y * 0.5);

    cloth.rotation.z = mouse.x * 0.04;
    camera.position.x = mouse.x * 0.35;
    camera.position.y = 1.1 - mouse.y * 0.15;
    camera.lookAt(0, -0.4, 0);

    dust.rotation.y = clock.getElapsedTime() * 0.02;

    renderer.render(scene, camera);
  }
  tick();
})();
