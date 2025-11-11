import React, { useState } from 'react';
import OutfitBoard from './index';

const Preview = () => {
  const [images] = useState([
    'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Shirt',
    'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Pants',
  ]);

  return (
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
      <OutfitBoard
        inputImages={images}
        boardWidth={400}
        boardHeight={500}
        backgroundColor="#FFFFFF"
        gridEnabled={true}
        gridSize={20}
        Styling={{
          toolbarColor: '#000000',
          handleColor: '#3B82F6',
          selectionOutlineColor: '#3B82F6',
          shadowEnabled: true,
          rotationHandleShape: 'circle',
        }}
      />
    </div>
  );
};

export default Preview;

