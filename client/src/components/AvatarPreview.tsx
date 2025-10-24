import { colorMap } from "@/data/clothing";

interface AvatarPreviewProps {
  shirt: { id: string; color: string };
  pants: { id: string; color: string };
  shoes: { id: string; color: string };
}

export function AvatarPreview({ shirt, pants, shoes }: AvatarPreviewProps) {
  const shirtColor = colorMap[shirt.color] || "#339af0";
  const pantsColor = colorMap[pants.color] || "#339af0";
  const shoesColor = colorMap[shoes.color] || "#333333";

  return (
    <div className="flex items-center justify-center w-full h-full">
      {/* Simple 2D character illustration */}
      <div className="relative" style={{ width: "200px", height: "280px" }}>
        {/* Head */}
        <div
          className="absolute rounded-lg"
          style={{
            top: "0px",
            left: "70px",
            width: "60px",
            height: "60px",
            backgroundColor: "#c4a57b",
          }}
        />

        {/* Hair */}
        <div
          className="absolute rounded-t-lg"
          style={{
            top: "0px",
            left: "65px",
            width: "70px",
            height: "25px",
            backgroundColor: "#8B4513",
          }}
        />

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
            left: "87px",
            width: "26px",
            height: "15px",
            backgroundColor: "#c4a57b",
          }}
        />

        {/* Torso (Shirt) */}
        <div
          className="absolute rounded"
          style={{
            top: "75px",
            left: "55px",
            width: "90px",
            height: "90px",
            backgroundColor: shirtColor,
          }}
        />

        {/* Arms (Shirt color) */}
        <div
          className="absolute rounded"
          style={{
            top: "80px",
            left: "30px",
            width: "25px",
            height: "80px",
            backgroundColor: shirtColor,
          }}
        />
        <div
          className="absolute rounded"
          style={{
            top: "80px",
            left: "145px",
            width: "25px",
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
