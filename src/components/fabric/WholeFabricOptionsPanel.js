// WholeFabricOptionsPanel.js
import React from "react";

/**
 * WholeFabricOptionsPanel mirrors FabricOptionsPanel, but is intended for selecting
 * a fabric that applies to the entire shirt. UI/structure kept same for familiarity.
 */
export default function WholeFabricOptionsPanel({
  fabrics,
  selectedWholeFabric,
  setSelectedWholeFabric,
  isVisible,
}) {
  return (
    <div
      className={`fabric-options-container ${isVisible ? "is-visible" : ""}`}
    >
      <h3 className="fabric-options-title">Select Whole-Shirt Fabric</h3>
      <div className="fabric-list-container">
        {fabrics.length === 0 ? (
          <div className="loading-fabrics-message">Loading fabrics...</div>
        ) : (
          fabrics.map((fabric) => {
            const isSelected =
              selectedWholeFabric && selectedWholeFabric.id === fabric.id;

            return (
              <div
                key={fabric.id}
                onClick={() => setSelectedWholeFabric(fabric)}
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
                  <div className="fabric-rating">
                    <span className="star-rating">★★★★☆</span> 4.5 (1379 votes)
                  </div>
                </div>
                <div className="fabric-price">
                  {fabric.price > 0 ? `SDG ${fabric.price}` : "Included"}
                </div>
                {/* <button className="ui-button info-button">INFO</button> */}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
