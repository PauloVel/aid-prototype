/* AID Studio: the helmet. A live 3D scene that the story page copies into its WebGL mist.
   Appears as raw grey clay and is painted into the finished design by a sweeping clip plane while it turns. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/meshopt_decoder.module.js';

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const CONFIG = {
    model: 'assets/helmet/helmet.glb',
    visorMaterial: 'Material.001',
    yellowMaterial: 'mat_4',
    grayMaterials: ['Material.003', 'Material.004', 'Material.005', 'Material.006'],
  };
  const api = { ready: false, canvas: null, render() {}, setSize() {} };
  window.AIDHelmet = api;
  try {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.localClippingEnabled = true;
    api.canvas = renderer.domElement;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 10);

    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x0b0c0e, side: THREE.BackSide })));
    [[5, 2.2, 0, 4.6, 0, 14], [1.2, 5, -4.2, 1, 2.5, 18], [1.2, 5, 4.2, 1, 2.5, 18], [4, 1.2, 0, .5, 4.6, 8], [3, 1, 0, -1.5, -4.6, 6]].forEach(([w, h, x, y, z, i]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(i), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    });
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(env, 0.02).texture;

    const pivot = new THREE.Group(); scene.add(pivot);
    const planeFinal = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);   // keeps y <= c (painted)
    const planeClay = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);     // keeps y >= c (raw)
    let minY = -1, maxY = 1, R = 1, W = 2, H = 1;

    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(CONFIG.model, (gltf) => {
      const model = gltf.scene;
      const visor = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: .02, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.2, side: THREE.DoubleSide });
      const red = new THREE.MeshStandardMaterial({ color: 0x3a0107, roughness: .9, envMapIntensity: .25, side: THREE.DoubleSide });
      const black = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: .5, roughness: .3, side: THREE.DoubleSide });
      const clay = new THREE.MeshStandardMaterial({ color: 0xc4c4be, roughness: .92, metalness: 0, envMapIntensity: .6, side: THREE.DoubleSide });
      clay.clippingPlanes = [planeClay];
      const finals = new Set();
      const clones = [];
      model.traverse((o) => {
        if (!o.isMesh) return;
        const n = o.material.name;
        if (n === CONFIG.visorMaterial) o.material = visor;
        else if (n === CONFIG.yellowMaterial) o.material = red;
        else if (CONFIG.grayMaterials.includes(n)) o.material = black;
        finals.add(o.material);
        const c = new THREE.Mesh(o.geometry, clay);
        c.matrixAutoUpdate = false; c.matrix.copy(o.matrixWorld); clones.push([o, c]);
      });
      finals.forEach((m) => { m.clippingPlanes = [planeFinal]; });
      pivot.add(model);
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      model.updateMatrixWorld(true);
      // raw clay copy lives under the same pivot so it spins with the helmet
      const clayRoot = new THREE.Group(); pivot.add(clayRoot);
      clones.forEach(([o, c]) => { c.matrix.copy(o.matrixWorld); c.matrixWorldNeedsUpdate = true; clayRoot.add(c); });
      clayRoot.matrixAutoUpdate = false;
      R = Math.max(size.x, size.y, size.z);
      minY = -size.y / 2 - R * .02; maxY = size.y / 2 + R * .02;
      camera.near = R / 100; camera.far = R * 50;
      camera.position.set(R * .7, R * .22, R * 1.95); camera.lookAt(0, 0, 0);
      api.ready = true;
    }, undefined, (e) => { console.warn('helmet failed', e); });

    api.setSize = (w, h) => {
      if (w === W && h === H) return;
      W = w; H = h; renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 1 ? 30 / Math.max(w / h, .6) * .9 : 30;
      if (w / h >= 1) camera.setViewOffset(w, h, -w * .15, 0, w, h); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
    api.render = (rot, paint) => {
      if (!api.ready) return;
      pivot.rotation.y = rot;
      const c = minY + (maxY - minY) * paint;
      planeFinal.constant = c; planeClay.constant = -c;
      renderer.render(scene, camera);
    };
  } catch (e) { window.AIDHelmet = null; console.warn('helmet unavailable', e); }
}
