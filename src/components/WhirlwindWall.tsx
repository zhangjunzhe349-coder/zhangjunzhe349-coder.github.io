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
  cardW: 470,
  cardH: 264,
  segX: 48,

  radius: 860,
  curveScale: 1.2, // 曲率半径 = radius × 该系数（>1 弧面更舒展）
  cardsPerTurn: 11,
  slots: 88, // 必须是 cardsPerTurn 的整数倍
  yStep: 145,

  // 斜上方视角：近处大、远处小，螺旋读作一圈立体环（对着参考图调的）
  camZ: 2180,
  camY: 650,
  lookY: -60,
  fov: 41,
  groupTilt: 0,

  backDim: 0.5, // 0.22 时后半圈只剩 10% 亮度，在黑背景上等于「空出来一段」
  backBlur: 2.4,
  dimStart: 0.55,
  dimEnd: 2.7,

  // 雾原本写死 2100→3800，而相机在 z=2180、卡片圆半径 860：
  // 后半圈卡片距离 3040，雾占比 55%，再乘 backDim 0.22 只剩 10% 亮度，
  // 在 #050505 背景上就是一块纯黑 —— 屏幕上那些「空出来一段」就是它。
  // 现在推到圆外，让可见度只由 backDim 控制。
  fogNear: 3400,
  fogFar: 8000,

  wheel: 0.0055,
  ease: 9.5,
  fling: 1.7,
  friction: 2.8,
  snapDelay: 0.7,
};

const TAU = Math.PI * 2;

