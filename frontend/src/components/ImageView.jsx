import { Download, X } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

function ImageView({ imageSrc, setIsVeiwingImage }) {
  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "downloaded-image.png";
      document.body.appendChild(link);
      link.click();

      toast.success("Image downloading...");
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download image");
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="relative w-full h-full p-1 flex bg-black">
      <div className="absolute p-1 flex items-center w-full top-0 left-0 bg-base-content/10 backdrop-blur-[2px]">
        <button
          onClick={() => downloadImage(imageSrc)}
          className="ml-auto mr-1"
        >
          <Download className="stroke-3 size-8" />
        </button>
        <button onClick={() => setIsVeiwingImage(false)} className="ml-5 mr-1">
          <X className="stroke-3 size-8" />
        </button>
      </div>
      <img src={imageSrc} className="size-full object-contain  my-auto" />
    </div>
  );
}

export default ImageView;
