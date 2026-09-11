import { useEffect, useRef, useState } from "react";
import type { Material, MeshPhysicalMaterial } from "three";
import { squelch } from "../../lib/sound";
import { tick } from "../../lib/haptics";

/**
 * Трендовый сквиш «сливочное масло» (butter squish, TikTok 2026). v2:
 * — драг по маслу = мять (вмятина шейдером + брикет сплющивается целиком),
 * — драг по фону = вращение с инерцией,
 * — вид: жёлтая пачка «BUTTER» из вощёной бумаги, торцы — масло, ушки обёртки,
 *   RoomEnvironment для бликов. three грузится лениво (отдельный chunk).
 */
const SIZE = 200;

export function ButterSquish() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    void (async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import(
        "three/addons/geometries/RoundedBoxGeometry.js"
      );
      const { RoomEnvironment } = await import(
        "three/addons/environments/RoomEnvironment.js"
      );
      if (disposed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!ctx) return;

      // --- сцена, камера, свет ---
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
      camera.position.set(0, 0.35, 3.4);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(2, 3, 4);
      scene.add(key);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        context: ctx as WebGLRenderingContext,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(SIZE, SIZE, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;

      // окружение для бликов на «вощёной» бумаге
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      // --- утилиты текстур ---
      const noiseOn = (g: CanvasRenderingContext2D, w: number, h: number) => {
        for (let i = 0; i < w * 4; i++) {
          g.fillStyle = `rgba(120,90,30,${Math.random() * 0.05})`;
          g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        }
      };
      const spacedText = (
        g: CanvasRenderingContext2D,
        text: string,
        cx: number,
        y: number,
        spacing: number,
      ) => {
        const chars = [...text];
        const total =
          chars.reduce((acc, c) => acc + g.measureText(c).width, 0) +
          spacing * (chars.length - 1);
        let x = cx - total / 2;
        for (const c of chars) {
          g.fillText(c, x + g.measureText(c).width / 2, y);
          x += g.measureText(c).width + spacing;
        }
      };

      // --- этикетка «BUTTER» (перед/зад) ---
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 768;
      labelCanvas.height = 320;
      {
        const g = labelCanvas.getContext("2d");
        if (g) {
          const grad = g.createLinearGradient(0, 0, 0, 320);
          grad.addColorStop(0, "#fdeec4");
          grad.addColorStop(1, "#f7dd98");
          g.fillStyle = grad;
          g.fillRect(0, 0, 768, 320);
          // красная полоса сверху
          g.fillStyle = "#d42a2a";
          g.fillRect(0, 0, 768, 58);
          g.fillStyle = "#fff";
          g.font = "bold 30px Manrope, sans-serif";
          g.textAlign = "center";
          g.textBaseline = "middle";
          spacedText(g, "SALTED BUTTER", 384, 30, 6);
          // синяя полоса снизу
          g.fillStyle = "#1f5fd6";
          g.fillRect(0, 278, 768, 42);
          g.fillStyle = "#fff";
          g.font = "bold 24px Manrope, sans-serif";
          spacedText(g, "СЛИВОЧНОЕ · 150 г", 384, 300, 4);
          // овал-«печать» вокруг лого
          g.strokeStyle = "rgba(212,42,42,0.85)";
          g.lineWidth = 5;
          g.beginPath();
          g.ellipse(384, 176, 300, 92, 0, 0, Math.PI * 2);
          g.stroke();
          g.lineWidth = 2;
          g.beginPath();
          g.ellipse(384, 176, 286, 80, 0, 0, Math.PI * 2);
          g.stroke();
          // крупная надпись
          g.fillStyle = "#d42a2a";
          g.font = "900 118px Manrope, sans-serif";
          g.shadowColor = "rgba(140,20,20,0.35)";
          g.shadowOffsetY = 5;
          g.fillText("BUTTER", 384, 172);
          g.shadowOffsetY = 0;
          g.shadowColor = "transparent";
          // складки у краёв
          g.fillStyle = "rgba(140,100,20,0.22)";
          for (let x = 16; x < 78; x += 13) g.fillRect(x, 0, 4, 320);
          for (let x = 690; x < 752; x += 13) g.fillRect(x, 0, 4, 320);
          noiseOn(g, 768, 320);
        }
      }
      const labelTex = new THREE.CanvasTexture(labelCanvas);
      labelTex.colorSpace = THREE.SRGBColorSpace;
      labelTex.anisotropy = 4;

      // --- «вощёная бумага» (верх/низ) ---
      const paperCanvas = document.createElement("canvas");
      paperCanvas.width = 512;
      paperCanvas.height = 192;
      {
        const g = paperCanvas.getContext("2d");
        if (g) {
          const grad = g.createLinearGradient(0, 0, 0, 192);
          grad.addColorStop(0, "#fbe9b9");
          grad.addColorStop(1, "#f3dc9e");
          g.fillStyle = grad;
          g.fillRect(0, 0, 512, 192);
          // горизонтальные складки
          g.strokeStyle = "rgba(150,110,40,0.28)";
          g.lineWidth = 2;
          for (let y = 26; y < 192; y += 38) {
            g.beginPath();
            for (let x = 0; x <= 512; x += 16)
              g.lineTo(x, y + Math.sin(x / 60 + y) * 3);
            g.stroke();
          }
          // блик
          const sheen = g.createLinearGradient(0, 0, 512, 0);
          sheen.addColorStop(0, "rgba(255,255,255,0)");
          sheen.addColorStop(0.5, "rgba(255,255,255,0.18)");
          sheen.addColorStop(1, "rgba(255,255,255,0)");
          g.fillStyle = sheen;
          g.fillRect(0, 0, 512, 192);
          noiseOn(g, 512, 192);
        }
      }
      const paperTex = new THREE.CanvasTexture(paperCanvas);
      paperTex.colorSpace = THREE.SRGBColorSpace;

      // --- деформация: общий uniform для всех материалов тела ---
      const uPoint = new THREE.Uniform(new THREE.Vector3(99, 99, 99));
      const uDepth = new THREE.Uniform(0);
      const uRadius = new THREE.Uniform(0.55);

      const squishShader = (m: MeshPhysicalMaterial) => {
        m.onBeforeCompile = (shader) => {
          shader.uniforms.uSquishPoint = uPoint;
          shader.uniforms.uSquishDepth = uDepth;
          shader.uniforms.uSquishRadius = uRadius;
          // three не генерирует объявления для добавленных uniform — вставляем сами
          shader.vertexShader =
            "uniform vec3 uSquishPoint;\nuniform float uSquishDepth;\nuniform float uSquishRadius;\n" +
            shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
            {
              vec3 d = transformed - uSquishPoint;
              float f = 1.0 - smoothstep(0.0, uSquishRadius, length(d));
              transformed -= normal * uSquishDepth * f;
            }`,
          );
        };
        return m;
      };

      // --- брикет ---
      const group = new THREE.Group();
      scene.add(group);

      // RoundedBoxGeometry: группы как BoxGeometry: +x, -x, +y, -y, +z, -z
      const bodyGeo = new RoundedBoxGeometry(2.8, 1, 1, 7, 0.1);
      const butterMat = () =>
        squishShader(
          new THREE.MeshPhysicalMaterial({ color: "#f2c94c", roughness: 0.15 }),
        );
      const paperMat = () =>
        squishShader(
          new THREE.MeshPhysicalMaterial({
            map: paperTex,
            roughness: 0.4,
            clearcoat: 0.5,
            clearcoatRoughness: 0.3,
          }),
        );
      const labelMat = () =>
        squishShader(
          new THREE.MeshPhysicalMaterial({
            map: labelTex,
            roughness: 0.35,
            clearcoat: 0.5,
            clearcoatRoughness: 0.3,
          }),
        );
      const body = new THREE.Mesh(bodyGeo, [
        butterMat(), // +x торец — масло
        butterMat(), // -x торец — масло
        paperMat(), // +y верх — бумага
        paperMat(), // -y низ — бумага
        labelMat(), // +z перед — этикетка
        labelMat(), // -z зад — этикетка
      ]);
      group.add(body);

      // «ушки» обёртки сверху
      const earGeo = new RoundedBoxGeometry(2.55, 0.12, 0.36, 3, 0.04);
      const earMat = new THREE.MeshPhysicalMaterial({
        color: "#f0d78e",
        roughness: 0.38,
        clearcoat: 0.55,
        clearcoatRoughness: 0.28,
      });
      const earFront = new THREE.Mesh(earGeo, earMat);
      earFront.position.set(0, 0.53, 0.25);
      const earBack = new THREE.Mesh(earGeo, earMat);
      earBack.position.set(0, 0.53, -0.25);
      group.add(earFront, earBack);

      const BASE_YAW = -0.45;
      const BASE_PITCH = 0.18;
      let yaw = BASE_YAW;
      let pitch = BASE_PITCH;
      group.rotation.set(pitch, yaw, 0);

      // --- интерактив: мять / вращать ---
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const local = new THREE.Vector3();
      let mode: "squish" | "rotate" | null = null;
      let pressed = false;
      let lastX = 0;
      let lastY = 0;
      let spinVX = 0;
      let spinVY = 0;

      const raycastAt = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        ndc.set(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -((e.clientY - r.top) / r.height) * 2 + 1,
        );
        raycaster.setFromCamera(ndc, camera);
        return raycaster.intersectObject(group, true)[0];
      };

      const onDown = (e: PointerEvent) => {
        e.preventDefault();
        canvas.setPointerCapture(e.pointerId);
        lastX = e.clientX;
        lastY = e.clientY;
        const hit = raycastAt(e);
        if (hit) {
          mode = "squish";
          pressed = true;
          local.copy(hit.point);
          group.worldToLocal(local);
          uPoint.value.copy(local);
          squelch();
          tick();
        } else {
          mode = "rotate";
        }
      };
      const onMove = (e: PointerEvent) => {
        if (mode === "squish") {
          const hit = raycastAt(e);
          if (hit) {
            local.copy(hit.point);
            group.worldToLocal(local);
            uPoint.value.copy(local);
          }
        } else if (mode === "rotate") {
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          lastX = e.clientX;
          lastY = e.clientY;
          yaw += dx * 0.008;
          pitch = Math.max(-0.7, Math.min(0.7, pitch + dy * 0.006));
          spinVX = dx * 0.008;
          spinVY = dy * 0.006;
        }
      };
      const onUp = () => {
        mode = null;
        pressed = false;
      };
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);

      // --- пружины: вмятина (u до 0.4) и сплющивание (s 0..1) ---
      const MAX_DEPTH = 0.4;
      let u = 0;
      let uv = 0;
      let s = 0;
      let sv = 0;
      const K = 8;
      const C = 2.8;
      let last = performance.now();
      const t0 = performance.now();

      setReady(true);

      const frame = (now: number) => {
        const dt = Math.min((now - last) / 16.7, 3);
        last = now;

        // инерция вращения после отпускания
        if (mode !== "rotate") {
          yaw += spinVX;
          pitch = Math.max(-0.7, Math.min(0.7, pitch + spinVY));
          spinVX *= 0.94;
          spinVY *= 0.94;
        }
        group.rotation.set(pitch, yaw, 0);

        // вмятина
        const dTarget = pressed ? MAX_DEPTH : 0;
        const da = -K * (u - dTarget) - C * uv;
        uv += da * dt;
        u += uv * dt;
        uDepth.value = Math.max(0, Math.min(0.5, u));

        // сплющивание всего брикета (объём сохраняем)
        const sTarget = pressed ? 1 : 0;
        const sa = -K * (s - sTarget) - C * sv;
        sv += sa * dt;
        s += sv * dt;
        s = Math.max(-0.2, Math.min(1.15, s));
        group.scale.set(1 + 0.14 * s, 1 - 0.28 * s, 1 + 0.14 * s);

        if (!reduced) {
          const t = (now - t0) / 1000;
          group.position.y = Math.sin(t * 0.6) * 0.02;
        }
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(raf);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        bodyGeo.dispose();
        earGeo.dispose();
        labelTex.dispose();
        paperTex.dispose();
        envTex.dispose();
        pmrem.dispose();
        for (const m of [body, earFront, earBack])
          for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as Material[])
            mat.dispose();
        renderer.dispose();
      };
    })().catch(() => {
      /* three не загрузился — окно просто пустое */
    });

    return () => {
      disposed = true;
    };
  }, []);

  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-tds-btn bg-gradient-to-b from-tds-bg to-tds-neutral/60"
      style={{ width: SIZE, height: SIZE }}
    >
      {!ready && (
        <span className="text-sm font-bold text-tds-muted">🧈 загружаю…</span>
      )}
      <canvas
        ref={canvasRef}
        className={`touch-none ${ready ? "" : "hidden"}`}
        style={{ width: SIZE, height: SIZE }}
        aria-label="Сквиш масло: нажми и помни, потяни фон — повернуть"
      />
    </div>
  );
}