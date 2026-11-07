/* AID Studio: the helmet, drawn as lines. Orthographic camera for a flat 2D-drawing look; the shell is
   filled flat white with black contour lines, the visor is glossy red, and a slightly inflated back-face
   hull rings the shell with a black contour. The model leans a touch off-axis; it turns by dragging. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/meshopt_decoder.module.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const api = { ready: false, canvas: null, render() {}, setSize() {} };
  window.AIDHelmet = api;
  const tick = () => new Promise((r) => setTimeout(r, 0));
  const start = () => { try {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(1);
    api.canvas = renderer.domElement;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    /* the snowboard shot sits behind the helmet, cover-fitted to the canvas */
    const IA = 992 / 808; let bgTex = null;
    const fitBg = (w, h) => { if (!bgTex) return; const a = w / h;
      if (a > IA) { bgTex.repeat.set(1, IA / a); bgTex.offset.set(0, (1 - IA / a) / 2); } else { bgTex.repeat.set(a / IA, 1); bgTex.offset.set((1 - a / IA) / 2, 0); } };
    new THREE.TextureLoader().load('assets/snow_hor.jpg', (t) => { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; bgTex = t; scene.background = t; fitBg(renderer.domElement.width, renderer.domElement.height); });
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    const pivot = new THREE.Group(); scene.add(pivot);
    let R = 1, W = 2, H = 1;

    /* The model's sponsor layers and lettering pieces are removed; the rest is drawn as line art. */
    const HIDE = new Set(['mat_2', 'mat_3', 'mat_4', 'mat_5', 'mat_6', 'mat_7', 'mat_9', 'mat_11', 'mat_12', 'mat_13', 'mat_14', 'material_0']);
    const SHELL = 'mat_0';
    const VISOR = 'Material.001';
    const fill = new THREE.MeshBasicMaterial({ color: 0xf4f4f0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const ink = new LineMaterial({ color: 0x0a0a0a, linewidth: 3.5, depthWrite: false });
    const halo = new LineMaterial({ color: 0xf4f4f0, linewidth: 7, depthWrite: false });
    const lineMats = [ink, halo];
    const rim = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.FrontSide });
    /* The visor is the one glossy piece: deep red with a tight specular streak from two lights that only it can see. */
    const visorMat = new THREE.MeshPhongMaterial({ color: 0xab0900, specular: 0xffffff, shininess: 90, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(1.5, 1.8, 2.5); scene.add(key);
    const kicker = new THREE.DirectionalLight(0xffffff, 0.8); kicker.position.set(-2, -1, 1.5); scene.add(kicker);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('assets/helmet/helmet.glb', async (gltf) => {
      const model = gltf.scene;
      const meshes = [];
      model.traverse((o) => { if (o.isMesh) meshes.push(o); });
      const drop = [], kept = [];
      for (const o of meshes) {
        const n = o.material.name;
        if (HIDE.has(n)) { drop.push(o); continue; }
        kept.push(o);
        o.material = n === VISOR ? visorMat : fill;
        await tick(); // one mesh per slice: the page stays responsive while the line art is built
        const eg = new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(o.geometry, 24));
        const lb = new LineSegments2(eg, halo); lb.renderOrder = 1; o.add(lb);
        const lw = new LineSegments2(eg, ink); lw.renderOrder = 2; o.add(lw);
        if (n === SHELL) {
          const sb = new THREE.Mesh(o.geometry, rim);
          sb.scale.setScalar(1.034);
          o.add(sb);
        }
      }
      drop.forEach((o) => o.parent && o.parent.remove(o));
      pivot.add(model);
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      R = Math.max(size.x, size.y, size.z);
      camera.near = R / 100; camera.far = R * 50;
      camera.position.set(R * .7, R * .22, R * 1.95); camera.lookAt(0, 0, 0);
      W = H = 0;
      await tick();
      try { renderer.compile(scene, camera); } catch (e) {}
      await tick();
      api.ready = true;
      dispatchEvent(new Event('aidhelmet'));
    }, undefined, (e) => { console.warn('helmet failed', e && e.stack || e); });

    api.setSize = (w, h) => {
      if (w === W && h === H) return;
      W = w; H = h; renderer.setSize(w, h, false);
      lineMats.forEach((m) => m.resolution.set(w, h));
      fitBg(w, h);
      const a = w / h, hh = R * .58 * (a < 1 ? 1 / Math.max(a, .6) : 1);
      camera.top = hh; camera.bottom = -hh; camera.left = -hh * a; camera.right = hh * a;
      if (a >= 1) camera.setViewOffset(w, h, -w * .15, 0, w, h); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
    api.render = (rot) => {
      if (!api.ready) return;
      pivot.rotation.set(0, rot, -.16);
      renderer.render(scene, camera);
    };
  } catch (e) { window.AIDHelmet = null; console.warn('helmet unavailable', e); } };
  if (window.aidAfterLift) window.aidAfterLift(start); else setTimeout(start, 1200);
}
