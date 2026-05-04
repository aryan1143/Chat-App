import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Camera } from "lucide-react";
import getCroppedImg from "../lib/cropUtis";
import { useAuthStore } from "../store/useAuthStore";
import readFile from "../lib/readImageFile";

export default function ProfilePicCropper() {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
    e.target.value = null;
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const { updateProfile, isUpdatingProfile } = useAuthStore();

  const handleSaveUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const base64Image = await getCroppedImg(imageSrc, croppedAreaPixels);

    updateProfile({ profilePic: base64Image });

    setImageSrc(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
        id="profilePic"
      />

      {!imageSrc && isUpdatingProfile ? (
        <div className="absolute flex gap-1 p-1 px-2 bg-primary text-primary-content rounded-xl -bottom-3 left-[50%] translate-x-[-50%]">
          <span className="loading loading-dots loading-xs"></span>
        </div>
      ) : (
        <label
          htmlFor="profilePic"
          className="cursor-pointer absolute flex gap-1 p-1 px-2 bg-primary text-primary-content rounded-xl -bottom-3 left-[50%] translate-x-[-50%]"
        >
          <Camera />
          <p>Edit</p>
        </label>
      )}

      {imageSrc && (
        <div className="fixed flex justify-center items-center flex-col w-screen h-screen top-0 left-0 bg-base-content/20 backdrop-blur-2xl">
          <div className="relative w-9/10 max-w-250 h-8/10 max-h-250 bg-neutral rounded-md overflow-hidden mb-4">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setImageSrc(null)}
              className="btn btn-outline"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveUpload}
              disabled={isUpdatingProfile}
              className="btn btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