/** 调试用：?r=900&camY=1200&camZ=2200&fov=38&lookY=0&yStep=190&turn=10&curve=1.35&cw=460 */
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
    camZ: n("camZ", CFG.camZ),
    fov: n("fov", CFG.fov),
    lookY: n("lookY", CFG.lookY),
    yStep: n("yStep", CFG.yStep),
    cardsPerTurn: n("turn", CFG.cardsPerTurn),
    slots: n("slots", CFG.slots),
    curveScale: n("curve", CFG.curveScale),
    cardW: n("cw", CFG.cardW),
    cardH: n("cw", CFG.cardW) * (9 / 16),
    backDim: n("dim", CFG.backDim),
    fogNear: n("fog", CFG.fogNear),
    fogFar: n("fogf", CFG.fogFar),
    backBlur: n("blur", CFG.backBlur),
    groupTilt: n("tilt", CFG.groupTilt),
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
    const ANGLE = (Math.PI * 2) / C.cardsPerTurn;
    if (!host) return;

    // 窄屏隐藏顶部导航：否则「关于 / 联系」会直接压在卡片上
    document.body.classList.add("sw-page");

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050505, C.fogNear, C.fogFar);

    const camera = new THREE.PerspectiveCamera(
      C.fov,
      host.clientWidth / host.clientHeight,
      10,
      8000
    );
    const portrait = host.clientWidth / host.clientHeight < 0.95;
    // 竖屏：镜头跟着收近一点，否则卡片在窄屏里缩成邮票
    const dollyBase = C.camZ * (portrait ? 1.24 : 1);
    const camYBase = C.camY * (portrait ? 0.88 : 1);
    const lookYBase = C.lookY * (portrait ? 0.66 : 1);
    camera.position.set(0, camYBase, dollyBase);
    camera.lookAt(0, lookYBase, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x050505, 1);
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.z = C.groupTilt;
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
      phase: number;
      bob: number;
      bobY: number;
      sway: number;
      roll: number;
      hover: number;
    };

    const cards: Card[] = [];
    const hoverTarget = { index: -1 };

    for (let i = 0; i < C.slots; i++) {
      // 打散作品索引：同一角度相邻的卡不要总是同一支
      // 每个槽位严格轮转一个作品：连续 16 个槽位必然覆盖全部 16 支，
      // 屏幕上同时看到的 14 张卡就是 14 支不同的片子（不会重复、不会漏掉首页精选）。
      const k = ((i % works.length) + works.length) % works.length;
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
        tilt: (Math.random() - 0.5) * 0.05,
        phase: Math.random() * TAU,
        bob: 6 + Math.random() * 14,
        bobY: 8 + Math.random() * 16,
        sway: 0.008 + Math.random() * 0.018,
        roll: (Math.random() - 0.5) * 0.16,
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

    const yMid = (C.slots / 2) * C.yStep; // 让 slot 中心那张落在 y=0

    const raycaster = new THREE.Raycaster();
    const meshes = cards.map((c) => c.mesh);

    function pick(clientX: number, clientY: number) {
      const rect = host!.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      // 只挑正面的卡，背面的卡不该能点
      const hits = raycaster.intersectObjects(meshes, false);
      for (const hit of hits) {
        const i = hit.object.userData.index as number;
        const p = hit.object.position;
        const a = Math.atan2(p.x, p.z);
        const rel = ((a % TAU) + TAU) % TAU;
        const d = Math.min(rel, TAU - rel);
        if (d < 1.15) return i;
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
      const isPortrait = w / h < 0.95;
      camera.position.z = C.camZ * (isPortrait ? 1.24 : 1);
      camera.position.y = C.camY * (isPortrait ? 0.88 : 1);
      camera.lookAt(0, C.lookY * (isPortrait ? 0.66 : 1), 0);
    }

    // 临时诊断：每张卡的屏幕位置 / 贴图状态 / 亮度系数
    (window as unknown as Record<string, unknown>).__awDiag = () => {
      const rect = host!.getBoundingClientRect();
      return cards.map((c, i) => {
        const v = c.mesh.position.clone().project(camera);
        const sx = Math.round((v.x * 0.5 + 0.5) * rect.width);
        const sy = Math.round((-v.y * 0.5 + 0.5) * rect.height);
        const d = camera.position.distanceTo(c.mesh.position);
        return {
          i,
          t: c.work.title.slice(0, 7),
          sx,
          sy,
          onScreen: Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05,
          dist: Math.round(d),
          tex: c.mat.map && (c.mat.map as THREE.Texture).image ? 'ok' : 'MISSING',
          dim: c.shader ? +(c.shader.uniforms.uDim.value as number).toFixed(2) : -1,
          vis: c.mesh.visible as boolean,
        };
      });
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
        const ang = slot * ANGLE;

        const tt = now * 0.001;
        const floatAmt = 1;
        const y =
          yMid - slot * C.yStep + Math.sin(tt * 0.7 + c.phase) * c.bobY * floatAmt;
        const r =
          C.radius +
          Math.sin(tt * 0.5 + c.phase * 1.3) * c.bob +
          (i === hovering ? 60 : 0);

        c.mesh.position.set(r * Math.sin(ang), y, r * Math.cos(ang));
        c.mesh.rotation.set(
          Math.sin(tt * 0.4 + c.phase) * 0.012,
          ang + Math.sin(tt * 0.45 + c.phase) * c.sway,
          c.tilt + c.roll + Math.sin(tt * 0.33 + c.phase) * 0.01
        );

        // 正对镜头的角度距离 → 背面变暗、失焦
        const rel = ((ang % TAU) + TAU) % TAU;
        const d = Math.min(rel, TAU - rel);
        const back = THREE.MathUtils.smoothstep(d, C.dimStart, C.dimEnd);

        const targetHover = i === hovering ? 1 : 0;
        c.hover += (targetHover - c.hover) * Math.min(1, dt * 8);

        if (c.shader) {
          c.shader.uniforms.uDim.value = (1 - back * (1 - C.backDim)) * (1 + c.hover * 0.1);
          c.shader.uniforms.uBlur.value = back * C.backBlur + speedBlur;
        }
        c.mesh.scale.setScalar(1 + c.hover * 0.06);
      }

      camera.position.z += (dollyBase + Math.min(fast * 0.5, 1) * 90 - camera.position.z) * Math.min(1, dt * 3);

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
    document.body.classList.add("sw-lock");

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("wheel", onWheel);
      host.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("sw-lock");
      document.body.classList.remove("sw-page");
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
