import { useEffect, useRef, useState } from "react";
import type { Material, Texture } from "three";
import { squelch } from "../../lib/sound";
import { tick } from "../../lib/haptics";

/**
 * Трендовый сквиш «сливочное масло» (butter squish, TikTok 2026).
 * Three.js: брусок масла с этикеткой «BUTTER», деформация вершин шейдером
 * (вмятина едет за пальцем), пружинный slow-rise ~3с.
 * three грузится лениво — отдельный chunk, подтягивается при включении виджета.
 */
export function ButterSquish() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    void (async () => {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import(
        "three/addons/geometries/RoundedBoxGeometry.js"
      );
      if (disposed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!ctx) return;

      // --- сцена, камера, свет ---
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20);
      camera.position.set(0, 0.5, 3.6);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      scene.add(new THREE.HemisphereLight(0xffffff, 0x4a3a1a, 0.45));
      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(2, 3, 4);
      scene.add(key);

      // --- этикетка «BUTTER» ---
      const label = document.createElement("canvas");
      label.width = 512;
      label.height = 256;
      {
        const g = label.getContext("2d");
        if (g) {
          const grad = g.createLinearGradient(0, 0, 0, 256);
          grad.addColorStop(0, "#fdf3d0");
          grad.addColorStop(1, "#f6e3a2");
          g.fillStyle = grad;
          g.fillRect(0, 0, 512, 256);
          // красная полоса сверху + «SALTED»
          g.fillStyle = "#e23b3b";
          g.fillRect(0, 0, 512, 46);
          g.fillStyle = "#fff";
          g.font = "bold 26px Manrope, sans-serif";
          g.textAlign = "center";
          g.fillText("SALTED", 256, 32);
          // синяя полоса снизу + «150 г»
          g.fillStyle = "#1f5fd6";
          g.fillRect(0, 222, 512, 34);
          g.fillStyle = "#fff";
          g.font = "bold 20px Manrope, sans-serif";
          g.fillText("150 г", 256, 245);
          // «BUTTER»
          g.fillStyle = "#d42a2a";
          g.font = "900 104px Manrope, sans-serif";
          g.fillText("BUTTER", 256, 160);
          // складки у краёв
          g.fillStyle = "rgba(140, 100, 20, 0.28)";
          for (let x = 12; x < 60; x += 10)
            g.fillRect(x, 0, 3, 256);
          for (let x = 512 - 60; x < 512 - 10; x += 10)
            g.fillRect(x, 0, 3, 256);
        }
      }
      const labelTex = new THREE.CanvasTexture(label);
      labelTex.colorSpace = THREE.SRGBColorSpace;

      // --- деформация: общий uniform для всех материалов ---
      const uPoint = new THREE.Uniform(new THREE.Vector3(99, 99, 99));
      const uDepth = new THREE.Uniform(0);
      const uRadius = new THREE.Uniform(0.9);

      const makeMat = (opts: {
        color?: string;
        map?: Texture;
        roughness?: number;
      }) => {
        const m = new THREE.MeshPhysicalMaterial({
          color: opts.color ?? "#f6e6b8",
          map: opts.map,
          roughness: opts.roughness ?? 0.28,
          metalness: 0,
        });
        m.onBeforeCompile = (shader) => {
          shader.uniforms.uSquishPoint = uPoint;
          shader.uniforms.uSquishDepth = uDepth;
          shader.uniforms.uSquishRadius = uRadius;
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

      // RoundedBoxGeometry: группы как BoxGeometry: +z, -z, +x, -x, +y, -y
      const geo = new RoundedBoxGeometry(2.8, 1, 1, 4, 0.09);
      const butter = new THREE.Mesh(geo, [
        makeMat({ map: labelTex, roughness: 0.32 }), // +z перед — этикетка
        makeMat({ map: labelTex, roughness: 0.32 }), // -z зад — этикетка
        makeMat({ color: "#f8e7b0" }), // +x бок
        makeMat({ color: "#f8e7b0" }), // -x бок
        makeMat({ color: "#f5e0a8", roughness: 0.18 }), // +y верх — масло
        makeMat({ color: "#f5e0a8", roughness: 0.18 }), // -y низ — масло
      ]);
      butter.rotation.y = -0.55;
      butter.rotation.x = 0.12;
      scene.add(butter);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        context: ctx as WebGLRenderingContext,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(180, 180, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      // --- интерактив ---
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const local = new THREE.Vector3();
      let pressed = false;

      const applyPointer = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        ndc.set(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -((e.clientY - r.top) / r.height) * 2 + 1,
        );
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObject(butter, false)[0];
        if (hit) {
          local.copy(hit.point);
          butter.worldToLocal(local);
          uPoint.value.copy(local);
        }
      };

      const onDown = (e: PointerEvent) => {
        e.preventDefault();
        canvas.setPointerCapture(e.pointerId);
        applyPointer(e);
        pressed = true;
        squelch();
        tick();
      };
      const onMove = (e: PointerEvent) => {
        if (pressed) applyPointer(e);
      };
      const onUp = () => {
        pressed = false;
      };
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);

      // --- пружина возврата: k=8, c=2.8 → перелёт ~17%, возврат ~3.5с ---
      const MAX_DEPTH = 0.22;
      let u = 0;
      let v = 0;
      const K = 8;
      const C = 2.8;
      let last = performance.now();
      const t0 = performance.now();

      setReady(true);

      const frame = (now: number) => {
        const dt = Math.min((now - last) / 16.7, 3);
        last = now;
        const target = pressed ? MAX_DEPTH : 0;
        const a = -K * (u - target) - C * v;
        v += a * dt;
        u += v * dt;
        uDepth.value = Math.max(0, Math.min(0.35, u));

        if (!reduced) {
          const t = (now - t0) / 1000;
          butter.position.y = Math.sin(t * 0.6) * 0.02;
          butter.rotation.y = -0.55 + Math.sin(t * 0.35) * 0.05;
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
        geo.dispose();
        labelTex.dispose();
        for (const m of butter.material as Material[]) m.dispose();
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
    <div className="flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-tds-btn bg-gradient-to-b from-tds-bg to-tds-neutral/60">
      {!ready && (
        <span className="text-sm font-bold text-tds-muted">🧈 загружаю…</span>
      )}
      <canvas
        ref={canvasRef}
        className={`h-[180px] w-[180px] touch-none ${ready ? "" : "hidden"}`}
        aria-label="Сквиш масло: нажми и помни"
      />
    </div>
  );
}