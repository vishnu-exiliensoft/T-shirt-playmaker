import React, { useRef, useEffect, useState } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  TextureLoader,
  RepeatWrapping,
  SRGBColorSpace,
  DirectionalLight,
  PCFSoftShadowMap,
  ACESFilmicToneMapping,
} from "three";
import { OrbitControls, SoftShadows } from "@react-three/drei";
import { gsap } from "gsap"; // Import gsap

import Sidebar from "./Sidebar";
import {
  fetchFabricsData,
  fetchCollarsData,
  fetchButtonsData,
} from "./api/api";

function ShirtModel({
  fabricTextureUrl,
  buttonColor,
  repeatScale,
  showItalianCollar,
  showFranchCollar,
  collarFabricTextureUrl,
  selectedCollar,
  selectedSleeve,
  selectedWholeFabric,
  selectedBottom,
  selectedPlacket,
  selectedPocket,
  selectedLogoMesh,
  logoImageUrl,
  logoEnabled,
  showFrontView,
  selectedButton,
  selectedButtonHoleThreadColor,
}) {
  const gltf = useLoader(GLTFLoader, "/t-shirt.glb");
  const fabricTexture = useLoader(TextureLoader, fabricTextureUrl);
  const { gl } = useThree();
  const wholeFabricTexture = useLoader(
    TextureLoader,
    (selectedWholeFabric && selectedWholeFabric.imageUrl) || fabricTextureUrl
  );
  const loadedCollarTexture = useLoader(
    TextureLoader,
    collarFabricTextureUrl || fabricTextureUrl
  );
  // Always call hooks unconditionally; fallback to a transparent data URL when no logo selected
  const transparentPixel =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P8z/D/PwAI/wN5Zb0q1wAAAABJRU5ErkJggg==";
  const uploadedLogoTexture = useLoader(
    TextureLoader,
    logoImageUrl || transparentPixel
  );

  const ref = useRef();
  const groupRef = useRef();
  const [direction, setDirection] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const angularVelocityRef = useRef(0);
  const hasLoggedMeshesRef = useRef(false);

  useEffect(() => {
    if (groupRef.current) {
      gsap.to(groupRef.current.rotation, {
        y: showFrontView ? 0 : Math.PI,
        duration: 0.5, // Animation duration in seconds
        ease: "power2.out", // Easing function for smoother animation
      });
    }
  }, [showFrontView]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection((prev) => -prev);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      // apply inertial rotation + tiny auto rotation
      groupRef.current.rotation.y +=
        angularVelocityRef.current + direction * 0.00005;
      // damping for smooth easing
      angularVelocityRef.current *= 0.5;
      // avoid denormals
      if (Math.abs(angularVelocityRef.current) < 1e-6)
        angularVelocityRef.current = 0;
    }
  });

  useEffect(() => {

    if (gltf && gltf.scene) {
      gltf.scene.scale.set(1.8, 1.8, 1.8);
      gltf.scene.position.y = 0;

      fabricTexture.wrapS = RepeatWrapping;
      fabricTexture.wrapT = RepeatWrapping;
      fabricTexture.repeat.set(repeatScale, repeatScale);
      fabricTexture.colorSpace = SRGBColorSpace;
      if (gl && gl.capabilities) {
        fabricTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
      }

      // Configure logo texture to preserve original colors
      if (uploadedLogoTexture && logoImageUrl) {
        uploadedLogoTexture.colorSpace = SRGBColorSpace;
        uploadedLogoTexture.generateMipmaps = true;
        if (gl && gl.capabilities) {
          uploadedLogoTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
        }
        uploadedLogoTexture.needsUpdate = true;
      }

      if (wholeFabricTexture) {
        wholeFabricTexture.wrapS = RepeatWrapping;
        wholeFabricTexture.wrapT = RepeatWrapping;
        wholeFabricTexture.repeat.set(repeatScale, repeatScale);
        wholeFabricTexture.colorSpace = SRGBColorSpace;
        if (gl && gl.capabilities) {
          wholeFabricTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
        }
      }

      if (collarFabricTextureUrl) {
        loadedCollarTexture.wrapS = RepeatWrapping;
        loadedCollarTexture.wrapT = RepeatWrapping;
        loadedCollarTexture.repeat.set(repeatScale, repeatScale);
        loadedCollarTexture.colorSpace = SRGBColorSpace;
        if (gl && gl.capabilities) {
          loadedCollarTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
        }
      }

      const meshNameSet = new Set();
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          meshNameSet.add(child.name);
          child.castShadow = true;
          child.receiveShadow = true;

          // Hide SleeveRightLogo by making it fully transparent
          if ((child.name === "logo", "SleeveRightLogo")) {
            const matArray = Array.isArray(child.material)
              ? child.material.map((m) => m.clone())
              : [child.material.clone()];
            // child.visible = false;
            matArray.forEach((mat) => {
              mat.transparent = false;
              mat.alphaTest = 0.5;
              mat.opacity = 1;
              mat.depthWrite = true;
              mat.needsUpdate = true;
            });
            child.material = matArray.length === 1 ? matArray[0] : matArray;
          }

          // Apply Whole-Shirt fabric to specific meshes when selected
          if (selectedWholeFabric) {
            const wholeTargets = [
              "NormalLongThinSligt",
              "MaoFront",
              "half",
              "fullSleeves",
              "pocket",
              "front",
              "back",
              "Band",
              "MaoSlitsLongBack",
              "SlitsBack",
              "MaoSlitsBack",
              "LongSlitsBack",
              "front",
              "LongSlitsFront",
              "MaoFront",
              "MaoSlitsFront",
              "NormalLongThin",
              "NormalLongThinSligt",
              "NormalThin",
              "NormalThinSlits",
            ]; // extend as needed
            if (wholeTargets.includes(child.name)) {
              const matArray = Array.isArray(child.material)
                ? child.material.map((m) => m.clone())
                : [child.material.clone()];
              matArray.forEach((mat) => {
                mat.map = wholeFabricTexture;
                mat.roughness = 1;
                mat.metalness = 0.2;
                mat.envMapIntensity = 0;
                mat.needsUpdate = true;
              });
              child.material = matArray.length === 1 ? matArray[0] : matArray;
            }
          }

          if (selectedCollar && child.name === selectedCollar.backendkey) {
            const matArray = Array.isArray(child.material)
              ? child.material.map((m) => m.clone())
              : [child.material.clone()];

            matArray.forEach((mat) => {
              mat.map = fabricTexture;
              mat.roughness = 1;
              mat.metalness = 0.2;
              mat.envMapIntensity = 0;
              mat.needsUpdate = true;
            });

            child.material = matArray.length === 1 ? matArray[0] : matArray;
          }

          // Button styling based on selected button style - target specific button meshes
          const buttonMeshNames = [
            "NormalLongThinBtn",
            "btn"
          ];
          
          // Button hole thread meshes
          const buttonHoleThreadMeshNames = [
            "btnHole",
            "btnThread",
            "Band Thread",
            "NormalLongThinBtnThread",
            "NormalLongThinHole"
          ];
          
          // Debug: Check if this is a button mesh
          if (buttonMeshNames.includes(child.name)) {
          }
          
          if (selectedButton && buttonMeshNames.includes(child.name)) {
            
            // Make button mesh visible when button is selected
            child.visible = true;
            
            const matArray = Array.isArray(child.material)
              ? child.material.map((m) => m.clone())
              : [child.material.clone()];

            matArray.forEach((mat) => {
              // Apply button color from API if available
              if (selectedButton && selectedButton.color) {
                // Handle different color formats
                let colorValue = selectedButton.color;
                
                // If color doesn't start with #, add it
                if (typeof colorValue === 'string' && !colorValue.startsWith('#')) {
                  colorValue = '#' + colorValue;
                }
                
                
                mat.color.set(colorValue);
              }
              mat.metalness = 0.2;
              mat.roughness = 1;
              mat.envMapIntensity = 0;
              mat.needsUpdate = true;
            });

            child.material = matArray.length === 1 ? matArray[0] : matArray;
          }
          
          // Debug: Check if this is a button hole thread mesh
          if (buttonHoleThreadMeshNames.includes(child.name)) {
          }
          
          // Button hole thread styling - apply selected button hole thread color
          if (selectedButtonHoleThreadColor && buttonHoleThreadMeshNames.includes(child.name)) {
            
            // Make button hole thread mesh visible
            child.visible = true;
            
            const matArray = Array.isArray(child.material)
              ? child.material.map((m) => m.clone())
              : [child.material.clone()];

            matArray.forEach((mat) => {
              // Handle different color formats
              let colorValue = selectedButtonHoleThreadColor;
              
              // If color doesn't start with #, add it
              if (typeof colorValue === 'string' && !colorValue.startsWith('#')) {
                colorValue = '#' + colorValue;
              }
              
              
              mat.color.set(colorValue);
              
              mat.metalness = 0.2;
              mat.roughness = 1;
              mat.envMapIntensity = 0;
              mat.needsUpdate = true;
            });

            child.material = matArray.length === 1 ? matArray[0] : matArray;
          }

          // Logo meshes: hide all by default
          const logoMeshes = [
            "DownLogo",
            "fullSleevesLogo",
            "logo",
            "SleeveLeftLogo",
            "SleeveRightLogo",
          ];
          if (logoMeshes.includes(child.name)) {
            child.visible = false;
          }

          // Sleeve Start Dynamic
          const sleeveMeshes = ["half", "fullSleeves"];

          // Hide all sleeve meshes by default
          if (sleeveMeshes.includes(child.name)) {
            child.visible = false;
          }

          // Show only selected sleeve mesh
          if (
            (selectedSleeve === "half" && child.name === "half") ||
            (selectedSleeve === "fullSleeves" && child.name === "fullSleeves")
          ) {
            child.visible = true;
          }
          // Sleeve End Dynamic

          // Collar Start Dyanmic

          const collarsAndThread = [
            "classicc",
            "cut_away",
            "ClassicPolo",
            "Band",
            "front",
            "Slits",
            "MaoSlits",
            "NormalLongThin",
            "NormalThin",
            // "Long_Back",
            "btn",
            "NormalLongThinBtn",
            "NormalLongThinBtnThread",
            "btnHole",
            "NormalLongThinHole",
          ];

          // Hide all collars by default
          if (collarsAndThread.includes(child.name)) {
            child.visible = false;
          }

          // Show selected collar
          if (selectedCollar && child.name === selectedCollar.backendkey) {
            child.visible = true;
          }

          // If selectedCollar.backendkey is NOT "mao", show "Band" collar
          if (
            selectedCollar &&
            selectedCollar.backendkey !== "maoCollar" &&
            child.name === "Band"
          ) {
            child.visible = true;
          }

          // If selectedCollar.backendkey is NOT "maoCollar", show "Band" collar
          if (
            selectedCollar &&
            selectedCollar.backendkey !== "maoCollar" &&
            (child.name === "maoCollar" ||
              child.name === "MaoFront" ||
              child.name === "Bdand")
          ) {
            child.visible = false;
          }
          // Jab mao selected ho toh NormalLongThin, NormalThin, Long_Back bhi hide ho

          // If selectedCollar.backendkey is NOT "maoCollar", show "Band" collar
          if (
            selectedCollar &&
            selectedCollar.backendkey == "maoCollar" &&
            (child.name === "maoCollar" || child.name === "MaoFront")
          ) {
            child.visible = true;
          }

          if (
            selectedCollar &&
            selectedCollar.backendkey === "maoCollar" &&
            [
              "NormalLongThin",
              "NormalThin",
              // "Long_Back",
              "btn",
              "NormalLongThinBtn",
              "NormalLongThinBtnThread",
              "btnHole",
              "Slits",
              "NormalLongThinHole",
              "NormalLongThinSligt",
              "front",
              "MaoSlitsFront",
              "NormalThinSlits",
              "LongSlitsFront",
              "btnThread",
              // "MaoSlitsBack",
              "MaoSlitsLongBack",
              // "MaoFront",
              // "maoCollar",
              // "back",
              // "SlitsBack",
              // "LongSlitsBack",
            ].includes(child.name)
          ) {
            child.visible = false;
          }

          if (
            [
              "MaoSlitsLongBack",
              "MaoSlits",

              ,
              "RoundCuff",

              "2CuffBtn",
              "3CuffBtn",
              "1CuffBtn",
              "btn",

              "NormalThin",
              "front",
              "NormalLongThin",

              "AngleFlap",
              "ClassicAngle",
              "AngleFlapThread",
              "RoundFlopThread",
              "Neck",

              "DownLogo",
              "DownLogo001",
            ].includes(child.name)
          ) {
            child.visible = false;
          }

          // If selectedCollar.backendkey is NOT "mao", show "Band" collar
          if (
            selectedCollar &&
            selectedCollar.backendkey == "classicc" &&
            child.name === "front"
          ) {
            child.visible = true;
          }

          if (
            selectedCollar &&
            selectedCollar.backendkey === "classicc" &&
            [
              "NormalLongThin",
              "NormalThin",
              // "Long_Back",
              "btn",
              "NormalLongThinBtn",
              "NormalLongThinBtnThread",
              "btnHole",
              "Slits",
              "NormalLongThinHole",
              "NormalLongThinSligt",
              // "front",
              "MaoSlitsFront",
              "NormalThinSlits",
              "LongSlitsFront",
              "MaoSlitsBack",
              "MaoSlitsLongBack",
              "MaoFront",
              "maoCollar",
              // "Band",
            ].includes(child.name)
          ) {
            child.visible = false;
          }

          if (
            selectedCollar &&
            selectedCollar.backendkey == "cut_away" &&
            child.name === "front"
          ) {
            child.visible = true;
          }
          if (
            selectedCollar &&
            selectedCollar.backendkey == "ClassicPolo" &&
            child.name === "front"
          ) {
            child.visible = true;
          }
          // Collar End Dyanmic

          const BottomMesh = [
            "back",
            "MaoSlitsLongBack",
            "SlitsBack",
            "MaoSlitsBack",
            "LongSlitsBack",
          ];

          if (BottomMesh.includes(child.name)) {
            // Only show the mesh whose name matches selectedBottom; supports string or { backendkey }
            const selectedBottomKey =
              typeof selectedBottom === "string"
                ? selectedBottom
                : selectedBottom && selectedBottom.backendkey;
            child.visible =
              !!selectedBottomKey && child.name === selectedBottomKey;
          }

          // Placket Start Dynamic
          const PlacketMesh = [
            "front",
            "LongSlitsFront",
            "MaoFront",
            "MaoSlitsFront",
            "NormalLongThin",
            "NormalLongThinSligt",
            "NormalThin",
            "NormalThinSlits",
          ];

          if (PlacketMesh.includes(child.name)) {
            // Resolve target placket mesh by collar + placket selection
            const collarKey = selectedCollar && selectedCollar.backendkey;
            const selectedBottomKey =
              typeof selectedBottom === "string"
                ? selectedBottom
                : selectedBottom && selectedBottom.backendkey;
            const bottomKey = selectedBottomKey;

            // If user passed a direct mesh name as selectedPlacket, honor it
            let targetPlacketMesh = PlacketMesh.includes(selectedPlacket)
              ? selectedPlacket
              : null;

            if (targetPlacketMesh) {
              if (collarKey === "maoCollar") {
                //   "[DEBUG] Direct bottomKey sfdsfdfdfdf mesh override:", bottomKey
                // );
                // Mao collar variants
                if (bottomKey == "SlitsBack") {
                  targetPlacketMesh = "MaoSlitsFront";
                } else if (bottomKey == "LongSlitsBack") {
                  targetPlacketMesh = "MaoSlitsFront";
                } else {
                  targetPlacketMesh = "MaoFront";
                }
              } else if (selectedPlacket === "NormalThin") {
                if (bottomKey === "back") {
                  targetPlacketMesh = "NormalThin";
                } else if (bottomKey === "SlitsBack") {
                  targetPlacketMesh = "NormalThinSlits";
                } else if (bottomKey === "LongSlitsBack") {
                  targetPlacketMesh = "NormalThinSlits";
                }

                const BtnMesh =
                  gltf.scene && gltf.scene.getObjectByName
                    ? gltf.scene.getObjectByName("btn")
                    : null;
                if (BtnMesh) {
                  BtnMesh.visible = true;
                }

                const btnHoleMesh =
                  gltf.scene && gltf.scene.getObjectByName
                    ? gltf.scene.getObjectByName("btnHole")
                    : null;
                if (btnHoleMesh) {
                  btnHoleMesh.visible = true;
                }
              } else if (selectedPlacket === "front") {
                if (bottomKey === "back") {
                  targetPlacketMesh = "NormalThin";
                } else if (bottomKey === "SlitsBack") {
                  targetPlacketMesh = "NormalThinSlits";
                } else if (bottomKey === "LongSlitsBack") {
                  targetPlacketMesh = "NormalThinSlits";
                }

                const BtnMesh =
                  gltf.scene && gltf.scene.getObjectByName
                    ? gltf.scene.getObjectByName("btn")
                    : null;
                if (BtnMesh) {
                  BtnMesh.visible = true;
                }

                const btnHoleMesh =
                  gltf.scene && gltf.scene.getObjectByName
                    ? gltf.scene.getObjectByName("btnHole")
                    : null;
                if (btnHoleMesh) {
                  btnHoleMesh.visible = true;
                }
              } else if (selectedPlacket === "NormalLongThin") {
                if (bottomKey === "back") {
                  targetPlacketMesh = "NormalLongThin";
                } else if (bottomKey === "SlitsBack") {
                  targetPlacketMesh = "NormalLongThinSligt";
                } else if (bottomKey === "LongSlitsBack") {
                  targetPlacketMesh = "NormalLongThinSligt";
                }
                // Hide "Band" mesh specifically when NormalLongThin placket is selected
                const bandMesh =
                  gltf.scene && gltf.scene.getObjectByName
                    ? gltf.scene.getObjectByName("Band")
                    : null;
                if (bandMesh) {
                  bandMesh.visible = false;
                }
                const NormalLongThinBtnMesh =
                  gltf.scene && gltf.scene.getObjectByName
                    ? gltf.scene.getObjectByName("NormalLongThinBtn")
                    : null;
                if (NormalLongThinBtnMesh) {
                  NormalLongThinBtnMesh.visible = true;
                }
                const NormalLongThinBtnThreadMesh =
                  gltf.scene && gltf.scene.getObjectByName
                    ? gltf.scene.getObjectByName("NormalLongThinBtnThread")
                    : null;
                if (NormalLongThinBtnThreadMesh) {
                  NormalLongThinBtnThreadMesh.visible = true;
                }
                const NormalLongThinHoleMesh =
                  gltf.scene && gltf.scene.getObjectByName
                    ? gltf.scene.getObjectByName("NormalLongThinHole")
                    : null;
                if (NormalLongThinHoleMesh) {
                  NormalLongThinHoleMesh.visible = true;
                }
              } else {
                // Fallback for any other collar types
                targetPlacketMesh = selectedPlacket;
              }
            }

            child.visible = child.name === targetPlacketMesh;
          }
          // Placket End Dynamic

          // Pocket Start Dynamic
          if (child.name === "pocket") {
            // Show pocket only if selectedPocket is "yes"
            child.visible = selectedPocket === "yes";
          }
          // Pocket End Dynamic

          // Logo application: apply uploaded logo texture to selected logo mesh
          if (
            selectedLogoMesh &&
            child.name === selectedLogoMesh &&
            logoImageUrl &&
            logoEnabled
          ) {
            const matArray = Array.isArray(child.material)
              ? child.material.map((m) => m.clone())
              : [child.material.clone()];
            matArray.forEach((mat) => {
              mat.map = uploadedLogoTexture;
              // Fix logo orientation by flipping the texture
              if (mat.map) {
                mat.map.flipY = false; // This flips the texture vertically
                mat.map.wrapS = RepeatWrapping;
                mat.map.wrapT = RepeatWrapping;
                // Preserve original logo colors
                mat.map.colorSpace = SRGBColorSpace;
                mat.map.generateMipmaps = true;
                mat.map.anisotropy = 16; // High quality texture filtering
              }
              mat.transparent = true;
              mat.alphaTest = 0.3;
              mat.depthWrite = true;
              mat.needsUpdate = true;
            });
            child.material = matArray.length === 1 ? matArray[0] : matArray;
            child.visible = true;
          } else if (selectedLogoMesh && child.name === selectedLogoMesh) {
            // Hide logo mesh if logo is disabled
            child.visible = false;
          }
        }
      });

      if (!hasLoggedMeshesRef.current) {
        try {
          const allNames = Array.from(meshNameSet.values());
        } catch (e) {}
        hasLoggedMeshesRef.current = true;
      }
      ref.current = gltf.scene;
    }
  }, [
    gltf,
    fabricTexture,
    wholeFabricTexture,
    loadedCollarTexture,
    collarFabricTextureUrl,
    buttonColor,
    repeatScale,
    showItalianCollar,
    showFranchCollar,
    selectedCollar,
    selectedSleeve, // <-- yahan hona chahiye
    selectedWholeFabric,
    selectedBottom,
    selectedPlacket,
    selectedPocket,
    selectedLogoMesh,
    logoImageUrl,
    logoEnabled,
    uploadedLogoTexture,
    selectedButton, // <-- Added selectedButton dependency
    selectedButtonHoleThreadColor, // <-- Added selectedButtonHoleThreadColor dependency
  ]);

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        setIsDragging(true);
        dragStartXRef.current = e.clientX || (e.pointer && e.pointer.x) || 0;
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setIsDragging(false);
      }}
      onPointerOut={() => setIsDragging(false)}
      onPointerMove={(e) => {
        if (!isDragging) return;
        const x = e.clientX || (e.pointer && e.pointer.x) || 0;
        const deltaX = x - dragStartXRef.current;
        dragStartXRef.current = x;
        // accumulate angular velocity for smoother motion
        angularVelocityRef.current += deltaX * 0.003;
      }}
    >
      <primitive ref={ref} object={gltf.scene} />
    </group>
  );
}

