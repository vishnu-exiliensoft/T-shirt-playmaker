import React, { useState } from "react";
import SelectedFabricDisplay from "./components/fabric/SelectedFabricDisplay";
import FabricOptionsPanel from "./components/fabric/FabricOptionsPanel";
import SelectedWholeFabricDisplay from "./components/fabric/SelectedWholeFabricDisplay";
import WholeFabricOptionsPanel from "./components/fabric/WholeFabricOptionsPanel";

import SelectedCollarDisplay from "./components/collar/SelectedCollarDisplay";
import CollarOptionsPanel from "./components/collar/CollarOptionsPanel";
import SleeveOptionsPanel from "./components/sleeve/SleeveOptionsPanel";
import SelectedSleeveDisplay from "./components/sleeve/SelectedSleeveDisplay";
import SelectedBottomDisplay from "./components/bottom/SelectedBottomDisplay";
import BottomOptionsPanel from "./components/bottom/BottomOptionsPanel"; // Import karein
import SelectedPlacketDisplay from "./components/placket/SelectedPlacketDisplay";
import PlacketOptionsPanel from "./components/placket/PlacketOptionsPanel";
import SelectedPocketDisplay from "./components/pocket/SelectedPocketDisplay";
import PocketOptionsPanel from "./components/pocket/PocketOptionsPanel";
import SelectedLogoDisplay from "./components/logo/SelectedLogoDisplay";
import LogoOptionsPanel from "./components/logo/LogoOptionsPanel";
import SelectedButtonDisplay from "./components/button/SelectedButtonDisplay";
import ButtonOptionsPanel from "./components/button/ButtonOptionsPanel";

/**
 * Sidebar component manages all UI controls for shirt customization.
 */
