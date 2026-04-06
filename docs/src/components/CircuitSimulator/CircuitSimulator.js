import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiRefreshCw } from 'react-icons/fi';
import './CircuitSimulator.css';

const COMPONENTS = [
  { type: 'resistor', label: 'Resistor', symbol: '⏛', color: '#fbbf24' },
  { type: 'capacitor', label: 'Capacitor', symbol: '⊥⊤', color: '#60a5fa' },
  { type: 'inductor', label: 'Inductor', symbol: '∿', color: '#34d399' },
  { type: 'diode', label: 'Diode', symbol: '▷|', color: '#f87171' },
  { type: 'led', label: 'LED', symbol: '◉', color: '#a78bfa' },
  { type: 'battery', label: 'Battery', symbol: '⊞', color: '#fb923c' },
  { type: 'ground', label: 'Ground', symbol: '⏚', color: '#94a3b8' },
  { type: 'wire', label: 'Wire', symbol: '─', color: '#e2e8f0' }
];

const CircuitSimulator = ({ onSave, initialData }) => {
  const canvasRef = useRef(null);
  const [placedComponents, setPlacedComponents] = useState(initialData?.components || []);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragComponent, setDragComponent] = useState(null);

  useEffect(() => {
    drawCanvas();
  }, [placedComponents]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#111128';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1a1a3e';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw components
    placedComponents.forEach(comp => {
      const compDef = COMPONENTS.find(c => c.type === comp.type);
      if (!compDef) return;

      ctx.fillStyle = compDef.color;
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(compDef.symbol, comp.x, comp.y);

      // Label
      ctx.font = '10px Inter';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(comp.label || compDef.label, comp.x, comp.y + 20);

      if (comp.value) {
        ctx.fillText(comp.value, comp.x, comp.y + 32);
      }
    });
  };

  const handleCanvasClick = (e) => {
    if (!selectedComponent) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / 20) * 20;
    const y = Math.round((e.clientY - rect.top) / 20) * 20;

    const newComp = {
      id: Date.now(),
      type: selectedComponent.type,
      label: selectedComponent.label,
      x,
      y,
      value: ''
    };

    setPlacedComponents(prev => [...prev, newComp]);
  };

  const clearCanvas = () => {
    setPlacedComponents([]);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        components: placedComponents,
        timestamp: new Date()
      });
    }
  };

  return (
    <div className="circuit-simulator">
      <div className="simulator-toolbar">
        <div className="component-palette">
          {COMPONENTS.map(comp => (
            <button
              key={comp.type}
              className={`palette-item ${selectedComponent?.type === comp.type ? 'active' : ''}`}
              onClick={() => setSelectedComponent(
                selectedComponent?.type === comp.type ? null : comp
              )}
              title={comp.label}
            >
              <span style={{ color: comp.color }}>{comp.symbol}</span>
              <span className="palette-label">{comp.label}</span>
            </button>
          ))}
        </div>

        <div className="simulator-actions">
          <button className="btn btn-secondary btn-sm" onClick={clearCanvas}>
            <FiTrash2 /> Clear
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            <FiSave /> Save
          </button>
        </div>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={700}
          height={400}
          onClick={handleCanvasClick}
          className="simulator-canvas"
        />
        {selectedComponent && (
          <div className="canvas-hint">
            Click on the canvas to place: {selectedComponent.label}
          </div>
        )}
      </div>

      {placedComponents.length > 0 && (
        <div className="components-list">
          <h4>Placed Components ({placedComponents.length})</h4>
          <div className="comp-list-items">
            {placedComponents.map(comp => (
              <div key={comp.id} className="comp-list-item">
                <span>{comp.label}</span>
                <input
                  type="text"
                  placeholder="Value (e.g., 10kΩ)"
                  value={comp.value || ''}
                  onChange={(e) => {
                    setPlacedComponents(prev =>
                      prev.map(c =>
                        c.id === comp.id ? { ...c, value: e.target.value } : c
                      )
                    );
                  }}
                  className="comp-value-input"
                />
                <button
                  className="comp-remove"
                  onClick={() => {
                    setPlacedComponents(prev =>
                      prev.filter(c => c.id !== comp.id)
                    );
                  }}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitSimulator;