import React, { Component } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import styles from './Styles';

// Helper that returns { rnSource, url } where
// rnSource: format to use directly in React Native <Image source={rnSource} />
// url: string url for web <img> or for konva/use-image
function normalizeImageValue(img) {
  // img can be:
  // - a string URL
  // - an object like { uri: 'https://...' }
  // - an object like { image: { uri: 'https://...' } }
  // - possibly a local require (number) for bundled assets
  if (!img) return null;

  // string e.g. "https://..."
  if (typeof img === 'string') {
    return { rnSource: { uri: img }, url: img };
  }

  // already a RN source object like { uri: 'https://...' }
  if (typeof img === 'object' && img.uri && typeof img.uri === 'string') {
    return { rnSource: img, url: img.uri };
  }

  // nested Adalo shape: { image: { uri: '...' } }
  if (img.image && img.image.uri) {
    return { rnSource: { uri: img.image.uri }, url: img.image.uri };
  }

  // If it's already a local require (number), use it directly for RN,
  // but we don't have a web url for konva in that case.
  if (typeof img === 'number') {
    return { rnSource: img, url: null };
  }

  // fallback: try to coerce to string
  const maybeUri = img?.uri || img?.image?.uri || String(img);
  if (maybeUri) {
    return { rnSource: { uri: maybeUri }, url: maybeUri };
  }

  return null;
}

const URLImage = ({ item, isSelected, onSelect, onTransformEnd, transformerRef }) => {
  const [image] = useImage(item.src);
  const shapeRef = React.useRef();
  
  React.useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected, transformerRef]);

  if (!item.visible || !image) return null;

  return (
    <Group
      ref={shapeRef}
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      opacity={item.opacity}
      scaleX={item.scaleX || 1}
      scaleY={item.scaleY || 1}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onTransformEnd({
          ...item,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        node.scaleX(1);
        node.scaleY(1);
        
        onTransformEnd({
          ...item,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          width: Math.max(50, item.width * scaleX),
          height: Math.max(50, item.height * scaleY),
        });
      }}
    >
      <KonvaImage
        image={image}
        width={item.width}
        height={item.height}
        listening={false}
      />
    </Group>
  );
};

class OutfitBoardWeb extends Component {
  stageRef = React.createRef();
  transformerRef = React.createRef();

  componentDidUpdate(prevProps) {
    const { selectedItemId, exportTrigger } = this.props;
    
    if (exportTrigger && !prevProps.exportTrigger) {
      this.handleExport();
    }
  }

  handleTransformEnd = (updatedItem) => {
    this.props.onUpdateItem(updatedItem.id, {
      x: updatedItem.x,
      y: updatedItem.y,
      rotation: updatedItem.rotation,
      width: updatedItem.width,
      height: updatedItem.height,
    });
  };

  handleExport = () => {
    const { onExport } = this.props;
    if (this.stageRef.current && onExport) {
      const dataURL = this.stageRef.current.toDataURL();
      onExport(dataURL);
    }
  };

  render() {
    const {
      items = [],
      selectedItemId,
      boardName,
      boardWidth = 640,
      boardHeight = 480,
      backgroundColor = '#FFFFFF',
      inputImages = [],
      onAddImage,
      onSelectItem,
      onDelete,
      onBringForward,
      onSendBackward,
      onOpacityChange,
      onToggleVisibility,
      onFlip,
      onRotate,
      onDuplicate,
      onBoardNameChange,
    } = this.props;

    const selectedItem = items.find(item => item.id === selectedItemId);
    const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);

    return (
      <div style={styles.container}>
        <div style={styles.editorSection}>
          <div style={styles.topToolbar}>
            <div style={styles.toolbarRow}>
              <div style={styles.nameInputContainer}>
                <input
                  style={styles.boardNameInput}
                  placeholder="Type Board Name Here"
                  maxLength={50}
                  value={boardName}
                  onChange={(e) => onBoardNameChange(e.target.value)}
                />
                <span style={styles.maxCharLabel}>{50 - boardName.length} max</span>
              </div>
              {selectedItem && (
                <div style={styles.actionButtons}>
                  <div style={styles.transparencySection}>
                    <span style={styles.transparencyLabel}>Transparency</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedItem.opacity || 1}
                      onChange={(e) => onOpacityChange(e.target.value)}
                      style={styles.transparencySlider}
                    />
                  </div>
                  <button
                    style={styles.toolbarButton}
                    onClick={onToggleVisibility}
                    title="Hide/Show"
                  >
                    👁️
                  </button>
                  <button
                    style={styles.toolbarButton}
                    onClick={() => onRotate(90)}
                    title="Rotate 90°"
                  >
                    🔄
                  </button>
                  <button
                    style={styles.toolbarButton}
                    onClick={onFlip}
                    title="Flip"
                  >
                    ↔️
                  </button>
                  <button
                    style={styles.toolbarButton}
                    onClick={onBringForward}
                    title="Bring Forward"
                  >
                    ↑
                  </button>
                  <button
                    style={styles.toolbarButton}
                    onClick={onSendBackward}
                    title="Send Backward"
                  >
                    ↓
                  </button>
                  <button
                    style={styles.toolbarButton}
                    onClick={onDuplicate}
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    style={styles.toolbarButton}
                    onClick={onDelete}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div style={styles.canvasContainer}>
            <div
              style={styles.canvasWrapper}
              onClick={(e) => {
                if (e.target === e.currentTarget || e.target.tagName === 'CANVAS') {
                  onSelectItem(null);
                }
              }}
            >
              <Stage
                ref={this.stageRef}
                width={boardWidth}
                height={boardHeight}
                style={{ backgroundColor }}
              >
                <Layer>
                  {sortedItems.map((item) => (
                    <URLImage
                      key={item.id}
                      item={item}
                      isSelected={item.id === selectedItemId}
                      onSelect={() => onSelectItem(item.id)}
                      onTransformEnd={this.handleTransformEnd}
                      transformerRef={this.transformerRef}
                    />
                  ))}
                  {selectedItemId && (
                    <Transformer
                      ref={this.transformerRef}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                    />
                  )}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
        
        <div style={styles.imageListSection}>
          <div style={styles.imageGallery}>
            {inputImages && inputImages.length > 0 ? (
              inputImages.map((image, index) => {
                // For web, we need the URL string for <img> tag
                // Normalize to get the URL string
                const normalized = normalizeImageValue(image);
                if (!normalized || !normalized.url) return null;
                
                return (
                  <div
                    key={index}
                    style={styles.imageThumbnailWrapper}
                    onClick={() => onAddImage(image)}
                  >
                    <img
                      src={normalized.url}
                      alt={`Image ${index + 1}`}
                      style={styles.imageThumbnail}
                    />
                  </div>
                );
              })
            ) : (
              <div style={styles.noImagesText}>
                No images available. Connect a list of images to inputImages prop.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default OutfitBoardWeb;
