"use client";

import { useEffect, useRef } from "react";
import styles from "@/app/warm.module.css";

type Node = { x: number; y: number; code: string; type: "s" | "b" };

const NODES: Node[] = [
  { x: 0.15, y: 0.2, code: "KR", type: "s" },
  { x: 0.15, y: 0.42, code: "CN", type: "s" },
  { x: 0.15, y: 0.63, code: "BD", type: "s" },
  { x: 0.15, y: 0.85, code: "TW", type: "s" },
  { x: 0.85, y: 0.22, code: "US", type: "b" },
  { x: 0.85, y: 0.43, code: "DE", type: "b" },
  { x: 0.85, y: 0.63, code: "GB", type: "b" },
  { x: 0.85, y: 0.82, code: "NL", type: "b" },
];

const EDGES: [number, number][] = [
  [0, 4],
  [2, 6],
  [1, 5],
  [3, 7],
];

export default function HeroNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx?.scale(dpr, dpr);
    }
    resize();

    const signals = EDGES.map((edge, i) => ({
      si: edge[0],
      bi: edge[1],
      prog: i * 0.25,
      phase: "toAI" as "toAI" | "toBuyer",
    }));

    let t = 0;
    let raf = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#FEFBF8");
      bg.addColorStop(1, "#FAF4EC");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const ax = width * 0.5;
      const ay = height * 0.5;

      EDGES.forEach((edge) => {
        const n1 = NODES[edge[0]];
        const n2 = NODES[edge[1]];
        ctx.beginPath();
        ctx.moveTo(width * n1.x, height * n1.y);
        ctx.lineTo(ax, ay);
        ctx.strokeStyle = "rgba(34,197,94,.15)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(width * n2.x, height * n2.y);
        ctx.strokeStyle = "rgba(249,115,22,.15)";
        ctx.stroke();
        ctx.setLineDash([]);
      });

      NODES.forEach((n) => {
        const nx = width * n.x;
        const ny = height * n.y;
        const r = 22;
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = n.type === "s" ? "rgba(34,197,94,.35)" : "rgba(249,115,22,.35)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = "600 10px system-ui";
        ctx.fillStyle = n.type === "s" ? "#22C55E" : "#F97316";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.code, nx, ny);
      });

      const pulse = Math.sin(t * 0.03) * 0.2 + 0.8;
      ctx.beginPath();
      ctx.arc(ax, ay, 38 + Math.sin(t * 0.03) * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,197,94,${0.06 * pulse})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ax, ay, 30, 0, Math.PI * 2);
      ctx.fillStyle = "#241810";
      ctx.fill();
      ctx.font = "600 8px system-ui";
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("gracera", ax, ay - 6);
      ctx.font = "700 11px system-ui";
      ctx.fillStyle = "#22C55E";
      ctx.fillText("AI", ax, ay + 6);

      signals.forEach((sig) => {
        const sn = NODES[sig.si];
        const bn = NODES[sig.bi];
        const sx = width * sn.x;
        const sy = height * sn.y;
        const bx = width * bn.x;
        const by = height * bn.y;
        const p = sig.prog;
        if (sig.phase === "toAI") {
          const px = sx + (ax - sx) * p;
          const py = sy + (ay - sy) * p;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#22C55E";
          ctx.fill();
          sig.prog += 0.007;
          if (sig.prog >= 1) {
            sig.prog = 0;
            sig.phase = "toBuyer";
          }
        } else {
          const px = ax + (bx - ax) * p;
          const py = ay + (by - ay) * p;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#F97316";
          ctx.fill();
          sig.prog += 0.007;
          if (sig.prog >= 1) {
            sig.prog = 0;
            sig.phase = "toAI";
          }
        }
      });

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.heroCanvas} />;
}
