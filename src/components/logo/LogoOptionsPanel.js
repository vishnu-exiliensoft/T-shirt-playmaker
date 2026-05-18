import React, { useRef } from "react";

const AVAILABLE_LOGO_MESHES = [
  "DownLogo",
  "fullSleevesLogo",
  "logo",
  "SleeveLeftLogo",
  "SleeveRightLogo",
];

// Map logo meshes to their corresponding icon files
const LOGO_ICON_MAP = {
  "DownLogo": "/logo-icons/down_logo.png",
  "fullSleevesLogo": "/logo-icons/full-sleeveLogo.png",
  "logo": "/logo-icons/front_logo.png",
  "SleeveLeftLogo": "/logo-icons/left_sleeve.png",
  "SleeveRightLogo": "/logo-icons/right_sleeve.png",
};

export default function LogoOptionsPanel({
  isVisible,
  selectedLogoMesh,
  setSelectedLogoMesh,
  setLogoImageUrl,
  logoEnabled,
  setLogoEnabled,
}) {
  const fileInputRef = useRef(null);

  if (!isVisible) return null;

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setLogoImageUrl(dataUrl);
      try {
        localStorage.setItem("pm_logoImageDataUrl", dataUrl);
      } catch (err) {}
      // auto-enable logo display after upload
      try {
        if (typeof setLogoEnabled === "function") {
          setLogoEnabled(true);
          // Save to localStorage
          try {
            localStorage.setItem("pm_logoEnabled", "true");
          } catch (err) {}
        }
      } catch (err) {}
    };
    reader.readAsDataURL(file);
  };

  const handleLogoPositionClick = (meshName) => {
    setSelectedLogoMesh(meshName);
    // Save to localStorage
    try {
      localStorage.setItem("pm_selectedLogoMesh", meshName);
    } catch (err) {}
    // Automatically enable logo when position is selected
    if (typeof setLogoEnabled === "function") {
      setLogoEnabled(true);
      // Save to localStorage
      try {
        localStorage.setItem("pm_logoEnabled", "true");
      } catch (err) {}
    }
  };

  const handleLogoEnabledChange = (checked) => {
    setLogoEnabled(checked);
    // Save to localStorage
    try {
      localStorage.setItem("pm_logoEnabled", checked ? "true" : "false");
    } catch (err) {}
  };

  return (
    <div className={`fabric-options-container ${isVisible ? "is-visible" : ""}`}>
      <h3 className="fabric-options-title">Select Logo Position</h3>
      <div className="control-group" style={{ marginBottom: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={!!logoEnabled}
            onChange={(e) => handleLogoEnabledChange(e.target.checked)}
          />
          Show Logo
        </label>
      </div>
      <div className="fabric-list-container">
        {AVAILABLE_LOGO_MESHES.map((key) => {
          const isSelected = selectedLogoMesh === key;
          return (
            <div
              key={key}
              onClick={() => handleLogoPositionClick(key)}
              className={`fabric-option-item ${isSelected ? "is-selected" : ""}`}
            >
              <img src={LOGO_ICON_MAP[key] || "/placeholder.png"} alt={key} className="fabric-option-thumbnail" />
              <div className="fabric-details">
                <div className="fabric-name">{key}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="control-label" style={{ marginTop: 8 }}>Upload Logo</div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}