function StudioLights() {
  const { scene } = useThree();

  useEffect(() => {
    const keyLight = new DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(5, 5, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 4096;
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.0002;
    keyLight.shadow.normalBias = 0.001;

    const fillLight = new DirectionalLight(0xffffff, 1.2);
    fillLight.position.set(-5, 5, 5);
    fillLight.castShadow = true;
    fillLight.shadow.mapSize.width = 2048;
    fillLight.shadow.height = 2048;
    fillLight.shadow.bias = -0.0005;
    fillLight.shadow.camera.far = 8;
    fillLight.shadow.normalBias = 0.05;

    const rimLight = new DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 0, 10);
    rimLight.castShadow = false;

    scene.add(keyLight, fillLight, rimLight);

    return () => {
      scene.remove(keyLight, fillLight, rimLight);
    };
  }, [scene]);

  return null;
}

export default function App() {
  // src/App.js ya kisi bhi component me
  useEffect(() => {
    document.title = "Playmaker Shirt Customizer";
  }, []);

  // Initialize prices from localStorage on component mount
  useEffect(() => {
    try {
      // Load saved selections and update prices
      const savedFabric = localStorage.getItem("pm_selectedFabric");
      const savedWholeFabric = localStorage.getItem("pm_selectedWholeFabric");
      const savedCollar = localStorage.getItem("pm_selectedCollar");
      const savedSleeve = localStorage.getItem("pm_selectedSleeve");
      const savedBottom = localStorage.getItem("pm_selectedBottom");
      const savedPlacket = localStorage.getItem("pm_selectedPlacket");
      const savedPocket = localStorage.getItem("pm_selectedPocket");
      const savedLogoMesh = localStorage.getItem("pm_selectedLogoMesh");
      const savedButton = localStorage.getItem("pm_selectedButton");

      if (savedFabric) {
        const fabric = JSON.parse(savedFabric);
        setSelectedOptionsPrices((prev) => ({
          ...prev,
          fabric: fabric?.price || 0,
        }));
      }
      if (savedWholeFabric) {
        const wholeFabric = JSON.parse(savedWholeFabric);
        setSelectedOptionsPrices((prev) => ({
          ...prev,
          wholeFabric: wholeFabric?.price || 0,
        }));
      }
      if (savedCollar) {
        const collar = JSON.parse(savedCollar);
        setSelectedOptionsPrices((prev) => ({
          ...prev,
          collar: collar?.price || 0,
        }));
      }
      if (savedSleeve) {
        const sleevePrice = savedSleeve === "fullSleeves" ? 50 : 0;
        setSelectedOptionsPrices((prev) => ({ ...prev, sleeve: sleevePrice }));
      }
      if (savedBottom) {
        try {
          const bottom = JSON.parse(savedBottom);
          setSelectedOptionsPrices((prev) => ({
            ...prev,
            bottom: bottom?.price || 0,
          }));
        } catch {
          // If not JSON, treat as string (no price)
          setSelectedOptionsPrices((prev) => ({
            ...prev,
            bottom: 0,
          }));
        }
      }
      if (savedPlacket) {
        try {
          const placket = JSON.parse(savedPlacket);
          setSelectedOptionsPrices((prev) => ({
            ...prev,
            placket: placket?.price || 0,
          }));
        } catch {
          // If not JSON, treat as string (no price)
          setSelectedOptionsPrices((prev) => ({
            ...prev,
            placket: 0,
          }));
        }
      }
      if (savedPocket) {
        try {
          const pocket = JSON.parse(savedPocket);
          setSelectedOptionsPrices((prev) => ({
            ...prev,
            pocket: pocket?.price || 0,
          }));
        } catch {
          // If not JSON, treat as string (no price)
          setSelectedOptionsPrices((prev) => ({
            ...prev,
            pocket: 0,
          }));
        }
      }
      if (savedLogoMesh) {
        setSelectedOptionsPrices((prev) => ({ ...prev, logo: 25 }));
      }
      if (savedButton) {
        const button = JSON.parse(savedButton);
        setSelectedOptionsPrices((prev) => ({
          ...prev,
          button: button?.price || 0,
        }));
      }
    } catch (err) {
    }
  }, []);

  // Add state for tracking prices
  const [selectedOptionsPrices, setSelectedOptionsPrices] = useState({
    fabric: 0,
    wholeFabric: 0,
    collar: 0,
    sleeve: 0,
    bottom: 0,
    placket: 0,
    pocket: 0,
    logo: 0,
    button: 0,
  });

  /**
   * Calculate Total Price Function
   * 
   * This function calculates the total price of the customized t-shirt by
   * adding up all the individual option prices. It ensures all prices
   * are properly parsed as numbers and handles any missing values.
   * 
   * @returns {number} The total price of all selected options
   */
  const calculateTotalPrice = () => {
    // Calculate fabric, collar, sleeve, bottom, placket, pocket, logo, and button prices
    const wholeFabricPrice = parseFloat(selectedOptionsPrices.wholeFabric) || 0; // Whole fabric price
    const collarPrice = parseFloat(selectedOptionsPrices.collar) || 0; // Collar price
    const sleevePrice = parseFloat(selectedOptionsPrices.sleeve) || 0; // Sleeve price
    const bottomPrice = parseFloat(selectedOptionsPrices.bottom) || 0; // Bottom price
    const placketPrice = parseFloat(selectedOptionsPrices.placket) || 0; // Placket price
    const pocketPrice = parseFloat(selectedOptionsPrices.pocket) || 0; // Pocket price
    const logoPrice = parseFloat(selectedOptionsPrices.logo) || 0; // Logo price
    const buttonPrice = parseFloat(selectedOptionsPrices.button) || 0; // Button price

    // Calculate total by adding all option prices
    const totalPrice = wholeFabricPrice + collarPrice + sleevePrice + bottomPrice + placketPrice + pocketPrice + logoPrice + buttonPrice;

    return totalPrice;
  };

  const [fabricsData, setFabricsData] = useState([]);
  const [selectedFabric, setSelectedFabric] = useState(() => {
    // Load from localStorage on component mount
    try {
      const savedFabric = localStorage.getItem("pm_selectedFabric");
      if (savedFabric) {
        return JSON.parse(savedFabric);
      }
      return null; // Will be set after fabrics are loaded
    } catch (err) {
      return null;
    }
  });
  const [collarsData, setCollarsData] = useState([]);
  const [selectedCollar, setSelectedCollar] = useState(() => {
    // Load from localStorage on component mount
    try {
      const savedCollar = localStorage.getItem("pm_selectedCollar");
      if (savedCollar) {
        return JSON.parse(savedCollar);
      }
      return null; // Will be set after collars are loaded
    } catch (err) {
      return null;
    }
  });
  const [buttonsData, setButtonsData] = useState([]);
  const [selectedButton, setSelectedButton] = useState(() => {
    // Load from localStorage on component mount
    try {
      const savedButton = localStorage.getItem("pm_selectedButton");
      if (savedButton) {
        return JSON.parse(savedButton);
      }
      return null; // Will be set after buttons are loaded
    } catch (err) {
      return null;
    }
  });
  
  const [selectedButtonHoleThreadColor, setSelectedButtonHoleThreadColor] = useState(() => {
    // Load from localStorage on component mount
    try {
      return localStorage.getItem("pm_selectedButtonHoleThreadColor") || "#000000";
    } catch (err) {
      return "#000000";
    }
  });
  
  // Loading screen states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // View toggle state
  const [showFrontView, setShowFrontView] = useState(true);
  
  // Progress states for add to cart
  const [showProgress, setShowProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [addToCartMessage, setAddToCartMessage] = useState("");
  const [buttonColor, setButtonColor] = useState(() => {
    // Load from localStorage on component mount
    try {
      return localStorage.getItem("pm_buttonColor") || "#888888";
    } catch (err) {
      return "#888888";
    }
  });
  const [repeatScale, setRepeatScale] = useState(() => {
    // Load from localStorage on component mount
    try {
      return parseFloat(localStorage.getItem("pm_repeatScale")) || 1;
    } catch (err) {
      return 1;
    }
  });
  const [showItalianCollar, setShowItalianCollar] = useState(() => {
    // Load from localStorage on component mount
    try {
      return localStorage.getItem("pm_showItalianCollar") === "true";
    } catch (err) {
      return false;
    }
  });
  const [showFranchCollar, setShowFranchCollar] = useState(() => {
    // Load from localStorage on component mount
    try {
      return localStorage.getItem("pm_showFranchCollar") === "true";
    } catch (err) {
      return false;
    }
  });
  const [collarFabricTextureUrl, setCollarFabricTextureUrl] = useState(() => {
    // Load from localStorage on component mount
    try {
      return localStorage.getItem("pm_collarFabricTextureUrl") || null;
    } catch (err) {
      return null;
    }
  });
  const [selectedWholeFabric, setSelectedWholeFabric] = useState(() => {
    // Load from localStorage on component mount
    try {
      const savedWholeFabric = localStorage.getItem("pm_selectedWholeFabric");
      if (savedWholeFabric) {
        return JSON.parse(savedWholeFabric);
      }
      return null; // Will be set after fabrics are loaded
    } catch (err) {
      return null;
    }
  });
  const [selectedBottom, setSelectedBottom] = useState(() => {
    // Load from localStorage on component mount
    try {
      const savedBottom = localStorage.getItem("pm_selectedBottom");
      if (savedBottom) {
        // Try to parse as JSON first (for object data)
        try {
          return JSON.parse(savedBottom);
        } catch {
          // If not JSON, return as string
          return savedBottom;
        }
      }
      return "back";
    } catch (err) {
      return "back";
    }
  });
  const [selectedPlacket, setSelectedPlacket] = useState(() => {
    // Load from localStorage on component mount
    try {
      const savedPlacket = localStorage.getItem("pm_selectedPlacket");
      if (savedPlacket) {
        // Try to parse as JSON first (for object data)
        try {
          return JSON.parse(savedPlacket);
        } catch {
          // If not JSON, return as string
          return savedPlacket;
        }
      }
      return "front";
    } catch (err) {
      return "front";
    }
  });
  const [selectedPocket, setSelectedPocket] = useState(() => {
    // Load from localStorage on component mount
    try {
      const savedPocket = localStorage.getItem("pm_selectedPocket");
      if (savedPocket) {
        // Try to parse as JSON first (for object data)
        try {
          return JSON.parse(savedPocket);
        } catch {
          // If not JSON, return as string
          return savedPocket;
        }
      }
      return null;
    } catch (err) {
      return null;
    }
  });
  const [selectedLogoMesh, setSelectedLogoMesh] = useState(() => {
    // Load from localStorage on component mount
    try {
      return localStorage.getItem("pm_selectedLogoMesh") || null;
    } catch (err) {
      return null;
    }
  });
  const [logoImageUrl, setLogoImageUrl] = useState(() => {
    // Load from localStorage on component mount
    try {
      return localStorage.getItem("pm_logoImageDataUrl") || null;
    } catch (err) {
      return null;
    }
  });
  const [logoEnabled, setLogoEnabled] = useState(() => {
    // Load from localStorage on component mount
    try {
      return localStorage.getItem("pm_logoEnabled") === "true";
    } catch (err) {
      return false;
    }
  });

  const fetchFabrics = async () => {
    try {
      const response = await fetchFabricsData();
      const fabrics = response.data;
      setFabricsData(fabrics);
      setLoadingProgress(25);
      if (fabrics.length > 0) {
        // Only set default if no saved selection exists
        if (!selectedFabric) {
          setSelectedFabric(fabrics[0]);
          // Update price for default selection
          const fabricPrice = parseFloat(fabrics[0]?.price) || 0;
          setSelectedOptionsPrices((prev) => ({
            ...prev,
            fabric: fabricPrice,
          }));
        }
        
        if (!selectedWholeFabric) {
          setSelectedWholeFabric(fabrics[0]);
          // Update price for default selection
          const wholeFabricPrice = parseFloat(fabrics[0]?.price) || 0;
          setSelectedOptionsPrices((prev) => ({
            ...prev,
            wholeFabric: wholeFabricPrice,
          }));
        }
      }
    } catch (error) {
    }
  };

  const fetchCollars = async () => {
    try {
      const response = await fetchCollarsData();
      const collars = response.data;
      setCollarsData(collars);
      setLoadingProgress(50);
      if (collars && collars.length > 0) {
        // Only set default if no saved selection exists
        if (!selectedCollar) {
          setSelectedCollar(collars[0]);
          setShowItalianCollar(collars[0].name === "Italian One Button");
          setShowFranchCollar(collars[0].name === "Franch Collar");
          
          // Update price for default collar selection
          const collarPrice = parseFloat(collars[0]?.price) || 0;
          setSelectedOptionsPrices((prev) => ({
            ...prev,
            collar: collarPrice,
          }));
        } else {
          // Update collar-specific settings for saved selection
          setShowItalianCollar(selectedCollar.name === "Italian One Button");
          setShowFranchCollar(selectedCollar.name === "Franch Collar");
        }
      }
    } catch (error) {
    }
  };

  const fetchButtons = async () => {
    try {
      const response = await fetchButtonsData();
      const buttons = response.data;
      setButtonsData(buttons);
      setLoadingProgress(75);
      if (buttons && buttons.length > 0) {
        // Only set default if no saved selection exists
        if (!selectedButton) {
          setSelectedButton(buttons[0]);
          setButtonColor(buttons[0].color);
          
          // Update price for default button selection
          const buttonPrice = parseFloat(buttons[0]?.price) || 0;
          setSelectedOptionsPrices((prev) => ({
            ...prev,
            button: buttonPrice,
          }));
        } else {
          // Update button color for saved selection
          setButtonColor(selectedButton.color);
        }
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchFabrics();
    fetchCollars();
    fetchButtons();
    
    // Complete loading after all data is fetched
    setTimeout(() => {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }, 1000);
  }, []);

  // Debug: Log total price whenever prices change
  useEffect(() => {
    const total = calculateTotalPrice();
  }, [selectedOptionsPrices]);

  const randomColor = () =>
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0");

  // Update price when fabric changes
  const setSelectedFabricWithPersistence = (fabric) => {
    setSelectedFabric(fabric);
    // Update price tracking
    setSelectedOptionsPrices((prev) => ({
      ...prev,
      fabric: fabric?.price || 0,
    }));
    // Save to localStorage
    try {
      localStorage.setItem("pm_selectedFabric", JSON.stringify(fabric));
    } catch (err) {}
  };

  // Update price when whole fabric changes
  const setSelectedWholeFabricWithPersistence = (fabric) => {
    setSelectedWholeFabric(fabric);
    // Update price tracking
    setSelectedOptionsPrices((prev) => ({
      ...prev,
      wholeFabric: fabric?.price || 0,
    }));
    // Save to localStorage
    try {
      localStorage.setItem("pm_selectedWholeFabric", JSON.stringify(fabric));
    } catch (err) {}
  };

  // Update price when collar changes
  const handleCollarSelection = (collar) => {
    setSelectedCollar(collar);
    // Update Italian collar visibility based on the selected collar
    setShowItalianCollar(collar.name === "Italian One Button");
    setShowFranchCollar(collar.name === "Franch Collar");
    // Update price tracking
    setSelectedOptionsPrices((prev) => ({
      ...prev,
      collar: collar?.price || 0,
    }));
    // Save to localStorage
    try {
      localStorage.setItem("pm_selectedCollar", JSON.stringify(collar));
      localStorage.setItem(
        "pm_showItalianCollar",
        (collar.name === "Italian One Button").toString()
      );
      localStorage.setItem(
        "pm_showFranchCollar",
        (collar.name === "Franch Collar").toString()
      );
    } catch (err) {}
  };

  // Update price when bottom changes
  const setSelectedBottomWithPersistence = (bottom) => {
    setSelectedBottom(bottom);
    // Update price tracking
    setSelectedOptionsPrices((prev) => ({
      ...prev,
      bottom: bottom?.price || 0,
    }));
    // Save to localStorage
    try {
      // Handle both string and object bottom data
      if (typeof bottom === 'string') {
        localStorage.setItem("pm_selectedBottom", bottom);
      } else {
        localStorage.setItem("pm_selectedBottom", JSON.stringify(bottom));
      }
    } catch (err) {}
  };

  // Update price when placket changes
  const setSelectedPlacketWithPersistence = (placket) => {
    setSelectedPlacket(placket);
    // Update price tracking
    setSelectedOptionsPrices((prev) => ({
      ...prev,
      placket: placket?.price || 0,
    }));
    // Save to localStorage
    try {
      // Handle both string and object placket data
      if (typeof placket === 'string') {
        localStorage.setItem("pm_selectedPlacket", placket);
      } else {
        localStorage.setItem("pm_selectedPlacket", JSON.stringify(placket));
      }
    } catch (err) {}
  };

  // Update price when pocket changes
  const setSelectedPocketWithPersistence = (pocket) => {
    setSelectedPocket(pocket);
    // Update price tracking
    setSelectedOptionsPrices((prev) => ({
      ...prev,
      pocket: pocket?.price || 0,
    }));
    // Save to localStorage
    try {
      // Handle both string and object pocket data
      if (typeof pocket === 'string') {
        localStorage.setItem("pm_selectedPocket", pocket);
      } else {
        localStorage.setItem("pm_selectedPocket", JSON.stringify(pocket));
      }
    } catch (err) {}
  };

  // Update price when logo changes
  const handleLogoSelection = (meshName) => {
    setSelectedLogoMesh(meshName);
    // Logo pricing logic - you can adjust this price
    const logoPrice = meshName ? 25 : 0; // Logo costs extra
    setSelectedOptionsPrices((prev) => ({
      ...prev,
      logo: logoPrice,
    }));
    // Save to localStorage
    try {
      localStorage.setItem("pm_selectedLogoMesh", meshName || "");
    } catch (err) {}
  };

  // Update price when button changes
  const handleButtonSelection = (button) => {
    setSelectedButton(button);
    setButtonColor(button.color);
    // Update price tracking
    setSelectedOptionsPrices((prev) => ({
      ...prev,
      button: button?.price || 0,
    }));
    // Save to localStorage
    try {
      localStorage.setItem("pm_selectedButton", JSON.stringify(button));
      localStorage.setItem("pm_buttonColor", button.color);
    } catch (err) {}
  };

  // Add missing functions
  const setRepeatScaleWithPersistence = (scale) => {
    setRepeatScale(scale);
    try {
      localStorage.setItem("pm_repeatScale", scale.toString());
    } catch (err) {}
  };

  const setCollarFabricTextureUrlWithPersistence = (url) => {
    setCollarFabricTextureUrl(url);
    try {
      localStorage.setItem("pm_collarFabricTextureUrl", url || "");
    } catch (err) {}
  };

  // Function to generate cropped image as blob
  const generateCroppedImageBlob = () => {
    return new Promise((resolve, reject) => {
      try {
        // Wait for the next frame to ensure the 3D model is fully rendered
        requestAnimationFrame(() => {
          // Get the canvas element from the Three.js renderer
          const canvas = document.querySelector('canvas');
          if (!canvas) {
            reject(new Error('Canvas not found'));
            return;
          }

          // Create a new canvas for cropping
          const croppedCanvas = document.createElement('canvas');
          const ctx = croppedCanvas.getContext('2d');
          
          // Set cropped canvas size (t-shirt specific dimensions)
          const cropWidth = 600;  // Increased width to capture full t-shirt
          const cropHeight = 800; // Adjusted height for better t-shirt framing
          
          croppedCanvas.width = cropWidth;
          croppedCanvas.height = cropHeight;
          
          // Calculate crop position (center the model with some padding)
          const sourceX = Math.max(0, (canvas.width - cropWidth) / 2);
          const sourceY = Math.max(0, (canvas.height - cropHeight) / 4); // Start from 1/4 down to capture full t-shirt
          
          // Draw the cropped portion
          ctx.drawImage(
            canvas,
            sourceX, sourceY, cropWidth, cropHeight, // Source rectangle
            0, 0, cropWidth, cropHeight // Destination rectangle
          );
          
          // Convert cropped canvas to blob with transparent background
          croppedCanvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from cropped canvas'));
            }
          }, 'image/png'); // PNG format for transparency
        });
        
      } catch (error) {
        reject(error);
      }
    });
  };

  // Utility function to clear all saved preferences
  const clearAllSavedPreferences = () => {
    try {
      localStorage.removeItem("pm_selectedFabric");
      localStorage.removeItem("pm_selectedCollar");
      localStorage.removeItem("pm_selectedButton");
      localStorage.removeItem("pm_buttonColor");
      localStorage.removeItem("pm_repeatScale");
      localStorage.removeItem("pm_showItalianCollar");
      localStorage.removeItem("pm_showFranchCollar");
      localStorage.removeItem("pm_collarFabricTextureUrl");
      localStorage.removeItem("pm_selectedWholeFabric");
      localStorage.removeItem("pm_selectedBottom");
      localStorage.removeItem("pm_selectedPlacket");
      localStorage.removeItem("pm_selectedPocket");
      localStorage.removeItem("pm_selectedSleeve");
      localStorage.removeItem("pm_selectedLogoMesh");
      localStorage.removeItem("pm_logoImageDataUrl");
      localStorage.removeItem("pm_logoEnabled");
    } catch (err) {
    }
  };

  const handleAddToCart = async () => {
    try {
      // Show full screen progress
      setAddToCartMessage("Generating product image...");
      setShowProgress(true);
      setProgressValue(10);
      
      // Generate cropped image blob
      const imageBlob = await generateCroppedImageBlob();
      setProgressValue(30);
      setAddToCartMessage("Uploading image...");
      
      // Convert blob to base64 for API
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result; // PNG with transparent background
        setProgressValue(50);
        setAddToCartMessage("Creating product...");
        
        const title = `Custom T-Shirt - ${
          selectedWholeFabric?.name || "Default Fabric"
        }`;
        
        // Build description with only sidebar items
        const descriptionParts = [];
        
        if (selectedWholeFabric?.name) {
          descriptionParts.push(`Fabric: ${selectedWholeFabric.name}`);
        }
        
        if (selectedCollar?.name) {
          descriptionParts.push(`Collar: ${selectedCollar.name}`);
        }
        
        if (selectedSleeve) {
          const sleeveName = selectedSleeve === "half" ? "Half Sleeves" : "Full Sleeves";
          descriptionParts.push(`Sleeves: ${sleeveName}`);
        }
        
        if (selectedBottom) {
          const bottomName = selectedBottom === "back" ? "Normal Back" : 
                            selectedBottom === "SlitsBack" ? "Slits Back" : 
                            selectedBottom === "LongSlitsBack" ? "Long Back" : selectedBottom;
          descriptionParts.push(`Bottom: ${bottomName}`);
        }
        
        if (selectedPlacket) {
          const placketName = selectedPlacket === "front" ? "Normal" : 
                             selectedPlacket === "NormalThin" ? "Normal Thin" : 
                             selectedPlacket === "NormalLongThin" ? "Normal Long Thin" : selectedPlacket;
          descriptionParts.push(`Placket: ${placketName}`);
        }
        
        if (selectedPocket) {
          descriptionParts.push(`Pocket: ${selectedPocket === "yes" ? "Yes" : "No"}`);
        }
        
        if (selectedButton?.name) {
          descriptionParts.push(`Button: ${selectedButton.name}`);
        }
        
        descriptionParts.push(`Final Price: SDG ${calculateTotalPrice()}`);
        
        const description = descriptionParts.join('<br/>');

        const customizationData = {
          type: "ADD_CUSTOM_SHIRT_TO_CART",
          payload: {
            title: title,
            description: description,
            price: calculateTotalPrice(),
            image: base64Image, // Base64 encoded PNG with transparent background
            customization_details: {
              // Only include sidebar items
              ...(selectedWholeFabric?.name && { "Fabric": selectedWholeFabric.name }),
              ...(selectedCollar?.name && { "Collar": selectedCollar.name }),
              ...(selectedSleeve && { "Sleeves": selectedSleeve === "half" ? "Half Sleeves" : "Full Sleeves" }),
              ...(selectedBottom && { "Bottom": selectedBottom }),
              ...(selectedPlacket && { "Placket": selectedPlacket }),
              ...(selectedPocket && { "Pocket": selectedPocket === "yes" ? "Yes" : "No" }),
              ...(selectedButton?.name && { "Button": selectedButton.name }),
              "Final Price": calculateTotalPrice(),
            },
          },
        };

        // Send data to the parent window (Shopify) using postMessage
        window.parent.postMessage(customizationData, "*");

        setProgressValue(80);
        setAddToCartMessage("Adding to cart...");
        
        // Complete progress after a short delay
        setTimeout(() => {
          setProgressValue(100);
          setAddToCartMessage("Product added to cart successfully!");
          setTimeout(() => {
            setShowProgress(false);
            setAddToCartMessage("");
          }, 1000);
        }, 2000);
      };
      
      reader.readAsDataURL(imageBlob);
      
    } catch (error) {
      setAddToCartMessage("Error generating product image. Please try again.");
      setShowProgress(false);
    }
  };

  // ...Sleeve Start..
  const [selectedSleeve, setSelectedSleeve] = useState(() => {
    // Load from localStorage on component mount
    try {
      return localStorage.getItem("pm_selectedSleeve") || "half";
    } catch (err) {
      return "half";
    }
  });

  const handleSleeveSelection = (sleeveKey) => {
    setSelectedSleeve(sleeveKey);
    // Save to localStorage
    try {
      localStorage.setItem("pm_selectedSleeve", sleeveKey);
    } catch (err) {}
  };

  // Wrapper function for sleeve selection with persistence
  const setSelectedSleeveWithPersistence = (sleeveKey) => {
    setSelectedSleeve(sleeveKey);
    // Save to localStorage
    try {
      localStorage.setItem("pm_selectedSleeve", sleeveKey);
    } catch (err) {}
  };

  // Function to handle sleeve price updates from component
  const handleSleevePriceUpdate = (price) => {
    setSelectedOptionsPrices((prev) => ({
      ...prev,
      sleeve: price,
    }));
  };
  // ...Sleeve End...

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-logo">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                <path d="M7 7h.01"/>
              </svg>
            </div>
            <h2>Playmaker T-Shirt Customizer</h2>
            <p>Loading your customization options...</p>
            <div className="loading-progress">
              <div className="loading-bar">
                <div 
                  className="loading-fill" 
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <span className="loading-percentage">{loadingProgress}%</span>
            </div>
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        fabrics={fabricsData}
        selectedFabric={selectedFabric}
        setSelectedFabric={setSelectedFabricWithPersistence}
        buttons={buttonsData}
        selectedButton={selectedButton}
        setSelectedButton={handleButtonSelection}
        buttonHoleThreadColors={buttonsData}
        selectedButtonHoleThreadColor={selectedButtonHoleThreadColor}
        setSelectedButtonHoleThreadColor={setSelectedButtonHoleThreadColor}
        buttonColor={buttonColor}
        setButtonColor={setButtonColor}
        repeatScale={repeatScale}
        setRepeatScale={setRepeatScaleWithPersistence}
        showItalianCollar={showItalianCollar}
        setShowItalianCollar={setShowItalianCollar}
        showFranchCollar={showFranchCollar}
        setShowFranchCollar={setShowFranchCollar}
        collarFabricTextureUrl={collarFabricTextureUrl}
        setCollarFabricTextureUrl={setCollarFabricTextureUrlWithPersistence}
        addToCartMessage={addToCartMessage}
        handleAddToCart={handleAddToCart}
        randomColor={randomColor}
        collars={collarsData}
        selectedCollar={selectedCollar}
        setSelectedCollar={handleCollarSelection}
        selectedSleeve={selectedSleeve}
        setSelectedSleeve={setSelectedSleeveWithPersistence}
        onPriceUpdate={handleSleevePriceUpdate}
        selectedWholeFabric={selectedWholeFabric}
        setSelectedWholeFabric={setSelectedWholeFabricWithPersistence}
        selectedBottom={selectedBottom}
        setSelectedBottom={setSelectedBottomWithPersistence}
        selectedPlacket={selectedPlacket}
        setSelectedPlacket={setSelectedPlacketWithPersistence}
        selectedPocket={selectedPocket}
        setSelectedPocket={setSelectedPocketWithPersistence}
        selectedLogoMesh={selectedLogoMesh}
        setSelectedLogoMesh={handleLogoSelection}
        logoImageUrl={logoImageUrl}
        setLogoImageUrl={(url) => {
          setLogoImageUrl(url);
          // Save to localStorage
          try {
            localStorage.setItem("pm_logoImageDataUrl", url || "");
          } catch (err) {}
        }}
        logoEnabled={logoEnabled}
        setLogoEnabled={(enabled) => {
          setLogoEnabled(enabled);
          // Save to localStorage
          try {
            localStorage.setItem("pm_logoEnabled", enabled.toString());
          } catch (err) {}
        }}
      />

      {selectedFabric && (
        <div className="canvas-container">
          <Canvas
            shadows
            className="main-canvas"
            camera={{ position: [0, 14, 2], fov: 42 }}
            dpr={[1.5, 2]}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              toneMapping: ACESFilmicToneMapping,
            }}
            onCreated={({ gl }) => {
              gl.outputColorSpace = SRGBColorSpace;
              gl.toneMappingExposure = 1.1;
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = PCFSoftShadowMap;
              gl.shadowMap.autoUpdate = true;
              gl.capabilities &&
                gl.getContext().getExtension("EXT_texture_filter_anisotropic");
            }}
          >
            <StudioLights />
            <SoftShadows size={10} samples={20} focus={0} flat={false} />
            {/* Backup: repeatScale was dynamic -> repeatScale={parseFloat(selectedFabric.textureRepeat)} */}
            <ShirtModel
              fabricTextureUrl={selectedFabric?.imageUrl}
              buttonColor={buttonColor}
              repeatScale={15}
              showItalianCollar={showItalianCollar}
              showFranchCollar={showFranchCollar}
              collarFabricTextureUrl={collarFabricTextureUrl}
              selectedCollar={selectedCollar}
              selectedSleeve={selectedSleeve}
              selectedWholeFabric={selectedWholeFabric}
              selectedBottom={selectedBottom}
              selectedPlacket={selectedPlacket}
              selectedPocket={selectedPocket}
              selectedLogoMesh={selectedLogoMesh}
              logoImageUrl={logoImageUrl}
              logoEnabled={logoEnabled}
              showFrontView={showFrontView}
              selectedButton={selectedButton}
              selectedButtonHoleThreadColor={selectedButtonHoleThreadColor}
            />
            <OrbitControls
              enableRotate={false}
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2.05}
              target={[0, 0.5, 0]}
            />
          </Canvas>
          <div className="custom-shirt-info">
            <h4 id="finalPrice">SDG {calculateTotalPrice()}</h4>
            <h2 className="fs-30">Custom T-Shirt</h2>

            {/* Price Breakdown - Base Price + Options with Pricing */}
            <div className="price-breakdown">
              {/* Base Price - Always show */}
              <div className="price-item base-price">
                <span>Custom T-Shirt: </span>
                <span>SDG 0</span>
              </div>

              {selectedOptionsPrices.wholeFabric > 0 && (
                <div className="price-item">
                  <span>Fabric: </span>
                  <span>SDG {selectedOptionsPrices.wholeFabric}</span>
                </div>
              )}

              {selectedOptionsPrices.collar > 0 && (
                <div className="price-item">
                  <span>Collar: </span>
                  <span>SDG {selectedOptionsPrices.collar}</span>
                </div>
              )}

              {selectedOptionsPrices.sleeve > 0 && (
                <div className="price-item">
                  <span>Sleeves: </span>
                  <span>SDG {selectedOptionsPrices.sleeve}</span>
                </div>
              )}

              {selectedOptionsPrices.bottom > 0 && (
                <div className="price-item">
                  <span>Bottom: </span>
                  <span>SDG {selectedOptionsPrices.bottom}</span>
                </div>
              )}

              {selectedOptionsPrices.placket > 0 && (
                <div className="price-item">
                  <span>Placket: </span>
                  <span>SDG {selectedOptionsPrices.placket}</span>
                </div>
              )}

              {selectedOptionsPrices.pocket > 0 && (
                <div className="price-item">
                  <span>Pocket: </span>
                  <span>SDG {selectedOptionsPrices.pocket}</span>
                </div>
              )}

              {selectedOptionsPrices.logo > 0 && (
                <div className="price-item">
                  <span>Logo: </span>
                  <span>SDG {selectedOptionsPrices.logo}</span>
                </div>
              )}

              {selectedOptionsPrices.button > 0 && (
                <div className="price-item">
                  <span>Button: </span>
                  <span>SDG {selectedOptionsPrices.button}</span>
                </div>
              )}

              {/* Total Price */}
              <div className="price-item total-price">
                <span>Total Price: </span>
                <span>SDG {calculateTotalPrice()}</span>
              </div>
            </div>

            <div className="button-group">
              <button className="continue-btn" onClick={handleAddToCart}>
                Continue
              </button>
              <button
                className="reset-btn"
                onClick={() => {
                  // Show confirmation dialog
                  if (
                    window.confirm(
                      "Are you sure you want to reset everything? This will clear all selections and refresh the page."
                    )
                  ) {
                    // Clear all localStorage
                    try {
                      localStorage.clear();
                    } catch (err) {
                    }

                    // Reset all state to default values
                    setSelectedOptionsPrices({
                      fabric: 0,
                      wholeFabric: 0,
                      collar: 0,
                      sleeve: 0,
                      bottom: 0,
                      placket: 0,
                      pocket: 0,
                      logo: 0,
                      button: 0,
                    });

                    // Refresh the page
                    window.location.reload();
                  }
                }}
              >
                Reset All
              </button>
            </div>
            <p className="delivery-note">Order Today, Receive in 2 weeks.</p>
          </div>
          <button
                className="view-toggle-btn"
                onClick={() => setShowFrontView((prev) => !prev)}
                style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "20px",
                  background: "rgba(255, 255, 255, 0.7)",
                  border: "none",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                  zIndex: 1000,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              </button>
        </div>
      )}

      {/* Progress Overlay */}
      {showProgress && (
        <div className="progress-overlay">
          <div className="progress-modal">
            <div className="progress-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                <path d="M7 7h.01" />
              </svg>
            </div>
            <h2>Saving Product...</h2>
            <p>{addToCartMessage}</p>
            <div className="progress-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressValue}%` }}
                ></div>
              </div>
              <span className="progress-percentage">{progressValue}%</span>
            </div>
            <div className="progress-spinner">
              <div className="spinner-ring"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
