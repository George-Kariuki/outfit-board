import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet, Image } from 'react-native';
import { Stage, Layer, Image as KonvaImage, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import OutfitBoardWeb from './OutfitBoard.web';

class OutfitBoard extends Component {
  state = {
    items: [],
    selectedItemId: null,
    boardName: '',
  };

  componentDidMount() {
    const { initialState, inputImages } = this.props;
    
    if (initialState) {
      try {
        const parsed = JSON.parse(initialState);
        if (Array.isArray(parsed)) {
          this.setState({ items: parsed });
        }
      } catch (e) {
        console.error('Failed to parse initialState:', e);
      }
    }

    if (inputImages && inputImages.length > 0) {
      this.addImagesFromList(inputImages);
    }
  }

  componentDidUpdate(prevProps) {
    const { inputImages, onStateChange, initialState } = this.props;
    const { items } = this.state;

    if (inputImages !== prevProps.inputImages && inputImages && inputImages.length > 0) {
      this.addImagesFromList(inputImages);
    }

    if (items !== prevProps.items && onStateChange) {
      onStateChange(JSON.stringify(items));
    }

    if (initialState !== prevProps.initialState && initialState) {
      try {
        const parsed = JSON.parse(initialState);
        if (Array.isArray(parsed)) {
          this.setState({ items: parsed });
        }
      } catch (e) {
        console.error('Failed to parse initialState:', e);
      }
    }
  }

  addImagesFromList = (images) => {
    if (!images || !Array.isArray(images)) return;
    
    const newItems = images.map((img, index) => {
      // Handle Adalo image format: { uri } or { uri, filename, size } or just string
      const imageUri = typeof img === 'string' ? img : (img?.uri || img?.image?.uri || img);
      if (!imageUri) return null;
      
      const existingItem = this.state.items.find(item => item.src === imageUri);
      if (existingItem) return null;
      
      return {
        id: `item-${Date.now()}-${index}`,
        src: imageUri,
        x: 50 + (index * 60),
        y: 50 + (index * 60),
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
        zIndex: this.state.items.length + index + 1,
        visible: true,
        flipped: false,
        scaleX: 1,
        scaleY: 1,
      };
    }).filter(Boolean);

    if (newItems.length > 0) {
      this.setState(prevState => ({
        items: [...prevState.items, ...newItems]
      }));
    }
  };

  addImageToCanvas = (imageData) => {
    // Handle Adalo image format: { uri } or { uri, filename, size } or just string
    const imageUri = typeof imageData === 'string' ? imageData : (imageData?.uri || imageData?.image?.uri || imageData);
    if (!imageUri) return;
    
    const newItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      src: imageUri,
      x: 50 + (this.state.items.length * 60),
      y: 50 + (this.state.items.length * 60),
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 1,
      zIndex: this.state.items.length + 1,
      visible: true,
      flipped: false,
      scaleX: 1,
      scaleY: 1,
    };
    this.setState(prevState => ({
      items: [...prevState.items, newItem],
      selectedItemId: newItem.id
    }));
  };

  updateItem = (id, updates) => {
    this.setState(prevState => ({
      items: prevState.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  handleSelectItem = (id) => {
    this.setState({ selectedItemId: id });
  };

  handleDelete = () => {
    const { selectedItemId } = this.state;
    if (selectedItemId) {
      this.setState(prevState => ({
        items: prevState.items.filter(item => item.id !== selectedItemId),
        selectedItemId: null
      }));
    }
  };

  handleBringForward = () => {
    const { selectedItemId, items } = this.state;
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        const maxZ = Math.max(...items.map(i => i.zIndex));
        this.updateItem(selectedItemId, { zIndex: maxZ + 1 });
      }
    }
  };

  handleSendBackward = () => {
    const { selectedItemId, items } = this.state;
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        const minZ = Math.min(...items.map(i => i.zIndex));
        if (item.zIndex > minZ) {
          this.updateItem(selectedItemId, { zIndex: item.zIndex - 1 });
        }
      }
    }
  };

  handleOpacityChange = (value) => {
    const { selectedItemId } = this.state;
    if (selectedItemId) {
      this.updateItem(selectedItemId, { opacity: parseFloat(value) });
    }
  };

  handleToggleVisibility = () => {
    const { selectedItemId, items } = this.state;
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        this.updateItem(selectedItemId, { visible: !item.visible });
      }
    }
  };

  handleFlip = () => {
    const { selectedItemId, items } = this.state;
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        this.updateItem(selectedItemId, { 
          flipped: !item.flipped,
          scaleX: item.flipped ? 1 : -1
        });
      }
    }
  };

  handleRotate = (degrees) => {
    const { selectedItemId, items } = this.state;
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        this.updateItem(selectedItemId, { rotation: item.rotation + degrees });
      }
    }
  };

  handleDuplicate = () => {
    const { selectedItemId, items } = this.state;
    if (selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (item) {
        const newItem = {
          ...item,
          id: `item-${Date.now()}-${Math.random()}`,
          x: item.x + 20,
          y: item.y + 20,
          zIndex: Math.max(...items.map(i => i.zIndex)) + 1,
        };
        this.setState(prevState => ({
          items: [...prevState.items, newItem],
          selectedItemId: newItem.id
        }));
      }
    }
  };

  isWeb = () => {
    return Platform.OS === 'web' || 
           (Platform.OS !== 'ios' && Platform.OS !== 'android');
  };

  render() {
    const { 
      inputImages = [], 
      boardWidth = 640, 
      boardHeight = 480, 
      backgroundColor = '#FFFFFF',
      exportTrigger,
      onExport,
    } = this.props;

    const { items, selectedItemId, boardName } = this.state;

    if (this.isWeb()) {
      return (
        <OutfitBoardWeb
          {...this.props}
          items={items}
          selectedItemId={selectedItemId}
          boardName={boardName}
          onAddImage={this.addImageToCanvas}
          onSelectItem={this.handleSelectItem}
          onUpdateItem={this.updateItem}
          onDelete={this.handleDelete}
          onBringForward={this.handleBringForward}
          onSendBackward={this.handleSendBackward}
          onOpacityChange={this.handleOpacityChange}
          onToggleVisibility={this.handleToggleVisibility}
          onFlip={this.handleFlip}
          onRotate={this.handleRotate}
          onDuplicate={this.handleDuplicate}
          onBoardNameChange={(name) => this.setState({ boardName: name })}
        />
      );
    }

    const selectedItem = items.find(item => item.id === selectedItemId);

    return (
      <View style={styles.container}>
        <View style={styles.editorSection}>
          <View style={styles.topToolbar}>
            <View style={styles.toolbarRow}>
              <View style={styles.nameInputContainer}>
                <TextInput
                  style={styles.boardNameInput}
                  placeholder="Type Board Name Here"
                  maxLength={50}
                  value={boardName}
                  onChangeText={(text) => this.setState({ boardName: text })}
                />
                <Text style={styles.maxCharLabel}>{50 - boardName.length} max</Text>
              </View>
              {selectedItem && (
                <View style={styles.actionButtons}>
                  <View style={styles.transparencySection}>
                    <Text style={styles.transparencyLabel}>Transparency</Text>
                    <View style={styles.sliderContainer}>
                      <Text style={styles.sliderValue}>
                        {Math.round((selectedItem.opacity || 1) * 100)}%
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.toolbarButton}
                    onPress={this.handleToggleVisibility}
                  >
                    <Text>👁️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.toolbarButton}
                    onPress={() => this.handleRotate(90)}
                  >
                    <Text>🔄</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.toolbarButton}
                    onPress={this.handleFlip}
                  >
                    <Text>↔️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.toolbarButton}
                    onPress={this.handleBringForward}
                  >
                    <Text>↑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.toolbarButton}
                    onPress={this.handleSendBackward}
                  >
                    <Text>↓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.toolbarButton}
                    onPress={this.handleDuplicate}
                  >
                    <Text>📋</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.toolbarButton}
                    onPress={this.handleDelete}
                  >
                    <Text>×</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.canvasContainer}>
            <View style={[styles.canvasWrapper, { 
              width: boardWidth, 
              height: boardHeight,
              backgroundColor 
            }]}>
              <Text style={styles.placeholderText}>Canvas Area</Text>
              <Text style={styles.placeholderSubtext}>
                Konva canvas will render here on web
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.imageListSection}>
          <View style={styles.imageGallery}>
            {inputImages && inputImages.length > 0 ? (
              inputImages.map((image, index) => {
                // Handle Adalo image format: { uri } or { uri, filename, size } or just string
                const imageUri = typeof image === 'string' ? image : (image?.uri || image?.image?.uri || image);
                if (!imageUri) return null;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.imageThumbnailWrapper}
                    onPress={() => this.addImageToCanvas(image)}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.imageThumbnail}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.noImagesText}>
                No images available. Connect a list of images to inputImages prop.
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  editorSection: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  imageListSection: {
    width: 300,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },
  topToolbar: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  nameInputContainer: {
    width: '50%',
  },
  boardNameInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  maxCharLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  transparencySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  transparencyLabel: {
    fontSize: 12,
    color: '#374151',
    marginRight: 8,
  },
  sliderContainer: {
    width: 120,
  },
  sliderValue: {
    fontSize: 12,
    color: '#374151',
  },
  toolbarButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: 'transparent',
    marginHorizontal: 4,
  },
  canvasContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  canvasWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 8,
  },
  imageGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    flex: 1,
  },
  imageThumbnailWrapper: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    margin: '1%',
    overflow: 'hidden',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
  },
  noImagesText: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
  },
});

export default OutfitBoard;
