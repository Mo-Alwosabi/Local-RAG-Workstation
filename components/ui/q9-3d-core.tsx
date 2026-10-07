"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/lib/context/app-context";

interface Q93DCoreProps {
  className?: string;
  size?: number;
}

export function Q93DCore({ className = "", size = 480 }: Q93DCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useApp();
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const width = size;
    const height = size;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // 3D Geometry: Geodesic Icosahedron core + Concentric Orbital Rings
    const nodes: { x: number; y: number; z: number; ox: number; oy: number; oz: number }[] = [];
    const phi = (1 + Math.sqrt(5)) / 2;
    const radius = 115;

    const baseVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
    ];

    baseVertices.forEach(([x, y, z]) => {
      const len = Math.hypot(x, y, z);
      const nx = (x / len) * radius;
      const ny = (y / len) * radius;
      const nz = (z / len) * radius;
      nodes.push({ x: nx, y: ny, z: nz, ox: nx, oy: ny, oz: nz });
    });

    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(
          nodes[i].ox - nodes[j].ox,
          nodes[i].oy - nodes[j].oy,
          nodes[i].oz - nodes[j].oz
        );
        if (d < radius * 1.25) {
          edges.push([i, j]);
        }
      }
    }

    // Volumetric 3D Floating Token Particles
    const particles = Array.from({ length: 110 }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phiAngle = Math.acos(Math.random() * 2 - 1);
      const dist = radius * (1.1 + Math.random() * 1.2);
      return {
        x: dist * Math.sin(phiAngle) * Math.cos(theta),
        y: dist * Math.sin(phiAngle) * Math.sin(theta),
        z: dist * Math.cos(phiAngle),
        speed: (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });

    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;
    let tick = 0;

    // Global window mouse listener for fluid parallax
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      mouseRef.current.targetX = nx * 0.6;
      mouseRef.current.targetY = -ny * 0.6;
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse easing (inertia)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      angleY += 0.006 + mouseRef.current.x * 0.004;
      angleX = Math.sin(tick * 0.008) * 0.25 + mouseRef.current.y * 0.3;
      angleZ = Math.cos(tick * 0.006) * 0.15;

      const cx = width / 2;
      const cy = height / 2;
      const fov = 380;
      const isDark = theme === "dark";

      // ── Layer 0: Volumetric Radial Ambient Glow ──────────────────────
      const ambientGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 1.5);
      if (isDark) {
        ambientGlow.addColorStop(0, "rgba(59, 130, 246, 0.22)");
        ambientGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.10)");
        ambientGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        ambientGlow.addColorStop(0, "rgba(37, 99, 235, 0.12)");
        ambientGlow.addColorStop(0.5, "rgba(14, 165, 233, 0.06)");
        ambientGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // ── 3D Rotation Transformations ─────────────────────────────────
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      const project = (ox: number, oy: number, oz: number) => {
        // Rotate Y
        let x1 = ox * cosY - oz * sinY;
        let y1 = oy;
        let z1 = ox * sinY + oz * cosY;

        // Rotate X
        let x2 = x1;
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;

        // Rotate Z
        let x3 = x2 * cosZ - y2 * sinZ;
        let y3 = x2 * sinZ + y2 * cosZ;
        let z3 = z2;

        const scale = fov / (fov + z3 + 300);
        return {
          x: cx + x3 * scale,
          y: cy + y3 * scale,
          z: z3,
          scale,
        };
      };

      // ── Layer 1: Concentric Orbital Gyroscope Rings ─────────────────
      const renderRing = (r: number, tiltX: number, tiltY: number, color: string, speedOffset: number) => {
        const ringPoints = 64;
        ctx.beginPath();
        for (let p = 0; p <= ringPoints; p++) {
          const a = (p / ringPoints) * Math.PI * 2 + tick * speedOffset;
          const rx = Math.cos(a) * r;
          const ry = Math.sin(a) * r * Math.cos(tiltX);
          const rz = Math.sin(a) * r * Math.sin(tiltX);

          // Apply rotation
          const pr = project(rx, ry, rz);
          if (p === 0) ctx.moveTo(pr.x, pr.y);
          else ctx.lineTo(pr.x, pr.y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = isDark ? 1.2 : 1;
        ctx.stroke();

        // Orbiting Glowing Beads
        const beadAngle = tick * speedOffset * 2;
        const bx = Math.cos(beadAngle) * r;
        const by = Math.sin(beadAngle) * r * Math.cos(tiltX);
        const bz = Math.sin(beadAngle) * r * Math.sin(tiltX);
        const bp = project(bx, by, bz);

        ctx.beginPath();
        ctx.arc(bp.x, bp.y, 3 * bp.scale, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "#38bdf8" : "#2563eb";
        ctx.shadowColor = isDark ? "#38bdf8" : "#3b82f6";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      };

      const ringColor1 = isDark ? "rgba(56, 189, 248, 0.28)" : "rgba(37, 99, 235, 0.22)";
      const ringColor2 = isDark ? "rgba(129, 140, 248, 0.22)" : "rgba(79, 70, 229, 0.18)";
      renderRing(radius * 1.35, 0.7, 0.3, ringColor1, 0.008);
      renderRing(radius * 1.55, -0.6, 0.4, ringColor2, -0.006);

      // ── Layer 2: 3D Geodesic Lattice Edges ──────────────────────────
      const projectedNodes = nodes.map((n) => project(n.ox, n.oy, n.oz));

      edges.forEach(([i, j]) => {
        const p1 = projectedNodes[i];
        const p2 = projectedNodes[j];
        const avgZ = (p1.z + p2.z) / 2;
        const normZ = (avgZ + radius) / (radius * 2);
        const alpha = Math.max(0.1, Math.min(0.85, 0.15 + normZ * 0.7));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = isDark
          ? `rgba(96, 165, 250, ${alpha * 0.45})`
          : `rgba(37, 99, 235, ${alpha * 0.35})`;
        ctx.lineWidth = Math.max(0.6, (p1.scale + p2.scale) * 0.8);
        ctx.stroke();
      });

      // ── Layer 3: Lattice Vertices (Quantum Nodes) ───────────────────
      projectedNodes.forEach((p) => {
        const normZ = (p.z + radius) / (radius * 2);
        const alpha = Math.max(0.2, Math.min(0.95, 0.25 + normZ * 0.7));
        const rNode = Math.max(2, 4.5 * p.scale);

        ctx.beginPath();
        ctx.arc(p.x, p.y, rNode, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(56, 189, 248, ${alpha})`
          : `rgba(37, 99, 235, ${alpha})`;
        ctx.fill();

        // Node Glow on front nodes
        if (p.z > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, rNode * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? `rgba(56, 189, 248, ${alpha * 0.25})`
            : `rgba(37, 99, 235, ${alpha * 0.15})`;
          ctx.fill();
        }
      });

      // ── Layer 4: Volumetric Floating Vector Particles ───────────────
      particles.forEach((pt) => {
        // Orbit particle around Y
        const cosP = Math.cos(pt.speed);
        const sinP = Math.sin(pt.speed);
        const px = pt.x * cosP - pt.z * sinP;
        const pz = pt.x * sinP + pt.z * cosP;
        pt.x = px;
        pt.z = pz;

        const pr = project(pt.x, pt.y, pt.z);
        const pulse = Math.sin(tick * pt.pulseSpeed + pt.pulseOffset) * 0.3 + 0.7;
        const alpha = Math.max(0.1, Math.min(0.9, pt.alpha * pulse * pr.scale));

        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pt.size * pr.scale, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(103, 232, 249, ${alpha})`
          : `rgba(2, 132, 199, ${alpha})`;
        ctx.fill();
      });

      // ── Layer 5: Central Glowing Q9 Monogram ────────────────────────
      const centerScale = 1 + Math.sin(tick * 0.03) * 0.05;
      const coreR = 34 * centerScale;

      // Inner Core Glow
      const coreGradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, coreR);
      if (isDark) {
        coreGradient.addColorStop(0, "rgba(56, 189, 248, 0.95)");
        coreGradient.addColorStop(0.5, "rgba(59, 130, 246, 0.75)");
        coreGradient.addColorStop(1, "rgba(147, 51, 234, 0.1)");
      } else {
        coreGradient.addColorStop(0, "rgba(37, 99, 235, 0.9)");
        coreGradient.addColorStop(0.6, "rgba(79, 70, 229, 0.7)");
        coreGradient.addColorStop(1, "rgba(14, 165, 233, 0.1)");
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.shadowColor = isDark ? "#38bdf8" : "#2563eb";
      ctx.shadowBlur = isDark ? 22 : 14;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Q9 Glyph Text
      ctx.save();
      ctx.font = `900 ${Math.round(20 * centerScale)}px "Geist Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Q9", cx, cy + 1);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [size, theme]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="pointer-events-none transition-transform duration-300"
      />
    </div>
  );
}
