"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Work } from "@/data/projects";

/**
 * 旋风视图：所有封面绕一根隐形的轴螺旋悬浮，滚轮/拖拽 → 整条螺旋上下流转。
 *
 * 设计要点（对着参考视频调的）：
 * - 卡片大、曲率强（曲率半径 < 螺旋半径），像贴在细柱上的一块块弧面屏
 * - 单条螺旋臂，纵向留大空档，不做「铺满柱面的墙」
 * - 每张卡有自己的轻摆与滚转，整体像悬浮而不是焊死
 * - 转离正面的卡变暗 + 轻微失焦；转到背面时 DoubleSide 自动呈镜像背面
 * - 滚轮给冲量，松手继续滑行，停手后磁吸回整槽位（构图中心永远有卡）
 */
const CFG = {
  cardW: 458,
  cardH: 258,
  segX: 56,

  // 球面内视角：相机站在球心，卡片贴在半径 radius 的球面上。
  // 以前的「等角度绕柱」在透视下靠边的卡片会被压扁到正面卡的一半宽，
  // 间距和卡宽不同步收缩 → 左右间隔一长一短。这里改成
  // 「屏幕坐标等距 + 反推世界坐标」，间距才是真的恒定。
  radius: 1000,
  curveScale: 1, // 曲率半径 = radius，卡片贴着球面弯

  cardsPerTurn: 5, // 一圈 5 张，屏幕上正好看到 3 张完整 + 两侧各半张
  slots: 105, // 必须是 cardsPerTurn 的整数倍

  // 全部按视口宽度取比例，换分辨率/竖屏都不用重调
  cardSizePx: 0.28, // 卡片屏幕宽 / 视口宽
  gapPx: 0.012, // 相邻卡屏幕缝隙 / 卡片宽（5% 左右，几乎相接才算「连成一条」）
  rowStepPx: 0.38, // 相邻槽位垂直位移 / 卡片高（一圈 = rowStep × cardsPerTurn）

  fov: 51,
  camY: 0,
  depthBend: 0.1, // 边缘卡片往远推的比例，给球面纵深；0 = 完全平铺

  face: 0.28, // 侧向收拢系数：0 = 完全正对镜头（缝最匀），1 = 完全贴球面
  dimEdge: 0.1, // 最边上卡片的亮度（被屏幕切一半的那列要暗下去，不然很吵）
  blurEdge: 1.1,

  // 每张卡自己的歪斜量：保持很小，密排时一点歪斜就显乱
  rollAmt: 0.012,
  yawAmt: 0.008,

  wheel: 0.0055,
  ease: 9.5,
  fling: 1.7,
  friction: 2.8,
  snapDelay: 0.7,
};

const TAU = Math.PI * 2;

/** 调试用：?cw=0.3&gap=0.135&step=0.3&turn=6&fov=51&bend=0.1&r=1000 */
function readOverrides(): typeof CFG {
  if (typeof window === "undefined") return CFG;
  const q = new URLSearchParams(window.location.search);
  const n = (k: string, d: number) => {
    const v = q.get(k);
    return v !== null && v !== "" && !Number.isNaN(+v) ? +v : d;
  };
  return {
    ...CFG,
    radius: n("r", CFG.radius),
    camY: n("camY", CFG.camY),
    fov: n("fov", CFG.fov),
    cardsPerTurn: n("turn", CFG.cardsPerTurn),
    slots: n("slots", CFG.slots),
    curveScale: n("curve", CFG.curveScale),
    cardSizePx: n("cw", CFG.cardSizePx),
    gapPx: n("gap", CFG.gapPx),
    rowStepPx: n("step", CFG.rowStepPx),
    depthBend: n("bend", CFG.depthBend),
    dimEdge: n("dim", CFG.dimEdge),
    blurEdge: n("blur", CFG.blurEdge),
    face: n("face", CFG.face),
    rollAmt: n("roll", CFG.rollAmt),
    yawAmt: n("yaw", CFG.yawAmt),
  } as typeof CFG;
}

