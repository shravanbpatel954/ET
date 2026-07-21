import React, { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, ZoomIn, ZoomOut, Maximize, X, Activity, ShieldAlert } from 'lucide-react';
import { threatAPI } from '../services/api';

const GROUP_COLORS = {
  Scam: '#ef4444',
  Authority: '#3b82f6',
  Phone: '#eab308',
  UPI: '#a855f7',
  Technology: '#ec4899',
  Location: '#10b981'
};

export default function KnowledgeGraph() {
  const fgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const data = await threatAPI.getGraph();
        setGraphData(data);
      } catch (err) {
        console.error("Failed to fetch graph", err);
      }
    };
    fetchGraph();
  }, []);

  useEffect(() => {
    const container = document.getElementById('graph-container');
    if (container) {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight
      });
    }

    const handleResize = () => {
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNodeClick = useCallback(node => {
    // Center graph on node
    if(fgRef.current) {
       fgRef.current.centerAt(node.x, node.y, 1000);
       fgRef.current.zoom(2, 1000);
    }
    setSelectedNode(node);
  }, [fgRef]);

  const handleZoomIn = () => { if(fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.5, 400); };
  const handleZoomOut = () => { if(fgRef.current) fgRef.current.zoom(fgRef.current.zoom() / 1.5, 400); };
  const handleFit = () => { if(fgRef.current) fgRef.current.zoomToFit(400); };

  return (
    <div className="container" style={{ maxWidth: '1600px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-hero flex-shrink-0">
        <div>
          <div className="eyebrow">Entity relationship map</div>
          <h2 className="page-title">Entity Knowledge Graph</h2>
          <p className="page-copy">Visualizing interconnected fraud syndicates from stored records.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
           {Object.entries(GROUP_COLORS).map(([group, color]) => (
              <div key={group} className="flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-1 rounded">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                 {group}
              </div>
           ))}
        </div>
      </div>

      <div className="flex-grow relative flex gap-4 h-full overflow-hidden">
        
        {/* Main Graph Area */}
        <div id="graph-container" className="flex-grow glass-panel relative bg-slate-900/80 overflow-hidden" style={{ padding: 0, minHeight: '500px' }}>
          
          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button onClick={handleZoomIn} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700 shadow-lg"><ZoomIn size={20}/></button>
            <button onClick={handleZoomOut} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700 shadow-lg"><ZoomOut size={20}/></button>
            <button onClick={handleFit} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700 shadow-lg"><Maximize size={20}/></button>
          </div>

          {dimensions.width > 0 && dimensions.height > 0 && (
            graphData.nodes.length > 0 ? <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
            nodeColor={node => GROUP_COLORS[node.group] || '#94a3b8'}
            nodeRelSize={6}
            linkColor={() => 'rgba(255,255,255,0.2)'}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            onNodeClick={handleNodeClick}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.label;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

              ctx.fillStyle = GROUP_COLORS[node.group] || '#94a3b8';
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val ? Math.sqrt(node.val)*2 : 5, 0, 2 * Math.PI, false);
              ctx.fill();

              // Draw label
              if (globalScale > 1.5 || node === selectedNode) {
                ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + 8, bckgDimensions[0], bckgDimensions[1]);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(label, node.x, node.y + 8 + bckgDimensions[1]/2);
              }
              
              if (node === selectedNode) {
                 ctx.beginPath();
                 ctx.arc(node.x, node.y, (node.val ? Math.sqrt(node.val)*2 : 5) + 4, 0, 2 * Math.PI, false);
                 ctx.strokeStyle = '#ffffff';
                 ctx.lineWidth = 2 / globalScale;
                 ctx.stroke();
              }
            }}
          /> : <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center px-6">
              No graph entities yet. Analyze content or sync market intelligence to build fraud relationships.
            </div>
          )}
        </div>

        {/* Slide-out Intelligence Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="w-[350px] glass-panel bg-slate-900 flex flex-col h-full overflow-y-auto shadow-2xl border-l border-slate-700"
              style={{ padding: '1.5rem' }}
            >
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <span className="px-2 py-1 text-xs font-bold rounded uppercase tracking-wider mb-2 inline-block" style={{ backgroundColor: GROUP_COLORS[selectedNode.group]+'33', color: GROUP_COLORS[selectedNode.group] }}>
                       {selectedNode.group}
                    </span>
                    <h3 className="text-xl font-bold text-white break-words">{selectedNode.label}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedNode.id}</p>
                 </div>
                 <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded"><X size={20}/></button>
              </div>

              {selectedNode.group === 'Scam' && (
                 <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-900/50">
                    <div className="flex items-center gap-2 mb-2 text-red-400 font-bold text-sm uppercase"><ShieldAlert size={16}/> Threat Level</div>
                    <div className="text-3xl font-black text-red-500">CRITICAL</div>
                 </div>
              )}

              <div className="mb-6">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Network size={16}/> Connected Entities</h4>
                 <ul className="space-y-2">
                    {graphData.links.filter(l => (l.source.id || l.source) === selectedNode.id || (l.target.id || l.target) === selectedNode.id).map((link, i) => {
                       const isSource = (link.source.id || link.source) === selectedNode.id;
                       const connectedNodeId = isSource ? (link.target.id || link.target) : (link.source.id || link.source);
                       const connectedNode = graphData.nodes.find(n => n.id === connectedNodeId) || { label: connectedNodeId, group: 'Unknown' };
                       return (
                          <li key={i} className="text-sm flex flex-col p-2 bg-slate-800/50 rounded border border-slate-700/50">
                             <span className="text-xs text-slate-500 font-bold font-mono mb-1">{link.label}</span>
                             <div className="flex items-center gap-2 text-slate-200">
                               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GROUP_COLORS[connectedNode.group] }}></div>
                               {connectedNode.label}
                             </div>
                          </li>
                       )
                    })}
                 </ul>
              </div>

              <div>
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Activity size={16}/> Recent Activity</h4>
                 <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50 text-sm text-slate-300">
                    <p className="mb-2">Spike in activity detected in the last 24 hours.</p>
                    <p className="text-xs text-slate-500 font-mono">Last seen: 12 mins ago</p>
                 </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
