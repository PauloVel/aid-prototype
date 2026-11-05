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

    /* AID livery: the model's sponsor layers and lettering pieces are removed; the clean shell is repainted in AID's own design. */
    const HIDE = new Set(['mat_2', 'mat_3', 'mat_4', 'mat_5', 'mat_6', 'mat_7', 'mat_9', 'mat_11', 'mat_12', 'mat_13', 'mat_14', 'material_0']);
    const SHELL = 'mat_0', LINER = '__none__';
    const aidCanvas = document.createElement('canvas'); aidCanvas.width = 1024; aidCanvas.height = 512;
    const aidTex = new THREE.CanvasTexture(aidCanvas); aidTex.colorSpace = THREE.SRGBColorSpace; aidTex.anisotropy = 8;
    const drawAid = () => {
      const g = aidCanvas.getContext('2d'); g.clearRect(0, 0, 1024, 512);
      g.fillStyle = '#f4f4f2'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '400 470px Anton, Impact, "Arial Narrow", sans-serif';
      g.fillText('AID', 512, 268);
      aidTex.needsUpdate = true;
    };
    drawAid();
    if (document.fonts && document.fonts.load) document.fonts.load('400 470px Anton').then(drawAid).catch(() => {});
    const decal = { uRot: { value: 0 }, uAid: { value: aidTex } };
    const shell = new THREE.MeshPhysicalMaterial({ name: 'AID_shell', color: 0x0a0a0b, roughness: .5, metalness: 0, clearcoat: .7, clearcoatRoughness: .12, envMapIntensity: .8, side: THREE.DoubleSide });
    const NL = String.fromCharCode(10);
    const VDEF = ['uniform float uRot;', 'varying vec3 vHP;', 'varying vec3 vHN;',
      'vec3 rotYn(vec3 v,float a){float c=cos(a),s=sin(a);return vec3(c*v.x-s*v.z,v.y,s*v.x+c*v.z);}'].join(NL);
    const VSET = ['vHP=rotYn((modelMatrix*vec4(transformed,1.)).xyz,uRot);', 'vHN=rotYn(mat3(modelMatrix)*objectNormal,uRot);'].join(NL);
    const FDEF = ['uniform sampler2D uAid;', 'varying vec3 vHP;', 'varying vec3 vHN;'].join(NL);
    const FSET = [
      'vec3 hn=-normalize(vHN);',
      'float sd=step(.55,abs(hn.x));',
      'vec2 du=vec2((vHP.z+0.013)/0.044+.5,(vHP.y+0.004)/0.022+.5);',
      'du.x=hn.x<0.?du.x:1.-du.x;',
      'vec4 dt=texture2D(uAid,du);',
      'float inb=step(0.,du.x)*step(du.x,1.)*step(0.,du.y)*step(du.y,1.);',
      'diffuseColor.rgb=mix(diffuseColor.rgb,dt.rgb,dt.a*sd*inb);',
      'float st=step(.3,hn.y)*(1.-step(.003,abs(vHP.x)));',
      'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.72,.008,.008),st);'].join(NL);
    shell.onBeforeCompile = (sh) => {
      sh.uniforms.uRot = decal.uRot; sh.uniforms.uAid = decal.uAid;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>' + NL + VDEF)
        .replace('#include <begin_vertex>', '#include <begin_vertex>' + NL + VSET);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>' + NL + FDEF)
        .replace('#include <color_fragment>', '#include <color_fragment>' + NL + FSET);
    };
    shell.customProgramCacheKey = () => 'aid-shell';
    const visor = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: .02, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.2, side: THREE.DoubleSide });
    const black = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: .5, roughness: .3, side: THREE.DoubleSide });
    const liner = new THREE.MeshStandardMaterial({ name: 'AID_liner', color: 0x111112, roughness: .95, side: THREE.DoubleSide });
    const clay = new THREE.MeshStandardMaterial({ color: 0xc4c4be, roughness: .92, metalness: 0, envMapIntensity: .6, side: THREE.DoubleSide });
    clay.clippingPlanes = [planeClay];
    api.setRot = (r) => { decal.uRot.value = r; };

    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(CONFIG.model, (gltf) => {
      const model = gltf.scene;
      const finals = new Set(), clones = [], drop = [];
      model.traverse((o) => {
        if (!o.isMesh) return;
        const n = o.material.name;
        if (HIDE.has(n)) { drop.push(o); return; }
        if (n === SHELL) o.material = shell;
        else if (n === LINER) o.material = liner;
        else if (n === CONFIG.visorMaterial) o.material = visor;
        else if (CONFIG.grayMaterials.includes(n)) o.material = black;
        finals.add(o.material);
        const c = new THREE.Mesh(o.geometry, clay);
        c.matrixAutoUpdate = false; c.matrix.copy(o.matrixWorld); clones.push([o, c]);
      });
      drop.forEach((o) => o.parent && o.parent.remove(o));
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
      pivot.rotation.y = rot; api.setRot(rot);
      const c = minY + (maxY - minY) * paint;
      planeFinal.constant = c; planeClay.constant = -c;
      renderer.render(scene, camera);
    };
  } catch (e) { window.AIDHelmet = null; console.warn('helmet unavailable', e); }
}