function curvedGeometry(w: number, h: number, seg: number, r: number) {
  const g = new THREE.PlaneGeometry(w, h, seg, 1);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const th = x / r;
    pos.setX(i, r * Math.sin(th));
    pos.setZ(i, r * Math.cos(th) - r); // 中间离镜头最近，两侧向内收
  }
  g.computeVertexNormals();
  return g;
}

export default function WhirlwindWall({ works }: { works: Work[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<Work | null>(null);
  const activeRef = useRef<Work | null>(null);
  activeRef.current = active;

  const [hint, setHint] = useState(true);

  /* ------------------------------ 场景 ------------------------------ */
  useEffect(() => {
    const host = hostRef.current;
    const C = readOverrides();
    if (!host) return;

    const scene = new THREE.Scene();
    // 相机在球心，所有卡片的距离都是 radius，雾只用来压一点点远端
    scene.fog = new THREE.Fog(0x050505, C.radius * 1.25, C.radius * 2.4);

    const camera = new THREE.PerspectiveCamera(
      C.fov,
      host.clientWidth / host.clientHeight,
      10,
      8000
    );
    const portrait = host.clientWidth / host.clientHeight < 0.95;
    const camYBase = C.camY;
    camera.position.set(0, camYBase, 0);
    // 朝 -z 看，卡片全部摆在 z = -radius 附近
    camera.lookAt(0, camYBase, -C.radius);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x050505, 1);
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    /* ---------------------------- 卡片 ---------------------------- */
    const geometry = curvedGeometry(
      C.cardW,
      C.cardH,
      C.segX,
      C.radius * C.curveScale
    );

    const loader = new THREE.TextureLoader();
    const textures = works.map((w) => {
      const t = loader.load(w.posterSm || w.poster);
      t.colorSpace = THREE.SRGBColorSpace;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      return t;
    });

    type Card = {
      mesh: THREE.Mesh;
      mat: THREE.MeshBasicMaterial;
      shader: { uniforms: Record<string, { value: number }> } | null;
      work: Work;
      tilt: number;
      yaw: number;
      hover: number;
    };

    const cards: Card[] = [];
    const hoverTarget = { index: -1 };

    for (let i = 0; i < C.slots; i++) {
      // 作品按固定节拍轮转：同一支每隔 16 个槽位出现一次，
      // 间隔恒定。原来那套哈希打散会让同一支忽近忽远。
      const k = i % works.length;
      const work = works[k];
      const mat = new THREE.MeshBasicMaterial({
        map: textures[k],
        side: THREE.DoubleSide,
        toneMapped: false,
        fog: true,
      });

      const card: Card = {
        mesh: null as unknown as THREE.Mesh,
        mat,
        shader: null,
        work,
        // 歪斜量做得很小：密排时只要一点随机歪，整条弧带就会显乱
        tilt: (Math.random() - 0.5) * C.rollAmt,
        yaw: (Math.random() - 0.5) * C.yawAmt,
        hover: 0,
      };

      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uDim = { value: 1 };
        shader.uniforms.uBlur = { value: 0 };
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            "#include <common>\nuniform float uDim;\nuniform float uBlur;"
          )
          .replace(
            "#include <map_fragment>",
            `
            vec4 texel = texture2D( map, vMapUv, uBlur );
            diffuseColor *= texel;
            diffuseColor.rgb *= uDim;
            `
          );
        card.shader = shader as unknown as Card["shader"];
      };

      const mesh = new THREE.Mesh(geometry, mat);
      mesh.userData.index = i;
      card.mesh = mesh;
      cards.push(card);
      group.add(mesh);
    }

    /* -------------------------- 滚动状态 -------------------------- */
    let s = 0;
    let sTarget = 0;
    let vel = 0;
    let speed = 0;
    let lastScroll = -9999;
    let hovering = -1;
    let dragging = false;
    let dragMoved = 0;
    let lastX = 0;
    let lastY = 0;
    const pointer = new THREE.Vector2(-10, -10);

    /* ---------------- 布局：屏幕坐标量出来，再反推世界坐标 ----------------
     * 先把「每张卡在屏幕上的中心位置」定死（严格等距），再反算它在 3D 里该站哪。
     * 这样不管透视怎么压，左右缝永远是同一个值。
     */
    const N = Math.max(2, Math.round(C.cardsPerTurn)); // 一圈几张
    const R = C.radius;

    type Layout = {
      w: number; h: number; // 视口
      fpx: number; // 焦距（像素）
      cardPx: number; // 卡片屏幕宽
      pitch: number; // 相邻卡屏幕中心距
      yStep: number; // 相邻槽位屏幕垂直位移
      scale: number; // 网格缩放（世界 → 屏幕）
    };

    function layout(): Layout {
      const w = host!.clientWidth;
      const h = host!.clientHeight;
      const fpx = h / 2 / Math.tan((C.fov * Math.PI) / 360);
      // 竖屏横向窄，卡片相对放大一点，一行大概 2.3 张
      const cardPx = w * C.cardSizePx * (portrait ? 1.6 : 1);
      const pitch = cardPx * (1 + C.gapPx);
      // 竖屏行数太多会糊成“卡片墙”，行距单独拉开
      const yStep = ((cardPx * C.cardH) / C.cardW) * C.rowStepPx * (portrait ? 1.32 : 1);
      const scale = (cardPx * R) / (C.cardW * fpx);
      return { w, h, fpx, cardPx, pitch, yStep, scale };
    }

    let L = layout();

    /** slot → 屏幕坐标（像素，原点在视口中心，y 向下） */
    function slotToScreen(slot: number) {
      const u = slot % N; // 这一圈里的第几张
      const cyc = Math.floor(slot / N); // 第几圈
      const rows = Math.max(1, Math.round(C.slots / N));
      const tx = (u - (N - 1) / 2) * L.pitch;
      // 竖直方向也居中：cyc 从 0..rows-1 平移成 ±rows/2
      const ty =
        -((cyc - (rows - 1) / 2) * N + (u - (N - 1) / 2)) * L.yStep;
      return { u, cyc, tx, ty };
    }

    const raycaster = new THREE.Raycaster();
    const meshes = cards.map((c) => c.mesh);

    function pick(clientX: number, clientY: number) {
      const rect = host!.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(meshes, false);
      for (const hit of hits) {
        const i = hit.object.userData.index as number;
        // 只挑朝向镜头那一侧（卡片法线偏角 < 60°）
        const p = hit.object.position;
        if (p.z > -R * 0.35) return i;
      }
      return -1;
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const d = e.deltaY * C.wheel;
      sTarget += d;
      vel = THREE.MathUtils.clamp(vel + d * C.fling, -12, 12);
      lastScroll = performance.now();
      setHint(false);
    }

    function onPointerDown(e: PointerEvent) {
      dragging = true;
      dragMoved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
    }

    function onPointerMove(e: PointerEvent) {
      const i = pick(e.clientX, e.clientY);
      hovering = i;
      hoverTarget.index = i;
      host!.style.cursor = i >= 0 ? "pointer" : "default";

      if (!dragging) return;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      dragMoved += Math.abs(dy);
      const d = -dy * 0.012;
      sTarget += d;
      vel = THREE.MathUtils.clamp(vel + d * C.fling, -12, 12);
      lastScroll = performance.now();
      setHint(false);
    }

    function onPointerUp(e: PointerEvent) {
      const wasDrag = dragMoved > 6;
      dragging = false;
      if (wasDrag) return;
      const i = pick(e.clientX, e.clientY);
      if (i >= 0) setActive(cards[i].work);
    }

    function onResize() {
      const w = host!.clientWidth;
      const h = host!.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      camera.position.set(0, camYBase, 0);
      camera.lookAt(0, camYBase, -C.radius);
      L = layout();
    }

    // 自测钩子：纹理加载状态（排查「卡片黑块」用）
    (window as unknown as Record<string, unknown>).__swTex = () =>
      textures.map((t, i) => (t.image ? i + ":ok" : i + ":pending")).join(" ");

    // 自测钩子：各卡投影后的真实屏幕包围盒（量「间隔是否均匀」用）
    (window as unknown as Record<string, unknown>).__swGeom = () => {
      const rect = host!.getBoundingClientRect();
      const out: {
        slot: number; x0: number; x1: number; y0: number; y1: number;
        cx: number; cy: number; w: number; h: number; t: string;
      }[] = [];
      const v = new THREE.Vector3();
      for (const c of cards) {
        const pos = c.mesh.geometry.attributes.position;
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (let k = 0; k < pos.count; k++) {
          v.fromBufferAttribute(pos, k);
          c.mesh.localToWorld(v);
          v.project(camera);
          const sx = (v.x * 0.5 + 0.5) * rect.width;
          const sy = (-v.y * 0.5 + 0.5) * rect.height;
          if (sx < x0) x0 = sx;
          if (sx > x1) x1 = sx;
          if (sy < y0) y0 = sy;
          if (sy > y1) y1 = sy;
        }
        if (x1 < -rect.width * 0.2 || x0 > rect.width * 1.2) continue;
        if (y1 < 0 || y0 > rect.height) continue;
        out.push({
          slot: (((cards.indexOf(c) - s) % C.slots) + C.slots) % C.slots,
          x0: Math.round(x0), x1: Math.round(x1),
          y0: Math.round(y0), y1: Math.round(y1),
          cx: Math.round((x0 + x1) / 2), cy: Math.round((y0 + y1) / 2),
          w: Math.round(x1 - x0), h: Math.round(y1 - y0),
          t: c.work.title.slice(0, 8),
        });
      }
      return out.sort((a, b) => a.cy - b.cy);
    };

    // 自测钩子：正前方那张卡的屏幕坐标（无头测试用来找可点位置）
    (window as unknown as Record<string, unknown>).__swFront = () => {
      // 取「投影后离屏幕中心最近」的那张：同一角度有多层，只有一张在画面里
      let best: { x: number; y: number; title: string } | null = null;
      let bestD = Infinity;
      const rect = host!.getBoundingClientRect();
      for (const c of cards) {
        const v = c.mesh.position.clone().project(camera);
        if (Math.abs(v.x) > 0.9 || Math.abs(v.y) > 0.85) continue;
        const d = Math.hypot(v.x, v.y);
        if (d < bestD) {
          bestD = d;
          best = {
            x: Math.round((v.x * 0.5 + 0.5) * rect.width + rect.left),
            y: Math.round((-v.y * 0.5 + 0.5) * rect.height + rect.top),
            title: c.work.title,
          };
        }
      }
      return best;
    };

    host.addEventListener("wheel", onWheel, { passive: false });
    host.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", onResize);

    /* --------------------------- 渲染循环 --------------------------- */
    let raf = 0;
    let prev = performance.now();
    let fade = 0;

    function frame(now: number) {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      const stopped =
        !dragging &&
        Math.abs(vel) < 0.05 &&
        (now - lastScroll) / 1000 > C.snapDelay &&
        hoverTarget.index < 0;
      if (stopped) sTarget = Math.round(sTarget);

      if (!dragging) {
        sTarget += vel * dt;
        vel *= Math.exp(-dt * C.friction);
        if (Math.abs(vel) < 0.02) vel = 0;
      }

      const before = s;
      s += (sTarget - s) * Math.min(1, dt * C.ease);
      const inst = Math.abs(s - before) / Math.max(dt, 0.0001);
      speed += (inst - speed) * Math.min(1, dt * 7);

      const fast = Math.max(speed - 1, 0);
      const speedBlur = Math.min(fast * 0.5, 2.6);

      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const slot = (((i - s) % C.slots) + C.slots) % C.slots;
        const { u, tx, ty } = slotToScreen(slot);

        const tt = now * 0.001;
        const ph = u * 0.9;

        // 屏幕坐标（像素，原点视口中心）
        const sx = tx;
        const sy = ty + Math.sin(tt * 0.7 + ph) * 3;

        // 边缘卡片往远推一点，球面才有纵深；同时把屏幕坐标反推成世界坐标
        const k = Math.min(1, Math.abs(sx) / (L.w * 0.5));
        const depth = R * (1 + C.depthBend * k * k) - (i === hovering ? R * 0.06 : 0);

        c.mesh.position.set(
          (sx * depth) / L.fpx,
          camYBase - (sy * depth) / L.fpx,
          -depth
        );
        // 朝球心（=镜头）微收。系数刻意压小：完全贴球面的话，
        // 侧向卡片的两端一近一远，投影会被透视拉宽 20%+，缝就忽宽忽窄了。
        const yawToCenter = Math.atan2(sx, L.fpx) * C.face; // face: 0 = 全正对镜头
        c.mesh.rotation.set(
          Math.sin(tt * 0.4 + ph) * 0.004,
          -yawToCenter + c.yaw + Math.sin(tt * 0.45 + ph) * 0.006,
          c.tilt + Math.sin(tt * 0.33 + ph) * 0.008
        );

        const targetHover = i === hovering ? 1 : 0;
        c.hover += (targetHover - c.hover) * Math.min(1, dt * 8);

        // 封面还没到就别画：未绑定的贴图会渲染成纯黑方块，比“没这张卡”难看得多
        c.mesh.visible = !!c.mat.map?.image;

        if (c.shader) {
          const edge = THREE.MathUtils.smoothstep(k, 0.42, 1.05);
          c.shader.uniforms.uDim.value =
            (1 - edge * (1 - C.dimEdge)) * (1 + c.hover * 0.1);
          c.shader.uniforms.uBlur.value = edge * C.blurEdge + speedBlur;
        }
        // 屏幕宽 = cardW × scale × fpx / depth，要它恒定就得 scale ∝ depth
        c.mesh.scale.setScalar(L.scale * (depth / R) * (1 + c.hover * 0.05));
      }

      if (fade < 1) {
        fade = Math.min(1, fade + dt * 1.2);
        host!.style.opacity = String(0.2 + fade * 0.8);
        if (fade >= 1) setReady(true);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    /* ---------------------------- 辅助 ---------------------------- */
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("sw-lock", "sw-page");

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("wheel", onWheel);
      host.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("sw-lock", "sw-page");
      geometry.dispose();
      textures.forEach((t) => t.dispose());
      cards.forEach((c) => c.mat.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [works]);

  return (
    <div className="sw">
      <div className="sw__canvas" ref={hostRef} />

      <div className="sw__bar">
        <a
          className="sw__back"
          href="/#projects"
          onClick={(e) => {
            e.preventDefault();
            const sameOrigin =
              document.referrer !== "" && document.referrer.startsWith(window.location.origin);
            if (sameOrigin) window.history.back();
            else window.location.href = "/#projects";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          返回作品集
        </a>
        <a className="sw__list" href="/#projects">
          列表视图
        </a>
      </div>

      <div className={`sw__hint${hint ? "" : " is-hidden"}`}>
        <span className="u-mono">滚动 / 拖动 · 点击封面播放</span>
      </div>

      {!ready ? <div className="sw__veil" /> : null}

      {active ? (
        <div className="sw__player" role="dialog" aria-modal="true">
          <button
            type="button"
            className="sw__close"
            onClick={() => setActive(null)}
            aria-label="关闭"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="sw__stage">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              key={active.id}
              src={active.video}
              poster={active.poster}
              controls
              autoPlay
              playsInline
            />
          </div>
          <div className="sw__meta">
            <span className="u-mono">{active.no} · {active.date}</span>
            <h2>{active.title}</h2>
            <p>{active.role}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
