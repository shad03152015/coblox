import { colorMap } from "@/data/clothing";
import { hairColorMap } from "@/data/hair";
import { skinTones } from "@/data/body";
import { accessoryColorMap } from "@/data/accessories";

interface AvatarPreviewProps {
  shirt: { id: string; color: string };
  pants: { id: string; color: string };
  shoes: { id: string; color: string };
  body?: { type: string; skinTone: string };
  hair?: { baseStyle: string; elements: string[]; color: string };
  accessories?: {
    hat?: { id: string; color: string };
    glasses?: { id: string; color: string };
    jewelry?: { id: string; color: string };
    wings?: { id: string; color: string };
  };
}

export function AvatarPreview({ shirt, pants, shoes, body, hair, accessories }: AvatarPreviewProps) {
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

  // Accessory rendering functions
  const renderWings = () => {
    if (!accessories?.wings) return null;
    
    const wingsColor = accessoryColorMap[accessories.wings.color] || "#f5f5f5";
    const wingsId = accessories.wings.id;
    
    // Different wing styles
    switch (wingsId) {
      case "fairy-wings":
        return (
          <div key="wings">
            {/* Left wing */}
            <div
              className="absolute rounded-full"
              style={{
                top: "90px",
                left: "20px",
                width: "40px",
                height: "55px",
                backgroundColor: wingsColor,
                opacity: 0.7,
              }}
            />
            {/* Right wing */}
            <div
              className="absolute rounded-full"
              style={{
                top: "90px",
                left: "140px",
                width: "40px",
                height: "55px",
                backgroundColor: wingsColor,
                opacity: 0.7,
              }}
            />
          </div>
        );
      
      case "angel-wings":
        return (
          <div key="wings">
            {/* Left wing */}
            <div
              className="absolute"
              style={{
                top: "85px",
                left: "15px",
                width: "45px",
                height: "65px",
                backgroundColor: wingsColor,
                opacity: 0.8,
                borderRadius: "50% 0 0 50%",
              }}
            />
            {/* Right wing */}
            <div
              className="absolute"
              style={{
                top: "85px",
                left: "140px",
                width: "45px",
                height: "65px",
                backgroundColor: wingsColor,
                opacity: 0.8,
                borderRadius: "0 50% 50% 0",
              }}
            />
          </div>
        );
      
      case "dragon-wings":
        return (
          <div key="wings">
            {/* Left wing */}
            <div
              className="absolute"
              style={{
                top: "80px",
                left: "10px",
                width: "50px",
                height: "70px",
                backgroundColor: wingsColor,
                opacity: 0.75,
                clipPath: "polygon(100% 0%, 0% 50%, 100% 100%)",
              }}
            />
            {/* Right wing */}
            <div
              className="absolute"
              style={{
                top: "80px",
                left: "140px",
                width: "50px",
                height: "70px",
                backgroundColor: wingsColor,
                opacity: 0.75,
                clipPath: "polygon(0% 0%, 100% 50%, 0% 100%)",
              }}
            />
          </div>
        );
      
      case "butterfly-wings":
        return (
          <div key="wings">
            {/* Left upper wing */}
            <div
              className="absolute rounded-full"
              style={{
                top: "82px",
                left: "25px",
                width: "35px",
                height: "40px",
                backgroundColor: wingsColor,
                opacity: 0.7,
              }}
            />
            {/* Left lower wing */}
            <div
              className="absolute rounded-full"
              style={{
                top: "115px",
                left: "30px",
                width: "25px",
                height: "30px",
                backgroundColor: wingsColor,
                opacity: 0.7,
              }}
            />
            {/* Right upper wing */}
            <div
              className="absolute rounded-full"
              style={{
                top: "82px",
                left: "140px",
                width: "35px",
                height: "40px",
                backgroundColor: wingsColor,
                opacity: 0.7,
              }}
            />
            {/* Right lower wing */}
            <div
              className="absolute rounded-full"
              style={{
                top: "115px",
                left: "145px",
                width: "25px",
                height: "30px",
                backgroundColor: wingsColor,
                opacity: 0.7,
              }}
            />
          </div>
        );
      
      case "bat-wings":
        return (
          <div key="wings">
            {/* Left wing */}
            <div
              className="absolute"
              style={{
                top: "85px",
                left: "5px",
                width: "55px",
                height: "60px",
                backgroundColor: wingsColor,
                opacity: 0.8,
                clipPath: "polygon(100% 20%, 80% 0%, 60% 30%, 40% 10%, 20% 40%, 0% 30%, 100% 80%)",
              }}
            />
            {/* Right wing */}
            <div
              className="absolute"
              style={{
                top: "85px",
                left: "140px",
                width: "55px",
                height: "60px",
                backgroundColor: wingsColor,
                opacity: 0.8,
                clipPath: "polygon(0% 20%, 20% 0%, 40% 30%, 60% 10%, 80% 40%, 100% 30%, 0% 80%)",
              }}
            />
          </div>
        );
      
      case "rainbow-wings":
        return (
          <div key="wings">
            {/* Left wing with gradient effect using multiple layers */}
            <div
              className="absolute rounded-full"
              style={{
                top: "88px",
                left: "20px",
                width: "42px",
                height: "58px",
                background: "linear-gradient(135deg, #ff6b6b, #f06595, #9775fa, #22d3ee)",
                opacity: 0.7,
              }}
            />
            {/* Right wing */}
            <div
              className="absolute rounded-full"
              style={{
                top: "88px",
                left: "138px",
                width: "42px",
                height: "58px",
                background: "linear-gradient(225deg, #ff6b6b, #f06595, #9775fa, #22d3ee)",
                opacity: 0.7,
              }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderHat = () => {
    if (!accessories?.hat) return null;
    
    const hatColor = accessoryColorMap[accessories.hat.color] || "#333333";
    const hatId = accessories.hat.id;
    
    // Different hat styles
    switch (hatId) {
      case "bunny-ears":
        return (
          <div key="hat">
            {/* Left ear */}
            <div
              className="absolute rounded-lg"
              style={{
                top: "-30px",
                left: "72px",
                width: "15px",
                height: "35px",
                backgroundColor: hatColor,
              }}
            />
            {/* Right ear */}
            <div
              className="absolute rounded-lg"
              style={{
                top: "-30px",
                left: "113px",
                width: "15px",
                height: "35px",
                backgroundColor: hatColor,
              }}
            />
          </div>
        );
      
      case "top-hat":
        return (
          <div key="hat">
            {/* Hat base */}
            <div
              className="absolute"
              style={{
                top: "-12px",
                left: "60px",
                width: "80px",
                height: "8px",
                backgroundColor: hatColor,
                borderRadius: "4px",
              }}
            />
            {/* Hat top */}
            <div
              className="absolute"
              style={{
                top: "-35px",
                left: "75px",
                width: "50px",
                height: "28px",
                backgroundColor: hatColor,
                borderRadius: "4px 4px 0 0",
              }}
            />
          </div>
        );
      
      case "baseball-cap":
        return (
          <div key="hat">
            {/* Cap dome */}
            <div
              className="absolute rounded-t-lg"
              style={{
                top: "-8px",
                left: "68px",
                width: "64px",
                height: "20px",
                backgroundColor: hatColor,
              }}
            />
            {/* Cap bill */}
            <div
              className="absolute rounded-lg"
              style={{
                top: "10px",
                left: "55px",
                width: "35px",
                height: "6px",
                backgroundColor: hatColor,
              }}
            />
          </div>
        );
      
      case "beanie":
        return (
          <div
            key="hat"
            className="absolute rounded-t-lg"
            style={{
              top: "-10px",
              left: "65px",
              width: "70px",
              height: "22px",
              backgroundColor: hatColor,
            }}
          />
        );
      
      case "crown":
        return (
          <div key="hat">
            {/* Crown base */}
            <div
              className="absolute"
              style={{
                top: "-8px",
                left: "68px",
                width: "64px",
                height: "12px",
                backgroundColor: hatColor,
              }}
            />
            {/* Crown points */}
            <div
              className="absolute"
              style={{
                top: "-18px",
                left: "73px",
                width: "10px",
                height: "15px",
                backgroundColor: hatColor,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
            <div
              className="absolute"
              style={{
                top: "-18px",
                left: "95px",
                width: "10px",
                height: "15px",
                backgroundColor: hatColor,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
            <div
              className="absolute"
              style={{
                top: "-18px",
                left: "117px",
                width: "10px",
                height: "15px",
                backgroundColor: hatColor,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
          </div>
        );
      
      case "witch-hat":
        return (
          <div key="hat">
            {/* Hat brim */}
            <div
              className="absolute"
              style={{
                top: "-5px",
                left: "55px",
                width: "90px",
                height: "6px",
                backgroundColor: hatColor,
                borderRadius: "3px",
              }}
            />
            {/* Hat cone */}
            <div
              className="absolute"
              style={{
                top: "-40px",
                left: "80px",
                width: "40px",
                height: "40px",
                backgroundColor: hatColor,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderGlasses = () => {
    if (!accessories?.glasses) return null;
    
    const glassesColor = accessoryColorMap[accessories.glasses.color] || "#333333";
    const glassesId = accessories.glasses.id;
    
    // Different glasses styles
    switch (glassesId) {
      case "star-glasses":
        return (
          <div key="glasses">
            {/* Left lens - star shape */}
            <div
              className="absolute"
              style={{
                top: "22px",
                left: "75px",
                width: "16px",
                height: "16px",
                backgroundColor: glassesColor,
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
              }}
            />
            {/* Right lens - star shape */}
            <div
              className="absolute"
              style={{
                top: "22px",
                left: "109px",
                width: "16px",
                height: "16px",
                backgroundColor: glassesColor,
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
              }}
            />
            {/* Bridge */}
            <div
              className="absolute"
              style={{
                top: "28px",
                left: "91px",
                width: "18px",
                height: "3px",
                backgroundColor: glassesColor,
              }}
            />
          </div>
        );
      
      case "sunglasses":
        return (
          <div key="glasses">
            {/* Left lens */}
            <div
              className="absolute rounded"
              style={{
                top: "24px",
                left: "76px",
                width: "16px",
                height: "12px",
                backgroundColor: glassesColor,
              }}
            />
            {/* Right lens */}
            <div
              className="absolute rounded"
              style={{
                top: "24px",
                left: "108px",
                width: "16px",
                height: "12px",
                backgroundColor: glassesColor,
              }}
            />
            {/* Bridge */}
            <div
              className="absolute"
              style={{
                top: "28px",
                left: "92px",
                width: "16px",
                height: "3px",
                backgroundColor: glassesColor,
              }}
            />
          </div>
        );
      
      case "round-glasses":
        return (
          <div key="glasses">
            {/* Left lens */}
            <div
              className="absolute rounded-full"
              style={{
                top: "22px",
                left: "76px",
                width: "16px",
                height: "16px",
                border: `3px solid ${glassesColor}`,
                backgroundColor: "transparent",
              }}
            />
            {/* Right lens */}
            <div
              className="absolute rounded-full"
              style={{
                top: "22px",
                left: "108px",
                width: "16px",
                height: "16px",
                border: `3px solid ${glassesColor}`,
                backgroundColor: "transparent",
              }}
            />
            {/* Bridge */}
            <div
              className="absolute"
              style={{
                top: "30px",
                left: "92px",
                width: "16px",
                height: "3px",
                backgroundColor: glassesColor,
              }}
            />
          </div>
        );
      
      case "heart-glasses":
        return (
          <div key="glasses">
            {/* Left lens - heart shape */}
            <div
              className="absolute"
              style={{
                top: "22px",
                left: "76px",
                width: "16px",
                height: "16px",
                backgroundColor: glassesColor,
                transform: "rotate(45deg)",
                borderRadius: "50% 50% 0 50%",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "20px",
                left: "83px",
                width: "9px",
                height: "9px",
                backgroundColor: glassesColor,
              }}
            />
            {/* Right lens - heart shape */}
            <div
              className="absolute"
              style={{
                top: "22px",
                left: "108px",
                width: "16px",
                height: "16px",
                backgroundColor: glassesColor,
                transform: "rotate(45deg)",
                borderRadius: "50% 50% 0 50%",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "20px",
                left: "115px",
                width: "9px",
                height: "9px",
                backgroundColor: glassesColor,
              }}
            />
            {/* Bridge */}
            <div
              className="absolute"
              style={{
                top: "28px",
                left: "92px",
                width: "16px",
                height: "3px",
                backgroundColor: glassesColor,
              }}
            />
          </div>
        );
      
      case "nerd-glasses":
        return (
          <div key="glasses">
            {/* Left lens */}
            <div
              className="absolute"
              style={{
                top: "23px",
                left: "76px",
                width: "16px",
                height: "14px",
                border: `3px solid ${glassesColor}`,
                backgroundColor: "transparent",
                borderRadius: "2px",
              }}
            />
            {/* Right lens */}
            <div
              className="absolute"
              style={{
                top: "23px",
                left: "108px",
                width: "16px",
                height: "14px",
                border: `3px solid ${glassesColor}`,
                backgroundColor: "transparent",
                borderRadius: "2px",
              }}
            />
            {/* Bridge */}
            <div
              className="absolute"
              style={{
                top: "29px",
                left: "92px",
                width: "16px",
                height: "3px",
                backgroundColor: glassesColor,
              }}
            />
            {/* Tape on bridge */}
            <div
              className="absolute"
              style={{
                top: "28px",
                left: "98px",
                width: "4px",
                height: "6px",
                backgroundColor: "#f5f5f5",
                opacity: 0.8,
              }}
            />
          </div>
        );
      
      case "cat-eye-glasses":
        return (
          <div key="glasses">
            {/* Left lens */}
            <div
              className="absolute"
              style={{
                top: "24px",
                left: "76px",
                width: "18px",
                height: "11px",
                backgroundColor: "transparent",
                border: `3px solid ${glassesColor}`,
                borderRadius: "60% 40% 40% 40%",
                transform: "rotate(-5deg)",
              }}
            />
            {/* Right lens */}
            <div
              className="absolute"
              style={{
                top: "24px",
                left: "106px",
                width: "18px",
                height: "11px",
                backgroundColor: "transparent",
                border: `3px solid ${glassesColor}`,
                borderRadius: "40% 60% 40% 40%",
                transform: "rotate(5deg)",
              }}
            />
            {/* Bridge */}
            <div
              className="absolute"
              style={{
                top: "29px",
                left: "94px",
                width: "12px",
                height: "3px",
                backgroundColor: glassesColor,
              }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderJewelry = () => {
    if (!accessories?.jewelry) return null;
    
    const jewelryColor = accessoryColorMap[accessories.jewelry.color] || "#ffd700";
    const jewelryId = accessories.jewelry.id;
    
    // Different jewelry styles
    switch (jewelryId) {
      case "heart-necklace":
        return (
          <div key="jewelry">
            {/* Chain */}
            <div
              className="absolute"
              style={{
                top: "63px",
                left: "95px",
                width: "10px",
                height: "18px",
                borderLeft: `2px solid ${jewelryColor}`,
                borderRight: `2px solid ${jewelryColor}`,
                borderRadius: "50% 50% 0 0",
              }}
            />
            {/* Heart pendant */}
            <div
              className="absolute"
              style={{
                top: "78px",
                left: "92px",
                width: "16px",
                height: "16px",
                backgroundColor: jewelryColor,
                transform: "rotate(45deg)",
                borderRadius: "50% 50% 0 50%",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "76px",
                left: "99px",
                width: "9px",
                height: "9px",
                backgroundColor: jewelryColor,
              }}
            />
          </div>
        );
      
      case "gold-chain":
        return (
          <div key="jewelry">
            {/* Chain circles */}
            <div
              className="absolute rounded-full"
              style={{
                top: "65px",
                left: "88px",
                width: "8px",
                height: "8px",
                border: `2px solid ${jewelryColor}`,
                backgroundColor: "transparent",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "65px",
                left: "96px",
                width: "8px",
                height: "8px",
                border: `2px solid ${jewelryColor}`,
                backgroundColor: "transparent",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "65px",
                left: "104px",
                width: "8px",
                height: "8px",
                border: `2px solid ${jewelryColor}`,
                backgroundColor: "transparent",
              }}
            />
          </div>
        );
      
      case "pearl-necklace":
        return (
          <div key="jewelry">
            {/* Pearl beads */}
            <div
              className="absolute rounded-full"
              style={{
                top: "66px",
                left: "85px",
                width: "6px",
                height: "6px",
                backgroundColor: jewelryColor,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "66px",
                left: "92px",
                width: "6px",
                height: "6px",
                backgroundColor: jewelryColor,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "66px",
                left: "99px",
                width: "6px",
                height: "6px",
                backgroundColor: jewelryColor,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "66px",
                left: "106px",
                width: "6px",
                height: "6px",
                backgroundColor: jewelryColor,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "66px",
                left: "113px",
                width: "6px",
                height: "6px",
                backgroundColor: jewelryColor,
              }}
            />
          </div>
        );
      
      case "star-pendant":
        return (
          <div key="jewelry">
            {/* Chain */}
            <div
              className="absolute"
              style={{
                top: "63px",
                left: "95px",
                width: "10px",
                height: "18px",
                borderLeft: `2px solid ${jewelryColor}`,
                borderRight: `2px solid ${jewelryColor}`,
                borderRadius: "50% 50% 0 0",
              }}
            />
            {/* Star pendant */}
            <div
              className="absolute"
              style={{
                top: "78px",
                left: "90px",
                width: "20px",
                height: "20px",
                backgroundColor: jewelryColor,
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
              }}
            />
          </div>
        );
      
      case "gem-necklace":
        return (
          <div key="jewelry">
            {/* Chain */}
            <div
              className="absolute"
              style={{
                top: "63px",
                left: "95px",
                width: "10px",
                height: "18px",
                borderLeft: `2px solid ${jewelryColor}`,
                borderRight: `2px solid ${jewelryColor}`,
                borderRadius: "50% 50% 0 0",
              }}
            />
            {/* Gem pendant */}
            <div
              className="absolute"
              style={{
                top: "79px",
                left: "93px",
                width: "14px",
                height: "14px",
                backgroundColor: jewelryColor,
                clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
              }}
            />
          </div>
        );
      
      case "bow-tie":
        return (
          <div key="jewelry">
            {/* Left bow */}
            <div
              className="absolute"
              style={{
                top: "68px",
                left: "82px",
                width: "14px",
                height: "10px",
                backgroundColor: jewelryColor,
                borderRadius: "50% 0 0 50%",
              }}
            />
            {/* Right bow */}
            <div
              className="absolute"
              style={{
                top: "68px",
                left: "104px",
                width: "14px",
                height: "10px",
                backgroundColor: jewelryColor,
                borderRadius: "0 50% 50% 0",
              }}
            />
            {/* Center knot */}
            <div
              className="absolute"
              style={{
                top: "69px",
                left: "96px",
                width: "8px",
                height: "8px",
                backgroundColor: jewelryColor,
              }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      {/* Simple 2D character illustration */}
      <div className="relative" style={{ width: "200px", height: "280px" }}>
        {/* Wings (rendered behind everything) */}
        {renderWings()}
        
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
        
        {/* Hat (rendered on top of head/hair) */}
        {renderHat()}

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
        
        {/* Glasses (rendered on face) */}
        {renderGlasses()}

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
        
        {/* Jewelry (rendered on neck) */}
        {renderJewelry()}

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
