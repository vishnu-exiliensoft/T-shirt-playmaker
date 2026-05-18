import React from "react";

/**
 * CollarOptionsPanel component displays the list of available collar options.
 * It slides in and out based on the isVisible prop.
 */
export default function CollarOptionsPanel({
  collars,
  selectedCollar,
  setSelectedCollar,
  isVisible,
}) {
  // Show only options where collar.collar_for === "Tshirt"
  const filteredCollars = collars.filter(
    (collar) => collar.collar_for === "Tshirt"
  );

  return (
    <div
      className={`fabric-options-container ${isVisible ? "is-visible" : ""}`}
    >
      <h3 className="fabric-options-title">Select Collar Style</h3>
      <div className="fabric-list-container">
        {filteredCollars.length === 0 ? (
          <div className="loading-collars-message">Loading collars...</div>
        ) : (
          filteredCollars.map((collar) => {
            // Check if this collar is the selected one
            const isSelected =
              selectedCollar && selectedCollar.name === collar.name;

            return (
              <div
                key={collar.name}
                onClick={() => setSelectedCollar(collar)}
                className={`fabric-option-item ${
                  isSelected ? "is-selected" : ""
                }`}
              >
                <div className="fabric-thumbnail-wrapper">
                  <img
                    src={collar.imageUrl}
                    alt={collar.name}
                    className="fabric-option-thumbnail"
                  />
                </div>
                <div className="fabric-details">
                  <div className="fabric-name">{collar.name}</div>
                  <div className="fabric-info">{collar.info}</div>
                  {/* <div className="fabric-info">{collar.backendkey}</div> */}
                  {/* <div className="fabric-info">{collar.collar_for}</div> */}
                  <div className="fabric-price">
                    {collar.price > 0 ? `SDG ${collar.price}` : "Included"}
                  </div>
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
