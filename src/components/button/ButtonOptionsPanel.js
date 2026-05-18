import React, { useState } from "react";

/**
 * ButtonOptionsPanel component displays button options with tabs for button color and hole thread color.
 * It slides in and out based on the isVisible prop.
 */
export default function ButtonOptionsPanel({
  buttons,
  selectedButton,
  setSelectedButton,
  buttonHoleThreadColors,
  selectedButtonHoleThreadColor,
  setSelectedButtonHoleThreadColor,
  isVisible,
}) {
  const [activeTab, setActiveTab] = useState("button");


  return (
    <div
      className={`fabric-options-container ${isVisible ? "is-visible" : ""}`}
    >
      <h3 className="fabric-options-title">Button Options</h3>
      
      {/* Tab Navigation */}
      <div className="button-tabs">
        <button
          className={`button-tab ${activeTab === "button" ? "active" : ""}`}
          onClick={() => setActiveTab("button")}
        >
          Button Color
        </button>
        <button
          className={`button-tab ${activeTab === "hole" ? "active" : ""}`}
          onClick={() => setActiveTab("hole")}
        >
          Button Hole Thread
        </button>
      </div>

      {/* Tab Content */}
      <div className="fabric-list-container">
        {activeTab === "button" ? (
          // Button Color Tab
          <>
            {buttons.length === 0 ? (
              <div className="loading-collars-message">Loading Buttons...</div>
            ) : (
              buttons.map((button) => {
                const isSelected =
                  selectedButton && selectedButton.name === button.name;

                return (
                  <div
                    key={button.name}
                    onClick={() => setSelectedButton(button)}
                    className={`fabric-option-item ${
                      isSelected ? "is-selected" : ""
                    }`}
                  >
                    <div className="fabric-thumbnail-wrapper">
                      <img
                        src={button.imageUrl || button.image}
                        alt={button.name}
                        className="fabric-option-thumbnail"
                      />
                    </div>
                    <div className="fabric-details">
                      <div className="fabric-name">{button.name}</div>
                      <div 
                        className="color-preview" 
                        style={{ backgroundColor: button.color }}
                        title={button.color}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        ) : (
          // Button Hole Thread Color Tab
          <>
            {buttonHoleThreadColors.length === 0 ? (
              <div className="loading-collars-message">Loading Button Hole Thread Colors...</div>
            ) : (
              buttonHoleThreadColors.map((button) => {
                const color = button.color;
                const colorName = button.name;
                const isSelected = selectedButtonHoleThreadColor === color;
                
                return (
                  <div
                    key={color}
                    onClick={() => setSelectedButtonHoleThreadColor(color)}
                    className={`fabric-option-item ${
                      isSelected ? "is-selected" : ""
                    }`}
                  >
                    <div className="fabric-thumbnail-wrapper">
                      <img
                        src={button.imageUrl || button.image}
                        alt={colorName}
                        className="fabric-option-thumbnail"
                      />
                    </div>
                    <div className="fabric-details">
                      <div className="fabric-name">{colorName}</div>
                      <div 
                        className="color-preview" 
                        style={{ backgroundColor: color }}
                        title={color}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
};