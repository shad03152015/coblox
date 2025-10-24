import { colorMap } from "@/data/clothing";
import { hairColorMap } from "@/data/hair";
import { skinTones } from "@/data/body";

interface AvatarPreviewProps {
  shirt: { id: string; color: string };
  pants: { id: string; color: string };
  shoes: { id: string; color: string };
  body?: { type: string; skinTone: string };
  hair?: { baseStyle: string; elements: string[]; color: string };
}

export function AvatarPreview({ shirt, pants, shoes, body, hair }: AvatarPreviewProps) {
  const shirtColor = colorMap[shirt.color] || "#339af0";
  const pantsColor = colorMap[pants.color] || "#339af0";
  const shoesColor = colorMap[shoes.color] || "#333333";
  
  // Get skin tone color
  const skinTone = body?.skinTone || "tan";
  const skinToneObj = skinTones.find(t => t.id === skinTone);
  const skinColor = skinToneObj?.hex || "#c4a57b";
  
  // Get hair color
  const hairColor = hair?.color ? (hairColorMap[hair.color] || "#8B4513") : "#8B4513";
  
  // Determine body proportions based on body type
  const bodyType = body?.type || "average";
  let torsoWidth = 90;
  let armWidth = 25;
  let neckWidth = 26;
  
  if (bodyType === "slim") {
    torsoWidth = 75;
    armWidth = 20;
    neckWidth = 22;
  } else if (bodyType === "muscular") {
    torsoWidth = 105;
    armWidth = 30;
    neckWidth = 30;
  } else if (bodyType === "athletic") {
    torsoWidth = 95;
    armWidth = 27;
    neckWidth = 28;
  }
  
  // Hair style rendering
  const renderHair = () => {
    const baseStyle = hair?.baseStyle || "short-messy";
    
    // Different hair styles have different shapes
    switch (baseStyle) {
      case "short-messy":
        return (
          <>
            <div
              className="absolute rounded-t-lg"
              style={{
                top: "0px",
                left: "65px",
                width: "70px",
                height: "25px",
                backgroundColor: hairColor,
              }}
            />
            {/* Messy spikes */}
            <div
              className="absolute rounded-full"
              style={{
                top: "-5px",
                left: "80px",
                width: "12px",
                height: "12px",
                backgroundColor: hairColor,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "-3px",
                left: "105px",
                width: "10px",
                height: "10px",
                backgroundColor: hairColor,
              }}
            />
          </>
        );
      
      case "long-wavy":
        return (
          <>
            <div
              className="absolute rounded-t-lg"
              style={{
                top: "0px",
                left: "60px",
                width: "80px",
                height: "30px",
                backgroundColor: hairColor,
              }}
            />
            {/* Long wavy sides */}
            <div
              className="absolute rounded-lg"
              style={{
                top: "25px",
                left: "55px",
                width: "15px",
                height: "50px",
                backgroundColor: hairColor,
              }}
            />
            <div
              className="absolute rounded-lg"
              style={{
                top: "25px",
                left: "130px",
                width: "15px",
                height: "50px",
                backgroundColor: hairColor,
              }}
            />
          </>
        );
      
      case "slicked-back":
        return (
          <div
            className="absolute"
            style={{
              top: "0px",
              left: "68px",
              width: "64px",
              height: "22px",
              backgroundColor: hairColor,
              borderRadius: "50% 50% 0 0",
            }}
          />
        );
      
      case "top-bun":
        return (
          <>
            <div
              className="absolute rounded-t-lg"
              style={{
                top: "0px",
                left: "68px",
                width: "64px",
                height: "18px",
                backgroundColor: hairColor,
              }}
            />
            {/* Bun on top */}
            <div
              className="absolute rounded-full"
              style={{
                top: "-15px",
                left: "90px",
                width: "20px",
                height: "20px",
                backgroundColor: hairColor,
              }}
            />
          </>
        );
      
      case "spiky":
        return (
          <>
            <div
              className="absolute rounded-t-lg"
              style={{
                top: "0px",
                left: "68px",
                width: "64px",
                height: "20px",
                backgroundColor: hairColor,
              }}
            />
            {/* Multiple spikes */}
            <div
              className="absolute"
              style={{
                top: "-8px",
                left: "75px",
                width: "8px",
                height: "15px",
                backgroundColor: hairColor,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
            <div
              className="absolute"
              style={{
                top: "-10px",
                left: "92px",
                width: "8px",
                height: "18px",
                backgroundColor: hairColor,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
            <div
              className="absolute"
              style={{
                top: "-8px",
                left: "109px",
                width: "8px",
                height: "15px",
                backgroundColor: hairColor,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
          </>
        );
      
      case "ponytail":
        return (
          <>
            <div
              className="absolute rounded-t-lg"
              style={{
                top: "0px",
                left: "65px",
                width: "70px",
                height: "25px",
                backgroundColor: hairColor,
              }}
            />
            {/* Ponytail at back */}
            <div
              className="absolute rounded-lg"
              style={{
                top: "20px",
                left: "132px",
                width: "12px",
                height: "45px",
                backgroundColor: hairColor,
              }}
            />
          </>
        );
      
      default:
        return (
          <div
            className="absolute rounded-t-lg"
            style={{
              top: "0px",
              left: "65px",
              width: "70px",
              height: "25px",
              backgroundColor: hairColor,
            }}
          />
        );
    }
  };
  
  // Hair elements rendering
  const renderHairElements = () => {
    const elements = hair?.elements || [];
    
    return elements.map((element, index) => {
      switch (element) {
        case "bangs":
          return (
            <div
              key={`element-${index}`}
              className="absolute"
              style={{
                top: "25px",
                left: "70px",
                width: "60px",
                height: "12px",
                backgroundColor: hairColor,
                opacity: 0.8,
              }}
            />
          );
        
        case "braids":
          return (
            <div key={`element-${index}`}>
              <div
                className="absolute rounded-lg"
                style={{
                  top: "30px",
                  left: "53px",
                  width: "10px",
                  height: "60px",
                  backgroundColor: hairColor,
                  opacity: 0.9,
                }}
              />
              <div
                className="absolute rounded-lg"
                style={{
                  top: "30px",
                  left: "137px",
                  width: "10px",
                  height: "60px",
                  backgroundColor: hairColor,
                  opacity: 0.9,
                }}
              />
            </div>
          );
        
        case "clips":
          return (
            <div key={`element-${index}`}>
              <div
                className="absolute rounded-sm"
                style={{
                  top: "8px",
                  left: "72px",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#ff006e",
                }}
              />
              <div
                className="absolute rounded-sm"
                style={{
                  top: "8px",
                  left: "120px",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#ff006e",
                }}
              />
            </div>
          );
        
        case "hairband":
          return (
            <div
              key={`element-${index}`}
              className="absolute"
              style={{
                top: "18px",
                left: "62px",
                width: "76px",
                height: "6px",
                backgroundColor: "#00d9ff",
                borderRadius: "2px",
              }}
            />
          );
        
        case "feathers":
          return (
            <div
              key={`element-${index}`}
              className="absolute"
              style={{
                top: "5px",
                left: "125px",
                width: "20px",
                height: "30px",
                backgroundColor: "#22d3ee",
                opacity: 0.7,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                transform: "rotate(15deg)",
              }}
            />
          );
        
        default:
          return null;
      }
    });
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      {/* Simple 2D character illustration */}
      <div className="relative" style={{ width: "200px", height: "280px" }}>
        {/* Hair (rendered behind head) */}
        {renderHair()}
        
        {/* Head */}
        <div
          className="absolute rounded-lg"
          style={{
            top: "0px",
            left: "70px",
            width: "60px",
            height: "60px",
            backgroundColor: skinColor,
          }}
        />
        
        {/* Hair elements (rendered on top of hair) */}
        {renderHairElements()}

        {/* Eyes */}
        <div
          className="absolute"
          style={{
            top: "25px",
            left: "82px",
            width: "6px",
            height: "8px",
            backgroundColor: "#333",
            borderRadius: "2px",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "25px",
            left: "112px",
            width: "6px",
            height: "8px",
            backgroundColor: "#333",
            borderRadius: "2px",
          }}
        />

        {/* Neck */}
        <div
          className="absolute"
          style={{
            top: "60px",
            left: `${100 - neckWidth / 2}px`,
            width: `${neckWidth}px`,
            height: "15px",
            backgroundColor: skinColor,
          }}
        />

        {/* Torso (Shirt) */}
        <div
          className="absolute rounded"
          style={{
            top: "75px",
            left: `${100 - torsoWidth / 2}px`,
            width: `${torsoWidth}px`,
            height: "90px",
            backgroundColor: shirtColor,
          }}
        />

        {/* Arms (Shirt color) */}
        <div
          className="absolute rounded"
          style={{
            top: "80px",
            left: `${100 - torsoWidth / 2 - armWidth}px`,
            width: `${armWidth}px`,
            height: "80px",
            backgroundColor: shirtColor,
          }}
        />
        <div
          className="absolute rounded"
          style={{
            top: "80px",
            left: `${100 + torsoWidth / 2}px`,
            width: `${armWidth}px`,
            height: "80px",
            backgroundColor: shirtColor,
          }}
        />

        {/* Legs (Pants) */}
        <div
          className="absolute rounded"
          style={{
            top: "165px",
            left: "65px",
            width: "30px",
            height: "85px",
            backgroundColor: pantsColor,
          }}
        />
        <div
          className="absolute rounded"
          style={{
            top: "165px",
            left: "105px",
            width: "30px",
            height: "85px",
            backgroundColor: pantsColor,
          }}
        />

        {/* Feet (Shoes) */}
        <div
          className="absolute rounded"
          style={{
            top: "250px",
            left: "60px",
            width: "35px",
            height: "20px",
            backgroundColor: shoesColor,
          }}
        />
        <div
          className="absolute rounded"
          style={{
            top: "250px",
            left: "105px",
            width: "35px",
            height: "20px",
            backgroundColor: shoesColor,
          }}
        />
      </div>
    </div>
  );
}
