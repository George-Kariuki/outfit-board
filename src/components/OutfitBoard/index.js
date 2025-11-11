import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import {
  BoardContainer,
  GridOverlay,
  ImageItem,
  SelectionOutline,
  ResizeHandle,
  RotationHandle,
  Toolbar,
  ToolbarButton,
  OpacitySlider,
  ToolbarLabel,
} from './styles';

const OutfitBoard = ({
  inputImages = [],
  initialState = '',
  boardWidth = 350,
  boardHeight = 450,
  backgroundColor = '#FFFFFF',
  gridEnabled = false,
  gridSize = 20,
  exportTrigger = false,
  onExport,
  onStateChange,
  Styling = {},
}) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [rotationStart, setRotationStart] = useState({ angle: 0, centerX: 0, centerY: 0 });
  const [lastExportTrigger, setLastExportTrigger] = useState(false);
  
  const boardRef = useRef(null);
  const containerRef = useRef(null);

  const toolbarColor = Styling?.toolbarColor || '#000000';
  const handleColor = Styling?.handleColor || '#3B82F6';
  const selectionOutlineColor = Styling?.selectionOutlineColor || '#3B82F6';
  const shadowEnabled = Styling?.shadowEnabled !== false;
  const rotationHandleShape = Styling?.rotationHandleShape || 'circle';

  useEffect(() => {
    if (initialState) {
      try {
        const parsed = JSON.parse(initialState);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch (e) {
        console.error('Failed to parse initialState:', e);
      }
    }
  }, [initialState]);

  useEffect(() => {
    if (inputImages && inputImages.length > 0) {
      const newItems = inputImages.map((img, index) => {
        const existingItem = items.find(item => item.src === img);
        if (existingItem) return existingItem;
        
        return {
          id: `item-${Date.now()}-${index}`,
          src: img,
          x: 50 + (index * 60),
          y: 50 + (index * 60),
          width: 120,
          height: 120,
          rotation: 0,
          opacity: 1,
          zIndex: items.length + index + 1,
        };
      });
      
      setItems(prev => {
        const merged = [...prev];
        newItems.forEach(newItem => {
          if (!merged.find(item => item.id === newItem.id)) {
            merged.push(newItem);
          }
        });
        return merged;
      });
    }
  }, [inputImages]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange(JSON.stringify(items));
    }
  }, [items, onStateChange]);

  useEffect(() => {
    if (exportTrigger && !lastExportTrigger && boardRef.current) {
      handleExport();
      setLastExportTrigger(true);
    } else if (!exportTrigger) {
      setLastExportTrigger(false);
    }
  }, [exportTrigger, lastExportTrigger]);

  const handleExport = useCallback(async () => {
    if (!boardRef.current) return;
    
    try {
      const canvas = await html2canvas(boardRef.current, {
        backgroundColor: backgroundColor,
        useCORS: true,
        scale: 2,
        logging: false,
      });
      
      const base64 = canvas.toDataURL('image/png');
      if (onExport) {
        onExport(base64);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [backgroundColor, onExport]);

  const snapToGrid = (value, gridSize) => {
    if (!gridEnabled) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const updateItem = (id, updates) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handlePointerDown = (e, item, type = 'drag') => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (type === 'drag') {
      setSelectedItem(item.id);
      setIsDragging(true);
      setDragOffset({
        x: x - item.x,
        y: y - item.y,
      });
    } else if (type === 'resize') {
      setSelectedItem(item.id);
      setIsResizing(true);
      setResizeStart({
        x,
        y,
        width: item.width,
        height: item.height,
      });
    } else if (type === 'rotate') {
      setSelectedItem(item.id);
      setIsRotating(true);
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
      setRotationStart({
        angle: angle - item.rotation,
        centerX,
        centerY,
      });
    }
  };

  const handlePointerMove = useCallback((e) => {
    if (!selectedItem) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const item = items.find(i => i.id === selectedItem);
    if (!item) return;

    if (isDragging) {
      let newX = snapToGrid(x - dragOffset.x, gridSize);
      let newY = snapToGrid(y - dragOffset.y, gridSize);
      newX = Math.max(0, Math.min(newX, boardWidth - item.width));
      newY = Math.max(0, Math.min(newY, boardHeight - item.height));
      updateItem(selectedItem, { x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = x - resizeStart.x;
      const deltaY = y - resizeStart.y;
      const aspectRatio = resizeStart.width / resizeStart.height;
      let newWidth = Math.max(50, resizeStart.width + deltaX);
      let newHeight = newWidth / aspectRatio;
      
      if (newHeight < 50) {
        newHeight = 50;
        newWidth = newHeight * aspectRatio;
      }
      
      newWidth = snapToGrid(newWidth, gridSize);
      newHeight = snapToGrid(newHeight, gridSize);
      
      const maxWidth = boardWidth - item.x;
      const maxHeight = boardHeight - item.y;
      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);
      
      updateItem(selectedItem, { width: newWidth, height: newHeight });
    } else if (isRotating) {
      const angle = Math.atan2(y - rotationStart.centerY, x - rotationStart.centerX) * (180 / Math.PI);
      const newRotation = snapToGrid(angle - rotationStart.angle, 15);
      updateItem(selectedItem, { rotation: newRotation });
    }
  }, [selectedItem, isDragging, isResizing, isRotating, dragOffset, resizeStart, rotationStart, items, gridSize, boardWidth, boardHeight]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      return () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, isResizing, isRotating, handlePointerMove, handlePointerUp]);

  const handleDelete = () => {
    if (selectedItem) {
      setItems(prev => prev.filter(item => item.id !== selectedItem));
      setSelectedItem(null);
    }
  };

  const handleBringForward = () => {
    if (selectedItem) {
      const item = items.find(i => i.id === selectedItem);
      if (item) {
        const maxZ = Math.max(...items.map(i => i.zIndex));
        updateItem(selectedItem, { zIndex: maxZ + 1 });
      }
    }
  };

  const handleSendBackward = () => {
    if (selectedItem) {
      const item = items.find(i => i.id === selectedItem);
      if (item) {
        const minZ = Math.min(...items.map(i => i.zIndex));
        if (item.zIndex > minZ) {
          updateItem(selectedItem, { zIndex: item.zIndex - 1 });
        }
      }
    }
  };

  const handleOpacityChange = (e) => {
    if (selectedItem) {
      updateItem(selectedItem, { opacity: parseFloat(e.target.value) });
    }
  };

  const selectedItemData = items.find(item => item.id === selectedItem);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <BoardContainer
        ref={boardRef}
        width={boardWidth}
        height={boardHeight}
        backgroundColor={backgroundColor}
        onPointerDown={(e) => {
          if (e.target === boardRef.current || e.target === containerRef.current) {
            setSelectedItem(null);
          }
        }}
      >
        {gridEnabled && (
          <GridOverlay gridSize={gridSize} />
        )}
        
        {items.map((item) => (
          <React.Fragment key={item.id}>
            <ImageItem
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              rotation={item.rotation}
              opacity={item.opacity}
              zIndex={item.zIndex}
              shadowEnabled={shadowEnabled}
              onPointerDown={(e) => handlePointerDown(e, item, 'drag')}
            >
              <img src={item.src} alt="outfit item" draggable={false} />
            </ImageItem>
            
            {selectedItem === item.id && (
              <>
                <SelectionOutline
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  rotation={item.rotation}
                  color={selectionOutlineColor}
                />
                
                <ResizeHandle
                  style={{
                    left: item.x + item.width - 6,
                    top: item.y + item.height - 6,
                  }}
                  color={handleColor}
                  cursor="nwse-resize"
                  onPointerDown={(e) => handlePointerDown(e, item, 'resize')}
                />
                
                <RotationHandle
                  style={{
                    left: item.x + item.width / 2 - 6,
                    top: item.y - 20,
                  }}
                  color={handleColor}
                  shape={rotationHandleShape}
                  onPointerDown={(e) => handlePointerDown(e, item, 'rotate')}
                />
              </>
            )}
          </React.Fragment>
        ))}
      </BoardContainer>
      
      {selectedItemData && (
        <Toolbar color={toolbarColor}>
          <ToolbarLabel>Opacity:</ToolbarLabel>
          <OpacitySlider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={selectedItemData.opacity}
            onChange={handleOpacityChange}
          />
          <ToolbarButton onClick={handleBringForward} title="Bring Forward">
            ↑
          </ToolbarButton>
          <ToolbarButton onClick={handleSendBackward} title="Send Backward">
            ↓
          </ToolbarButton>
          <ToolbarButton onClick={handleDelete} title="Delete">
            ×
          </ToolbarButton>
        </Toolbar>
      )}
    </div>
  );
};

export default OutfitBoard;

