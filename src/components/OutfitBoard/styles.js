import styled from 'styled-components';

export const BoardContainer = styled.div`
  position: relative;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background-color: ${props => props.backgroundColor || '#FFFFFF'};
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  touch-action: none;
  user-select: none;
`;

export const GridOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(${props => props.gridSize}px solid transparent, transparent),
    linear-gradient(90deg, ${props => props.gridSize}px solid transparent, transparent);
  background-size: ${props => props.gridSize}px ${props => props.gridSize}px;
  background-position: 0 0, 0 0;
  pointer-events: none;
  opacity: 0.1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(to right, #E5E7EB 1px, transparent 1px),
      linear-gradient(to bottom, #E5E7EB 1px, transparent 1px);
    background-size: ${props => props.gridSize}px ${props => props.gridSize}px;
  }
`;

export const ImageItem = styled.div`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  transform: rotate(${props => props.rotation || 0}deg);
  opacity: ${props => props.opacity || 1};
  cursor: move;
  z-index: ${props => props.zIndex || 1};
  box-shadow: ${props => props.shadowEnabled ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
  }
`;

export const SelectionOutline = styled.div`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  transform: rotate(${props => props.rotation || 0}deg);
  border: 2px dashed ${props => props.color || '#3B82F6'};
  pointer-events: none;
  z-index: 1000;
  box-sizing: border-box;
`;

export const ResizeHandle = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: ${props => props.color || '#3B82F6'};
  border: 2px solid #FFFFFF;
  border-radius: 50%;
  cursor: ${props => props.cursor || 'nwse-resize'};
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.2);
  }
`;

export const RotationHandle = styled.div`
  position: absolute;
  width: ${props => props.shape === 'circle' ? '12px' : '8px'};
  height: ${props => props.shape === 'circle' ? '12px' : '8px'};
  background-color: ${props => props.color || '#3B82F6'};
  border: 2px solid #FFFFFF;
  border-radius: ${props => props.shape === 'circle' ? '50%' : '2px'};
  cursor: grab;
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.2);
  }
  
  &:active {
    cursor: grabbing;
  }
`;

export const Toolbar = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.color || '#000000'};
  padding: 8px 16px;
  border-radius: 24px;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const ToolbarButton = styled.button`
  background: transparent;
  border: none;
  color: #FFFFFF;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export const OpacitySlider = styled.input`
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #FFFFFF;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #FFFFFF;
    cursor: pointer;
    border: none;
  }
`;

export const ToolbarLabel = styled.span`
  color: #FFFFFF;
  font-size: 12px;
  margin-right: 4px;
`;