const Sidebar = ({
  fabrics,
  selectedFabric,
  setSelectedFabric,
  buttonColor,
  setButtonColor,
  repeatScale,
  setRepeatScale,
  showItalianCollar,
  setShowItalianCollar,
  showFranchCollar,
  setShowFranchCollar,
  collarFabricTextureUrl,
  setCollarFabricTextureUrl,
  addToCartMessage,
  handleAddToCart,
  randomColor,
  collars,
  selectedCollar,
  setSelectedCollar,
  selectedSleeve,
  setSelectedSleeve,
  selectedWholeFabric,
  setSelectedWholeFabric,
  selectedBottom,
  setSelectedBottom,
  selectedPlacket,
  setSelectedPlacket,
  selectedPocket,
  setSelectedPocket,
  selectedLogoMesh,
  setSelectedLogoMesh,
  logoImageUrl,
  setLogoImageUrl,
  logoEnabled,
  setLogoEnabled,
  buttons,
  selectedButton,
  setSelectedButton,
  buttonHoleThreadColors,
  selectedButtonHoleThreadColor,
  setSelectedButtonHoleThreadColor,
  onPriceUpdate,
}) => {
  const [showFabricOptions, setShowFabricOptions] = useState(false);
  const [showWholeFabricOptions, setShowWholeFabricOptions] = useState(false);
  const [showCollarOptions, setShowCollarOptions] = useState(false);
  const [showSleeveOptions, setShowSleeveOptions] = useState(false);
  const [showBottomOptions, setShowBottomOptions] = useState(false);
  const [showPlacketOptions, setShowPlacketOptions] = useState(false);
  const [showPocketOptions, setShowPocketOptions] = useState(false);
  const [showLogoOptions, setShowLogoOptions] = useState(false);
  const [showButtonOptions, setShowButtonOptions] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const togglePanel = (panel) => {
    const nextState = {
      fabric: false,
      whole: false,
      collar: false,
      sleeve: false,
      bottom: false,
      placket: false,
      pocket: false,
      logo: false,
      button: false,
    };
    const current = {
      fabric: showFabricOptions,
      whole: showWholeFabricOptions,
      collar: showCollarOptions,
      sleeve: showSleeveOptions,
      bottom: showBottomOptions,
      placket: showPlacketOptions,
      pocket: showPocketOptions,
      logo: showLogoOptions,
      button: showButtonOptions,
    }[panel];
    nextState[panel] = !current;

    setShowFabricOptions(nextState.fabric);
    setShowWholeFabricOptions(nextState.whole);
    setShowCollarOptions(nextState.collar);
    setShowSleeveOptions(nextState.sleeve);
    setShowBottomOptions(nextState.bottom);
    setShowPlacketOptions(nextState.placket);
    setShowPocketOptions(nextState.pocket);
    setShowLogoOptions(nextState.logo);
    setShowButtonOptions(nextState.button);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
    // Close all open panels
    setShowFabricOptions(false);
    setShowWholeFabricOptions(false);
    setShowCollarOptions(false);
    setShowSleeveOptions(false);
    setShowBottomOptions(false);
    setShowPlacketOptions(false);
    setShowPocketOptions(false);
    setShowLogoOptions(false);
    setShowButtonOptions(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="mobile-sidebar-toggle">
        <button 
          className="mobile-customize-btn"
          onClick={toggleMobileSidebar}
          aria-label="Toggle customization options"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
            <path d="M7 7h.01"/>
          </svg>
          <span>Customize</span>
        </button>
      </div>

      {/* Sidebar Content */}
      <div className={`ui-controls-container ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Close button for mobile */}
        <button 
          className="mobile-close-btn"
          onClick={closeMobileSidebar}
          aria-label="Close customization options"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      {/* All Selected Displays */}
      <div className="selected-displays-container">
        <SelectedWholeFabricDisplay
          selectedWholeFabric={selectedWholeFabric}
          onClick={() => togglePanel("whole")}
        />

        <SelectedCollarDisplay
          selectedCollar={selectedCollar}
          onClick={() => togglePanel("collar")}
        />

        <SelectedFabricDisplay
          selectedFabric={selectedFabric}
          onClick={() => togglePanel("fabric")}
        />

        <SelectedBottomDisplay
          selectedBottom={selectedBottom}
          onClick={() => togglePanel("bottom")}
        />

        <SelectedPlacketDisplay
          selectedPlacket={selectedPlacket}
          onClick={() => togglePanel("placket")}
        />

        <SelectedPocketDisplay
          selectedPocket={selectedPocket}
          onClick={() => togglePanel("pocket")}
        />

        {/* <SelectedLogoDisplay
          selectedLogoMesh={selectedLogoMesh}
          logoImageUrl={logoImageUrl}
          onClick={() => togglePanel("logo")}
        /> */}

        <SelectedSleeveDisplay
          selectedSleeve={selectedSleeve}
          onClick={() => {
            togglePanel("sleeve");
          }}
        />

        <SelectedButtonDisplay
          selectedButton={selectedButton}
          onClick={() => togglePanel("button")}
        />
      </div>

      {/* All Options Containers */}
      <div className="options-containers">
        <WholeFabricOptionsPanel
          fabrics={fabrics}
          selectedWholeFabric={selectedWholeFabric}
          setSelectedWholeFabric={(fabric) => {
            setSelectedWholeFabric(fabric);
            setShowWholeFabricOptions(false);
          }}
          isVisible={showWholeFabricOptions}
        />

        <CollarOptionsPanel
          collars={collars}
          selectedCollar={selectedCollar}
          setSelectedCollar={(collar) => {
            setSelectedCollar(collar);
            setShowCollarOptions(false);
          }}
          isVisible={showCollarOptions}
          showItalianCollar={showItalianCollar}
          setShowItalianCollar={(value) => {
            setShowItalianCollar(value);
            setShowCollarOptions(false);
          }}
          showFranchCollar={showFranchCollar}
          setShowFranchCollar={(value) => {
            setShowFranchCollar(value);
            setShowCollarOptions(false);
          }}
          collarFabricTextureUrl={collarFabricTextureUrl}
          setCollarFabricTextureUrl={(url) => {
            setCollarFabricTextureUrl(url);
            setShowCollarOptions(false);
          }}
        />

        <FabricOptionsPanel
          fabrics={fabrics}
          selectedFabric={selectedFabric}
          setSelectedFabric={(fabric) => {
            setSelectedFabric(fabric);
            setShowFabricOptions(false);
          }}
          isVisible={showFabricOptions}
          repeatScale={repeatScale}
          setRepeatScale={setRepeatScale}
        />

        <BottomOptionsPanel
          selectedBottom={selectedBottom}
          setSelectedBottom={(bottomKey) => {
            // normalize: ensure string key
            const key =
              typeof bottomKey === "string"
                ? bottomKey
                : (bottomKey && bottomKey.backendkey) || "";
            setSelectedBottom(key);
            setShowBottomOptions(false);
          }}
          isVisible={showBottomOptions}
        />

        <PlacketOptionsPanel
          selectedPlacket={selectedPlacket}
          setSelectedPlacket={(placketKey) => {
            setSelectedPlacket(placketKey);
            setShowPlacketOptions(false);
          }}
          isVisible={showPlacketOptions}
        />

        <PocketOptionsPanel
          selectedPocket={selectedPocket}
          setSelectedPocket={setSelectedPocket}
          isVisible={showPocketOptions}
          onSelection={() => setShowPocketOptions(false)}
        />

        {/* <LogoOptionsPanel
          isVisible={showLogoOptions}
          selectedLogoMesh={selectedLogoMesh}
          setSelectedLogoMesh={(mesh) => {
            setSelectedLogoMesh(mesh);
            // keep panel open so user can upload right after
          }}
          setLogoImageUrl={(url) => setLogoImageUrl(url)}
          logoEnabled={logoEnabled}
          setLogoEnabled={setLogoEnabled}
        /> */}

        <SleeveOptionsPanel
          selectedSleeve={selectedSleeve}
          setSelectedSleeve={setSelectedSleeve}
          isVisible={showSleeveOptions}
          onSelection={() => setShowSleeveOptions(false)}
          onPriceUpdate={onPriceUpdate}
        />

        <ButtonOptionsPanel
          buttons={buttons}
          selectedButton={selectedButton}
          setSelectedButton={(button) => {
            setSelectedButton(button);
            setShowButtonOptions(false);
          }}
          buttonHoleThreadColors={buttonHoleThreadColors}
          selectedButtonHoleThreadColor={selectedButtonHoleThreadColor}
          setSelectedButtonHoleThreadColor={(color) => {
            setSelectedButtonHoleThreadColor(color);
            localStorage.setItem("pm_selectedButtonHoleThreadColor", color);
          }}
          isVisible={showButtonOptions}
        />
      </div>


      </div>
    </>
  );
};

export default Sidebar;
