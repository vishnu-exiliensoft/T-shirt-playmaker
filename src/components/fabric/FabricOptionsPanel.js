// FabricOptionsPanel.js
import React from "react";

/**
 * FabricOptionsPanel component displays the list of available fabric options.
 * It slides in and out based on the isVisible prop.
 * @param {object} props - The component props.
 * @param {Array<object>} props.fabrics - List of available fabric options.
 * @param {object} props.selectedFabric - The currently selected fabric object.
 * @param {function} props.setSelectedFabric - Function to update the selected fabric.
 * @param {boolean} props.isVisible - Controls the visibility and slide animation of the panel.
 */
export default function FabricOptionsPanel({
  fabrics,
  selectedFabric,
  setSelectedFabric,
  isVisible,
}) {
  return (
    <div
      className={`fabric-options-container ${isVisible ? "is-visible" : ""}`}
    >
      <h3 className="fabric-options-title">Select Fabric</h3>
      <div className="fabric-list-container">
        {fabrics.length === 0 ? (
          <div className="loading-fabrics-message">Loading fabrics...</div>
        ) : (
          fabrics.map((fabric) => {
            // Check if this fabric is the selected one
            const isSelected =
              selectedFabric && selectedFabric.id === fabric.id;

            return (
              <div
                key={fabric.id}
                onClick={() => setSelectedFabric(fabric)}
                className={`fabric-option-item ${
                  isSelected ? "is-selected" : ""
                }`}
              >
                <div className="fabric-thumbnail-wrapper">
                  <img
                    src={fabric.imageUrl}
                    alt={fabric.name}
                    className="fabric-option-thumbnail"
                  />
                </div>
                <div className="fabric-details">
                  <div className="fabric-name">{fabric.name}</div>
                  <div className="fabric-info">{fabric.info}</div>
                  {/* Placeholder for Rating - Add if you have rating data in metaobject */}
                  <div className="fabric-rating">
                    <span className="star-rating">★★★★☆</span> 4.5 (1379 votes)
                  </div>
                </div>
                {/* <div className="fabric-price">SDG {fabric.price}</div> */}
                {/* <button className="ui-button info-button">INFO</button> */}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
