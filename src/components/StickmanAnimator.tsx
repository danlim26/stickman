"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Square, RotateCcw, Plus, Trash2, Copy, Download, 
  Brush, Move, MousePointer, Settings, Layers, Palette, ChevronUp, ChevronDown,
  Grid3X3, Eye, EyeOff, Minimize2, Maximize2, Upload, Save
} from 'lucide-react';
import { SketchPicker } from 'react-color';
import GIF from 'gif.js';
import { saveAs } from 'file-saver';
import InstallPrompt from './InstallPrompt';

const StickmanAnimator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [frames, setFrames] = useState<{x: number, y: number}[][][]>([[]]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(12);
  const [brushSize, setBrushSize] = useState(3);
  const [showOnionSkin, setShowOnionSkin] = useState(true);
  const [isErasing, setIsErasing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{x: number, y: number} | null>(null);
  const [selectedPaths, setSelectedPaths] = useState<number[]>([]);
  const [clipboard, setClipboard] = useState<{x: number, y: number}[][]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedAnimations, setSavedAnimations] = useState<{name: string, frames: {x: number, y: number}[][][], date: string, fps: number, brushSize: number}[]>([]);
  const [animationName, setAnimationName] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // UI State
  const [showGrid, setShowGrid] = useState(true);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [activePanel, setActivePanel] = useState<'draw' | 'select' | 'erase'>('draw');
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize canvas and handle resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Load saved animations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('stickman-animations');
    if (saved) {
      try {
        setSavedAnimations(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved animations:', error);
      }
    }
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        redrawCanvas();
      }
    }
  }, [currentFrame, frames, showOnionSkin, canvasSize]);

  // Animation loop
  useEffect(() => {
    if (isPlaying && frames.length > 1) {
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames.length);
      }, 1000 / fps);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, fps, frames.length]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    }

    // Draw onion skin (previous frame)
    if (showOnionSkin && currentFrame > 0) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.lineWidth = brushSize;
      drawFrame(ctx, frames[currentFrame - 1]);
    }

    // Draw onion skin (next frame)
    if (showOnionSkin && currentFrame < frames.length - 1) {
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
      ctx.lineWidth = brushSize;
      drawFrame(ctx, frames[currentFrame + 1]);
    }

    // Draw current frame
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    drawFrame(ctx, frames[currentFrame]);

    // Draw selection rectangle
    if (isSelecting && selectionStart && selectionEnd) {
      ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        Math.min(selectionStart.x, selectionEnd.x),
        Math.min(selectionStart.y, selectionEnd.y),
        Math.abs(selectionEnd.x - selectionStart.x),
        Math.abs(selectionEnd.y - selectionStart.y)
      );
      ctx.setLineDash([]);
    }

    // Highlight selected paths
    if (selectedPaths.length > 0) {
      ctx.strokeStyle = 'rgba(0, 123, 255, 0.6)';
      ctx.lineWidth = brushSize + 2;
      selectedPaths.forEach(pathIndex => {
        if (frames[currentFrame][pathIndex]) {
          const path = frames[currentFrame][pathIndex];
          if (path.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          path.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
      });
    }
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, frameData: {x: number, y: number}[][]) => {
    frameData.forEach(path => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const isPointInSelection = (pos: {x: number, y: number}) => {
    if (selectedPaths.length === 0) return false;
    
    // Check if the cursor is over any selected path
    return selectedPaths.some(pathIndex => {
      const path = frames[currentFrame][pathIndex];
      if (!path) return false;
      
      return path.some(point => {
        const distance = Math.sqrt(Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2));
        return distance < 10; // 10px tolerance for clicking on a line
      });
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    if (isSelecting) {
      // Check if clicking on selected paths to start dragging
      if (selectedPaths.length > 0 && isPointInSelection(pos)) {
        setIsDragging(true);
        setDragStart(pos);
        return;
      }
      
      // Otherwise start new selection
      setSelectionStart(pos);
      setSelectionEnd(pos);
      setSelectedPaths([]);
    } else {
      setIsDrawing(true);
      setCurrentPath([pos]);
    }
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling
    const pos = getTouchPos(e);
    
    if (isSelecting) {
      // Check if touching on selected paths to start dragging
      if (selectedPaths.length > 0 && isPointInSelection(pos)) {
        setIsDragging(true);
        setDragStart(pos);
        return;
      }
      
      // Otherwise start new selection
      setSelectionStart(pos);
      setSelectionEnd(pos);
      setSelectedPaths([]);
    } else {
      setIsDrawing(true);
      setCurrentPath([pos]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    if (isDragging && dragStart && selectedPaths.length > 0) {
      // Calculate drag offset
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;
      
      // Move selected paths
      const newFrames = [...frames];
      selectedPaths.forEach(pathIndex => {
        if (newFrames[currentFrame][pathIndex]) {
          newFrames[currentFrame][pathIndex] = newFrames[currentFrame][pathIndex].map(point => ({
            x: point.x + deltaX,
            y: point.y + deltaY
          }));
        }
      });
      
      setFrames(newFrames);
      setDragStart(pos); // Update drag start for next move
      redrawCanvas();
      return;
    }
    
    if (isSelecting && selectionStart && !isDragging) {
      setSelectionEnd(pos);
      redrawCanvas();
      return;
    }
    
    if (!isDrawing) return;
    
    if (isErasing) {
      // Eraser functionality - remove paths near the cursor
      const newFrames = [...frames];
      const eraserRadius = brushSize * 3; // Make eraser larger than brush
      
      newFrames[currentFrame] = newFrames[currentFrame].filter(path => {
        return !path.some(point => {
          const distance = Math.sqrt(Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2));
          return distance < eraserRadius;
        });
      });
      
      setFrames(newFrames);
      redrawCanvas();
    } else {
      // Normal drawing
      setCurrentPath(prev => [...prev, pos]);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      
      if (currentPath.length > 0) {
        ctx.beginPath();
        const lastPoint = currentPath[currentPath.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling
    const pos = getTouchPos(e);
    
    if (isDragging && dragStart && selectedPaths.length > 0) {
      // Calculate drag offset
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;
      
      // Move selected paths
      const newFrames = [...frames];
      selectedPaths.forEach(pathIndex => {
        if (newFrames[currentFrame][pathIndex]) {
          newFrames[currentFrame][pathIndex] = newFrames[currentFrame][pathIndex].map(point => ({
            x: point.x + deltaX,
            y: point.y + deltaY
          }));
        }
      });
      
      setFrames(newFrames);
      setDragStart(pos); // Update drag start for next move
      redrawCanvas();
      return;
    }
    
    if (isSelecting && selectionStart && !isDragging) {
      setSelectionEnd(pos);
      redrawCanvas();
      return;
    }
    
    if (!isDrawing) return;
    
    if (isErasing) {
      // Eraser functionality - remove paths near the cursor
      const newFrames = [...frames];
      const eraserRadius = brushSize * 3; // Make eraser larger than brush
      
      newFrames[currentFrame] = newFrames[currentFrame].filter(path => {
        return !path.some(point => {
          const distance = Math.sqrt(Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2));
          return distance < eraserRadius;
        });
      });
      
      setFrames(newFrames);
      redrawCanvas();
    } else {
      // Normal drawing
      setCurrentPath(prev => [...prev, pos]);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      
      if (currentPath.length > 0) {
        ctx.beginPath();
        const lastPoint = currentPath[currentPath.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }
    
    if (isSelecting && selectionStart && selectionEnd) {
      // Find paths within selection rectangle
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);
      
      const pathsInSelection: number[] = [];
      frames[currentFrame].forEach((path, index) => {
        const pathInBounds = path.some(point => 
          point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
        );
        if (pathInBounds) {
          pathsInSelection.push(index);
        }
      });
      
      setSelectedPaths(pathsInSelection);
      setSelectionStart(null);
      setSelectionEnd(null);
      redrawCanvas();
      return;
    }
    
    if (isDrawing && currentPath.length > 1 && !isErasing) {
      const newFrames = [...frames];
      newFrames[currentFrame] = [...newFrames[currentFrame], currentPath];
      setFrames(newFrames);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const stopDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling
    
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }
    
    if (isSelecting && selectionStart && selectionEnd) {
      // Find paths within selection rectangle
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);
      
      const pathsInSelection: number[] = [];
      frames[currentFrame].forEach((path, index) => {
        const pathInBounds = path.some(point => 
          point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
        );
        if (pathInBounds) {
          pathsInSelection.push(index);
        }
      });
      
      setSelectedPaths(pathsInSelection);
      setSelectionStart(null);
      setSelectionEnd(null);
      redrawCanvas();
      return;
    }
    
    if (isDrawing && currentPath.length > 1 && !isErasing) {
      const newFrames = [...frames];
      newFrames[currentFrame] = [...newFrames[currentFrame], currentPath];
      setFrames(newFrames);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const addFrame = () => {
    const newFrames = [...frames];
    newFrames.splice(currentFrame + 1, 0, []);
    setFrames(newFrames);
    setCurrentFrame(currentFrame + 1);
  };

  const deleteFrame = () => {
    if (frames.length === 1) return;
    const newFrames = frames.filter((_, index) => index !== currentFrame);
    setFrames(newFrames);
    setCurrentFrame(Math.max(0, Math.min(currentFrame, newFrames.length - 1)));
  };

  const duplicateFrame = () => {
    const newFrames = [...frames];
    newFrames.splice(currentFrame + 1, 0, JSON.parse(JSON.stringify(frames[currentFrame])));
    setFrames(newFrames);
    setCurrentFrame(currentFrame + 1);
  };

  const copySelection = () => {
    if (selectedPaths.length === 0) return;
    
    const pathsToCopy = selectedPaths.map(index => 
      JSON.parse(JSON.stringify(frames[currentFrame][index]))
    );
    setClipboard(pathsToCopy);
  };

  const pasteSelection = () => {
    if (clipboard.length === 0) return;
    
    const newFrames = [...frames];
    // Offset pasted content slightly so it's visible
    const offsetPaths = clipboard.map(path => 
      path.map(point => ({
        x: point.x + 20,
        y: point.y + 20
      }))
    );
    
    newFrames[currentFrame] = [...newFrames[currentFrame], ...offsetPaths];
    setFrames(newFrames);
    redrawCanvas();
  };

  const deleteSelection = () => {
    if (selectedPaths.length === 0) return;
    
    const newFrames = [...frames];
    // Remove selected paths (sort in reverse order to maintain indices)
    selectedPaths.sort((a, b) => b - a).forEach(index => {
      newFrames[currentFrame].splice(index, 1);
    });
    
    setFrames(newFrames);
    setSelectedPaths([]);
    redrawCanvas();
  };

  const clearSelection = () => {
    setSelectedPaths([]);
    setSelectionStart(null);
    setSelectionEnd(null);
    setIsDragging(false);
    setDragStart(null);
    redrawCanvas();
  };

  const clearFrame = () => {
    const newFrames = [...frames];
    newFrames[currentFrame] = [];
    setFrames(newFrames);
    setSelectedPaths([]);
    redrawCanvas();
  };

  const playAnimation = () => {
    if (frames.length > 1) {
      setIsPlaying(!isPlaying);
    }
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  const saveAnimation = () => {
    if (!animationName.trim()) {
      alert('Please enter a name for your animation');
      return;
    }
    
    const animationData = {
      name: animationName,
      frames,
      date: new Date().toISOString(),
      fps,
      brushSize
    };
    
    const updatedAnimations = [...savedAnimations, animationData];
    setSavedAnimations(updatedAnimations);
    localStorage.setItem('stickman-animations', JSON.stringify(updatedAnimations));
    setAnimationName('');
    setShowSaveModal(false);
    alert('Animation saved successfully!');
  };

  const loadAnimation = (animationData: {name: string, frames: {x: number, y: number}[][][], date: string, fps: number, brushSize: number}) => {
    setFrames(animationData.frames);
    setCurrentFrame(0);
    setFps(animationData.fps || 12);
    setBrushSize(animationData.brushSize || 3);
    setShowLoadModal(false);
    redrawCanvas();
  };

  const deleteAnimation = (index: number) => {
    const updatedAnimations = savedAnimations.filter((_, i) => i !== index);
    setSavedAnimations(updatedAnimations);
    localStorage.setItem('stickman-animations', JSON.stringify(updatedAnimations));
  };

  const exportAsJSON = () => {
    const data = {
      name: 'stickman-animation',
      frames,
      fps,
      brushSize,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `stickman-animation-${Date.now()}.json`);
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.frames) {
          setFrames(data.frames);
          setCurrentFrame(0);
          setFps(data.fps || 12);
          setBrushSize(data.brushSize || 3);
          redrawCanvas();
          alert('Animation imported successfully!');
        } else {
          alert('Invalid animation file format');
        }
      } catch (error) {
        alert('Error importing animation file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadGIF = async () => {
    if (frames.length === 0) return;
    
    setIsExporting(true);
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvasSize.width,
      height: canvasSize.height
    });
    
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsExporting(false);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExporting(false);
      return;
    }
    
    // Create frames for GIF
    for (let i = 0; i < frames.length; i++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw frame
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      drawFrame(ctx, frames[i]);
      
      gif.addFrame(canvas, { delay: 1000 / fps });
    }
    
    gif.on('finished', (blob: Blob) => {
      saveAs(blob, `stickman-animation-${Date.now()}.gif`);
      setIsExporting(false);
    });
    
    gif.render();
  };

  const startVideoRecording = async () => {
    if (!canvasRef.current) return;
    
    try {
      const stream = canvasRef.current.captureStream(fps);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
      });
      
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        saveAs(blob, `stickman-animation-${Date.now()}.webm`);
        setIsRecording(false);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      // Auto-play the animation for recording
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Error starting video recording:', error);
      alert('Video recording not supported in this browser');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsPlaying(false);
    }
  };

  const drawStickFigure = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const stickFigure = [
      // Head
      [{x: centerX, y: centerY - 60}, {x: centerX + 15, y: centerY - 60}, {x: centerX + 15, y: centerY - 45}, {x: centerX, y: centerY - 45}, {x: centerX, y: centerY - 60}],
      // Body
      [{x: centerX + 7, y: centerY - 45}, {x: centerX + 7, y: centerY + 15}],
      // Left arm
      [{x: centerX + 7, y: centerY - 30}, {x: centerX - 15, y: centerY - 15}],
      // Right arm
      [{x: centerX + 7, y: centerY - 30}, {x: centerX + 30, y: centerY - 15}],
      // Left leg
      [{x: centerX + 7, y: centerY + 15}, {x: centerX - 15, y: centerY + 45}],
      // Right leg
      [{x: centerX + 7, y: centerY + 15}, {x: centerX + 30, y: centerY + 45}]
    ];

    const newFrames = [...frames];
    newFrames[currentFrame] = [...newFrames[currentFrame], ...stickFigure];
    setFrames(newFrames);
    redrawCanvas();
  };



  return (
    <div ref={containerRef} className="relative h-screen w-screen bg-white overflow-hidden">
      {/* Fullscreen Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute inset-0 z-0"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawingTouch}
        onTouchMove={drawTouch}
        onTouchEnd={stopDrawingTouch}
        onTouchCancel={stopDrawingTouch}
        style={{ 
          cursor: isDragging ? 'grabbing' :
                 isErasing ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><circle cx=\'12\' cy=\'12\' r=\'9\' fill=\'none\' stroke=\'%23ff3b30\' stroke-width=\'2\'/><line x1=\'8\' y1=\'8\' x2=\'16\' y2=\'16\' stroke=\'%23ff3b30\' stroke-width=\'2\'/><line x1=\'16\' y1=\'8\' x2=\'8\' y2=\'16\' stroke=\'%23ff3b30\' stroke-width=\'2\'/></svg>") 12 12, crosshair' : 
                 isSelecting && selectedPaths.length > 0 ? 'grab' :
                 isSelecting ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' fill=\'none\' stroke=\'%23007aff\' stroke-width=\'2\' stroke-dasharray=\'3,3\'/></svg>") 12 12, crosshair' : 
                 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\' viewBox=\'0 0 4 4\'><circle cx=\'2\' cy=\'2\' r=\'1\' fill=\'%23000\'/></svg>") 2 2, crosshair',
          touchAction: 'none' // Prevent default touch behaviors like scrolling and zooming
        }}
      />

      {/* Top Floating Toolbar */}
      <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-300 ${
        toolbarCollapsed ? 'translate-y-[-60px]' : 'translate-y-0'
      }`}>
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5 p-2">
          <div className="flex items-center gap-1">
            {/* Tool Panels */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => {
                  setActivePanel('draw');
                  setIsSelecting(false);
                  setIsErasing(false);
                  clearSelection();
                }}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  activePanel === 'draw' && !isSelecting && !isErasing
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <Brush className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => {
                  setActivePanel('select');
                  setIsErasing(false);
                  setIsSelecting(!isSelecting);
                  clearSelection();
                }}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  activePanel === 'select' && isSelecting
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <MousePointer className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => {
                  setActivePanel('erase');
                  setIsSelecting(false);
                  setIsErasing(!isErasing);
                  clearSelection();
                }}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  activePanel === 'erase' && isErasing
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="w-px h-8 bg-gray-200 mx-2" />

            {/* Color Picker */}
            <div className="relative flex items-center gap-2 px-3">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
                title="Color Picker"
              >
                <Palette className="w-5 h-5" />
              </button>
              <div 
                className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: currentColor }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Current Color"
              />
              
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                  <SketchPicker
                    color={currentColor}
                    onChange={(color) => setCurrentColor(color.hex)}
                  />
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-gray-200 mx-2" />

            {/* Brush Size Control */}
            <div className="flex items-center gap-2 px-3">
              <div className="flex flex-col items-center">
                <div 
                  className="rounded-full border" 
                  style={{ 
                    backgroundColor: currentColor,
                    width: Math.max(4, Math.min(brushSize * 2, 16)), 
                    height: Math.max(4, Math.min(brushSize * 2, 16)) 
                  }} 
                />
                <span className="text-xs text-gray-500 mt-1">{brushSize}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20 accent-blue-500"
              />
            </div>

            <div className="w-px h-8 bg-gray-200 mx-2" />

            {/* View Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  showGrid
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowOnionSkin(!showOnionSkin)}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  showOnionSkin
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Layers className="w-5 h-5" />
              </button>
            </div>

            <div className="w-px h-8 bg-gray-200 mx-2" />

            {/* Animation Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={playAnimation}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isPlaying
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button
                onClick={stopAnimation}
                className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <Square className="w-5 h-5" />
              </button>
            </div>

            <div className="w-px h-8 bg-gray-200 mx-2" />

            {/* Export Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={exportAsJSON}
                className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
                title="Export JSON"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <label className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 cursor-pointer" title="Import JSON">
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept=".json"
                  onChange={importFromJSON}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={isRecording ? stopVideoRecording : startVideoRecording}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={isRecording ? 'Stop Recording' : 'Record Video'}
              >
                {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            </div>

            <div className="w-px h-8 bg-gray-200 mx-2" />

            {/* FPS Control */}
            <div className="flex items-center gap-2 px-3">
              <span className="text-sm text-gray-600 min-w-[35px]">{fps} fps</span>
              <input
                type="range"
                min="1"
                max="60"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-16 accent-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Toolbar Collapse Button */}
        <button
          onClick={() => setToolbarCollapsed(!toolbarCollapsed)}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-full w-8 h-8 flex items-center justify-center shadow-lg border border-black/5 text-gray-600 hover:text-gray-800 transition-all duration-200"
        >
          {toolbarCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Actions Floating Panel */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5 p-2">
          <div className="flex flex-col gap-1">
            <button
              onClick={drawStickFigure}
              className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
              title="Add Stickman"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            <button
              onClick={clearFrame}
              className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
              title="Clear Frame"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowSaveModal(true)}
              className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
              title="Save Animation"
            >
              <Save className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowLoadModal(true)}
              className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
              title="Load Animation"
            >
              <Upload className="w-5 h-5" />
            </button>
            
            <button
              onClick={downloadGIF}
              disabled={isExporting}
              className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
              title="Export as GIF"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Selection Controls Panel */}
      {(selectedPaths.length > 0 || clipboard.length > 0) && (
        <div className="absolute top-20 left-4 z-20">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-800">
                {selectedPaths.length > 0 ? `${selectedPaths.length} selected` : 'Clipboard'}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              {selectedPaths.length > 0 && (
                <>
                  <button
                    onClick={copySelection}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  
                  <button
                    onClick={deleteSelection}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  
                  <button
                    onClick={clearSelection}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <MousePointer className="w-4 h-4" />
                    Clear
                  </button>
                </>
              )}
              
              {clipboard.length > 0 && (
                <button
                  onClick={pasteSelection}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
                >
                  <Copy className="w-4 h-4" />
                  Paste ({clipboard.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Timeline */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-300 ${
        timelineCollapsed ? 'translate-y-[80px]' : 'translate-y-0'
      }`}>
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-black/5 p-4 min-w-[600px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-800">Timeline</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Frame {currentFrame + 1} of {frames.length}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={addFrame}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
                  title="Add Frame"
                >
                  <Plus className="w-4 h-4" />
                </button>
                
                <button
                  onClick={duplicateFrame}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
                  title="Duplicate Frame"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                <button
                  onClick={deleteFrame}
                  disabled={frames.length === 1}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Delete Frame"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {frames.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFrame(index)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  index === currentFrame
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        
        {/* Timeline Collapse Button */}
        <button
          onClick={() => setTimelineCollapsed(!timelineCollapsed)}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-full w-8 h-8 flex items-center justify-center shadow-lg border border-black/5 text-gray-600 hover:text-gray-800 transition-all duration-200"
        >
          {timelineCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Save Animation</h3>
            <input
              type="text"
              placeholder="Enter animation name..."
              value={animationName}
              onChange={(e) => setAnimationName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && saveAnimation()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 p-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={saveAnimation}
                className="flex-1 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Load Animation</h3>
            <div className="max-h-96 overflow-y-auto">
              {savedAnimations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved animations found</p>
              ) : (
                <div className="space-y-3">
                  {savedAnimations.map((animation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-800">{animation.name}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(animation.date).toLocaleDateString()} • {animation.frames?.length || 0} frames
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadAnimation(animation)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteAnimation(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Status */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Exporting GIF...</h3>
            <p className="text-gray-600">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">Recording...</span>
          </div>
        </div>
      )}

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
};

export default StickmanAnimator;