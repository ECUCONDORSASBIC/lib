'use client';

/**
 * A body diagram component for selecting body parts/regions
 * Used for symptom localization and pain mapping
 */
const BodyDiagram = ({
  selectedRegions = [],
  onRegionClick,
  showFront = true,
  showLabels = true
}) => {
  // Define body regions with their SVG coordinates and labels
  const bodyRegions = {
    head: {
      path: "M100,30 C100,13.4315 86.5685,0 70,0 C53.4315,0 40,13.4315 40,30 L40,60 L100,60 L100,30 Z",
      label: "Cabeza",
      viewBox: "0 0 140 80"
    },
    chest: {
      path: "M40,0 L100,0 L110,80 L30,80 L40,0 Z",
      label: "Pecho",
      viewBox: "0 0 140 80"
    },
    abdomen: {
      path: "M30,0 L110,0 L120,60 L20,60 L30,0 Z",
      label: "Abdomen",
      viewBox: "0 0 140 60"
    },
    leftArm: {
      path: "M0,0 L30,0 L25,100 L5,100 L0,0 Z",
      label: "Brazo izquierdo",
      viewBox: "0 0 30 100"
    },
    rightArm: {
      path: "M0,0 L30,0 L25,100 L5,100 L0,0 Z",
      label: "Brazo derecho",
      viewBox: "0 0 30 100"
    },
    leftLeg: {
      path: "M0,0 L40,0 L35,120 L5,120 L0,0 Z",
      label: "Pierna izquierda",
      viewBox: "0 0 40 120"
    },
    rightLeg: {
      path: "M0,0 L40,0 L35,120 L5,120 L0,0 Z",
      label: "Pierna derecha",
      viewBox: "0 0 40 120"
    },
    // Add more regions as needed for back view or more detailed regions
  };

  return (
    <div className="p-4">
      <div className="relative w-64 h-96 mx-auto">
        {/* Human body outline - simplified for this example */}
        <svg viewBox="0 0 200 400" className="w-full h-full">
          {/* Head */}
          <path
            d={bodyRegions.head.path}
            transform="translate(50, 10)"
            fill={selectedRegions.includes('head') ? "#90cdf4" : "#e2e8f0"}
            stroke="#4a5568"
            strokeWidth="2"
            onClick={() => onRegionClick('head')}
            className="cursor-pointer hover:fill-blue-200 transition-colors"
          />

          {/* Chest */}
          <path
            d={bodyRegions.chest.path}
            transform="translate(30, 70)"
            fill={selectedRegions.includes('chest') ? "#90cdf4" : "#e2e8f0"}
            stroke="#4a5568"
            strokeWidth="2"
            onClick={() => onRegionClick('chest')}
            className="cursor-pointer hover:fill-blue-200 transition-colors"
          />

          {/* Abdomen */}
          <path
            d={bodyRegions.abdomen.path}
            transform="translate(30, 150)"
            fill={selectedRegions.includes('abdomen') ? "#90cdf4" : "#e2e8f0"}
            stroke="#4a5568"
            strokeWidth="2"
            onClick={() => onRegionClick('abdomen')}
            className="cursor-pointer hover:fill-blue-200 transition-colors"
          />

          {/* Left Arm */}
          <path
            d={bodyRegions.leftArm.path}
            transform="translate(20, 70)"
            fill={selectedRegions.includes('leftArm') ? "#90cdf4" : "#e2e8f0"}
            stroke="#4a5568"
            strokeWidth="2"
            onClick={() => onRegionClick('leftArm')}
            className="cursor-pointer hover:fill-blue-200 transition-colors"
          />

          {/* Right Arm */}
          <path
            d={bodyRegions.rightArm.path}
            transform="translate(150, 70)"
            fill={selectedRegions.includes('rightArm') ? "#90cdf4" : "#e2e8f0"}
            stroke="#4a5568"
            strokeWidth="2"
            onClick={() => onRegionClick('rightArm')}
            className="cursor-pointer hover:fill-blue-200 transition-colors"
          />

          {/* Left Leg */}
          <path
            d={bodyRegions.leftLeg.path}
            transform="translate(50, 210)"
            fill={selectedRegions.includes('leftLeg') ? "#90cdf4" : "#e2e8f0"}
            stroke="#4a5568"
            strokeWidth="2"
            onClick={() => onRegionClick('leftLeg')}
            className="cursor-pointer hover:fill-blue-200 transition-colors"
          />

          {/* Right Leg */}
          <path
            d={bodyRegions.rightLeg.path}
            transform="translate(110, 210)"
            fill={selectedRegions.includes('rightLeg') ? "#90cdf4" : "#e2e8f0"}
            stroke="#4a5568"
            strokeWidth="2"
            onClick={() => onRegionClick('rightLeg')}
            className="cursor-pointer hover:fill-blue-200 transition-colors"
          />
        </svg>

        {/* Labels - if enabled */}
        {showLabels && selectedRegions.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium">Regiones seleccionadas:</p>
            <ul className="text-sm list-disc list-inside">
              {selectedRegions.map(region => (
                <li key={region} className="text-blue-600">
                  {bodyRegions[region]?.label || region}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyDiagram;
