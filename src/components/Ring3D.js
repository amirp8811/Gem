import React, { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';

function RingModel() {
  const meshRef = useRef();

  // Load OBJ with MTL, use default material if needed
  const obj = useLoader(OBJLoader, '/ring/model.obj', (loader) => {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('/ring/model.mtl', (materials) => {
      materials.preload();
      loader.setMaterials(materials);
    }, undefined, (error) => {
      console.error('MTL loading failed:', error);
      // Set a default material if MTL fails
      loader.setMaterials(new THREE.MeshStandardMaterial({ color: '#ffdd44', metalness: 0.7, roughness: 0.3 }));
    });
  });

  // Animation on scroll
  useFrame(() => {
    if (meshRef.current) {
      const scrolled = window.pageYOffset;
      meshRef.current.rotation.y = scrolled * 0.01;
      meshRef.current.rotation.x = Math.sin(scrolled * 0.005) * 0.2;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={obj}
      scale={[0.5, 0.5, 0.5]}
      position={[0, 0, 0]}
    />
  );
}

function Ring3D() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px'
    }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[1, 1, 1]} intensity={0.8} />
        <RingModel />
      </Canvas>
    </div>
  );
}

export default Ring3D;
