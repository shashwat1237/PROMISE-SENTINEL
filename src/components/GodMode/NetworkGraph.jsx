import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useTheatrical } from '../../core/theatricalContext';

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d'));

export const NetworkGraph = React.memo(() => {
  const { isChaosMode, queueCount } = useTheatrical();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const graphData = useMemo(() => ({
    nodes: [
      { id: 'DEVICE', color: '#10b981' },
      { id: 'CLOUD', color: '#3b82f6' }
    ],
    links: isChaosMode ? [] : [{ source: 'DEVICE', target: 'CLOUD' }]
  }), [isChaosMode]);

  if (!isMounted) return null;

  return (
    <div className="h-64 bg-black border border-green-900 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full px-2 py-1 text-xs font-mono font-bold z-10 ${
        isChaosMode ? 'bg-red-900/50 text-red-500' : 'bg-green-900/20 text-green-500'
      }`}>
        NETWORK STATUS: {isChaosMode ? 'CONNECTION SEVERED (LIE-FI)' : 'ONLINE'}
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-green-500 font-mono text-xs animate-pulse">
          INITIALIZING TOPOLOGY ENGINE...
        </div>
      }>
        <ForceGraph2D
          width={600}
          height={250}
          graphData={graphData}
          backgroundColor="#000000"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px monospace`;
            ctx.fillStyle = node.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, node.x, node.y);

            if (node.id === 'DEVICE' && queueCount > 0) {
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 1 / globalScale;
              const radius = 20;

              // [FIX] Loop through the queueCount to draw multiple particles
              // Limit to 10 visual particles to prevent lag if queue gets huge
              const visualCount = Math.min(queueCount, 10);

              for (let i = 0; i < visualCount; i++) {
                // Offset each particle so they don't overlap
                const offset = (i / visualCount) * 2 * Math.PI;
                const angle = ((Date.now() / 200) + offset) % (2 * Math.PI);

                const orbitX = node.x + Math.cos(angle) * radius;
                const orbitY = node.y + Math.sin(angle) * radius;

                ctx.beginPath();
                ctx.fillStyle = '#f59e0b';
                ctx.arc(orbitX, orbitY, 2, 0, 2 * Math.PI);
                ctx.fill();
              }

              // Draw the static ring
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
              ctx.stroke();

              ctx.fillText(`${queueCount} PENDING`, node.x, node.y - 28);
            }
          }}
          linkColor={() => '#10b981'}
          linkDirectionalParticles={isChaosMode ? 0 : 4}
          linkDirectionalParticleSpeed={0.01}
        />
      </Suspense>
    </div>
  );
});