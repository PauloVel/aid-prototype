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
    renderer.toneMappingExposure = .95;
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    api.canvas = renderer.domElement;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 10);

    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x030304, side: THREE.BackSide })));
    [[7, 4.5, -3.2, 4.2, 2.6, 22]].forEach(([w, h, x, y, z, i]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(i), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    });
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(env, 0.02).texture;

    const pivot = new THREE.Group(); scene.add(pivot);
    const planeFinal = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);   // keeps y <= c (painted)
    const planeClay = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);     // keeps y >= c (raw)
    let minY = -1, maxY = 1, R = 1, W = 2, H = 1, clayRoot = null;
    const finalMeshes = [];

    /* AID livery: the model's sponsor layers and lettering pieces are removed; the clean shell is repainted in AID's own design. */
    const HIDE = new Set(['mat_2', 'mat_3', 'mat_4', 'mat_5', 'mat_6', 'mat_7', 'mat_9', 'mat_11', 'mat_12', 'mat_13', 'mat_14', 'material_0']);
    const SHELL = 'mat_0', LINER = '__none__';
    const visCanvas = document.createElement('canvas'); visCanvas.width = 1600; visCanvas.height = 600;
    const visTex = new THREE.CanvasTexture(visCanvas); visTex.colorSpace = THREE.SRGBColorSpace; visTex.anisotropy = 8;
    const drawVis = () => {
      const g = visCanvas.getContext('2d'); g.clearRect(0, 0, 1600, 600);
      g.fillStyle = '#f6f6f4'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '400 720px Anton, Impact, "Arial Narrow", sans-serif';
      const w = g.measureText('AID').width, sx = 1500 / Math.max(w, 1);
      g.save(); g.translate(800, 336); g.scale(sx, 1); g.fillText('AID', 0, 0); g.restore();
      visTex.needsUpdate = true;
    };
    drawVis();
    if (document.fonts && document.fonts.load) document.fonts.load('400 470px Anton').then(drawVis).catch(() => {});
    const decal = { uRot: { value: 0 }, uVis: { value: visTex } };
    const shell = new THREE.MeshPhysicalMaterial({ name: 'AID_shell', color: 0x5c0710, roughness: .4, metalness: 0, clearcoat: .6, clearcoatRoughness: .08, envMapIntensity: 1.2, side: THREE.DoubleSide });
    const NL = String.fromCharCode(10);
    const VDEF = ['uniform float uRot;', 'varying vec3 vHP;', 'varying vec3 vHN;',
      'vec3 rotYn(vec3 v,float a){float c=cos(a),s=sin(a);return vec3(c*v.x-s*v.z,v.y,s*v.x+c*v.z);}'].join(NL);
    const VSET = ['vHP=rotYn((modelMatrix*vec4(transformed,1.)).xyz,uRot);', 'vHN=rotYn(mat3(modelMatrix)*objectNormal,uRot);'].join(NL);
    const FDEF = ['varying vec3 vHP;', 'varying vec3 vHN;', 'float gH; float gM;',
      'float sm(float d,float r){return 1.-smoothstep(r-.035,r+.035,d);}',
      'float wv(vec2 p){vec2 c=floor(p),f=fract(p);float a=mod(c.x-c.y,4.)<2.?1.:0.;float hh=a>.5?.5+.5*sin(f.x*3.1416):.5+.5*sin(f.y*3.1416);return hh*(.88+.12*sin((a>.5?f.y:f.x)*40.));}'].join(NL);
    const FSET = [
      'vec3 hn=-normalize(vHN);',
      'vec3 pw=pow(abs(hn),vec3(4.));pw/=(pw.x+pw.y+pw.z);',
      'float S=1./0.0016;',
      'float wvv=pw.x*wv(vHP.zy*S)+pw.y*wv(vHP.xz*S)+pw.z*wv(vHP.xy*S);',
      'float zt=step(abs(vHP.x),.0105)*step(vHP.z,.006)*step(-.022,vHP.z)*step(.012,vHP.y)*step(.5,hn.y);',
      'float hm=zt*sm(abs(fract(vHP.x/.0032+.5)-.5),.15)*sm(abs(fract(vHP.z/.0090+.5)-.5),.30);',
      'float zr=step(abs(vHP.x),.016)*step(vHP.z,-.027)*step(-.013,vHP.y)*step(vHP.y,.011)*step(.45,-hn.z);',
      'hm=max(hm,zr*sm(abs(fract(vHP.y/.0036+.5)-.5),.17));',
      'float zc=step(abs(vHP.x),.013)*step(.02,vHP.z)*step(-.025,vHP.y)*step(vHP.y,-.013)*step(.45,hn.z);',
      'vec2 cp=vec2(vHP.x/.0026+step(.5,fract(vHP.y/.0052))*.5,vHP.y/.0026);',
      'hm=max(hm,zc*sm(length(fract(cp)-.5),.3));',
      'float sg=(1.-smoothstep(.00025,.0008,abs(vHP.y+.0145)))*step(hn.y,.6);',
      'gH=wvv*.00012-hm*.0009-sg*.0004;gM=clamp(hm+sg,0.,1.);',
      'diffuseColor.rgb*=(.72+.28*wvv)*(1.-.94*hm)*(1.-.75*sg);'].join(NL);
    const FNORM = '{vec3 dpx=dFdx(-vViewPosition),dpy=dFdy(-vViewPosition);float hx=dFdx(gH),hy=dFdy(gH);vec3 r1=cross(dpy,normal),r2=cross(normal,dpx);float det=dot(dpx,r1);vec3 gr=sign(det)*(hx*r1+hy*r2);normal=normalize(abs(det)*normal-gr);}';
    shell.onBeforeCompile = (sh) => {
      sh.uniforms.uRot = decal.uRot;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>' + NL + VDEF)
        .replace('#include <begin_vertex>', '#include <begin_vertex>' + NL + VSET);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>' + NL + FDEF)
        .replace('#include <color_fragment>', '#include <color_fragment>' + NL + FSET)
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>' + NL + FNORM)
        .replace('#include <clearcoat_normal_fragment_maps>', '#include <clearcoat_normal_fragment_maps>' + NL + 'clearcoatNormal = normalize(mix(clearcoatNormal, normal, clamp(gM * 3., 0., 1.)));');
    };
    shell.customProgramCacheKey = () => 'aid-shell';
    const visor = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: .16, clearcoat: .8, clearcoatRoughness: .06, envMapIntensity: .9, side: THREE.DoubleSide });
    const VFDEF = ['uniform sampler2D uVis;', 'varying vec3 vHP;', 'varying vec3 vHN;'].join(NL);
    const VFSET = [
      'vec2 vu=vec2(atan(vHP.x,vHP.z)/1.15+.5,vHP.y/0.021+.5);',
      'vec4 vt=texture2D(uVis,vu);',
      'float vf=step(0.,vHP.z)*step(0.,vu.x)*step(vu.x,1.)*step(0.,vu.y)*step(vu.y,1.);',
      'diffuseColor.rgb=mix(diffuseColor.rgb,vt.rgb,vt.a*vf);'].join(NL);
    visor.onBeforeCompile = (sh) => {
      sh.uniforms.uRot = decal.uRot; sh.uniforms.uVis = decal.uVis;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>' + NL + VDEF)
        .replace('#include <begin_vertex>', '#include <begin_vertex>' + NL + VSET);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>' + NL + VFDEF)
        .replace('#include <color_fragment>', '#include <color_fragment>' + NL + VFSET)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>' + NL + 'totalEmissiveRadiance += vt.rgb * vt.a * vf * .3;');
    };
    visor.customProgramCacheKey = () => 'aid-visor';
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
        o.castShadow = true; o.receiveShadow = true; finalMeshes.push(o);
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
      clayRoot = new THREE.Group(); pivot.add(clayRoot);
      clones.forEach(([o, c]) => { c.matrix.copy(o.matrixWorld); c.matrixWorldNeedsUpdate = true; clayRoot.add(c); });
      clayRoot.matrixAutoUpdate = false;
      R = Math.max(size.x, size.y, size.z);
      minY = -size.y / 2 - R * .02; maxY = size.y / 2 + R * .02;
      camera.near = R / 100; camera.far = R * 50;
      camera.position.set(R * .7, R * .22, R * 1.95); camera.lookAt(0, 0, 0);
      const key = new THREE.DirectionalLight(0xffffff, 7);
      key.position.set(-R * 1.5, R * 2.3, R * 1.7); key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -R * 1.4; key.shadow.camera.right = R * 1.4;
      key.shadow.camera.top = R * 1.4; key.shadow.camera.bottom = -R * 1.4; key.shadow.camera.near = R * .2; key.shadow.camera.far = R * 8;
      key.shadow.bias = -0.0004; key.shadow.normalBias = R * .004;
      scene.add(key);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(R * 8, R * 8), new THREE.ShadowMaterial({ opacity: .8 }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -size.y / 2 - R * .035; ground.receiveShadow = true; scene.add(ground);
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
      clayRoot.visible = paint < .995;
      const fv = paint > .004; for (let i = 0; i < finalMeshes.length; i++) finalMeshes[i].visible = fv;
      renderer.render(scene, camera);
    };
  } catch (e) { window.AIDHelmet = null; console.warn('helmet unavailable', e); }
}
