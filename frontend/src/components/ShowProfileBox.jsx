import { UserRoundMinus, X } from "lucide-react";
import React, { useEffect, useRef } from "react";

function ShowProfileBox({ userData, setShowUserInfo, btnRef }) {
      const popUpRef = useRef(null);

      useEffect(() => {
        const handleOutsideClick = (event) => {
            if (popUpRef.current && !popUpRef.current.contains(event.target) && !btnRef.current.contains(event.target)) {
                setShowUserInfo(false);
            }
        }
        
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);
        
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        }
    }, [])

  return (
    <div ref={popUpRef} className="absolute top-[30%] border border-base-content/20 lg:top-15 overflow-hidden z-25 left-[50%] -translate-[50%] lg:translate-0 lg:left-1 w-70 min-h-75 h-fit bg-base-100 text-base-100">
      <div className="size-70 relative">
        <div className="absolute flex items-center w-full top-0 left-0 bg-base-content/10 backdrop-blur-[2px]">
          <h2 className="p-1 font-semibold text-xl truncate">
            {userData.fullName}
          </h2>
          <button onClick={()=>setShowUserInfo(false)} className="ml-auto mr-1">
            <X className="stroke-3"/>
          </button>
        </div>
        <div className="absolute w-full bottom-0 left-0 bg-base-content/10 backdrop-blur-[2px]">
          <p className="p-0.5 font-semibold text-sm truncate">
            {userData.email}
          </p>
        </div>
        <img src={userData.profilePic} className="w-full m-auto" />
      </div>
      <div className="w-full flex p-1 px-2 border-t border-base-content/50 items-center gap-1">
        <p className="text-base-content/70 text-sm wrap-anywhere line-clamp-2 text-balance">
          Bio: {userData.bio}
        </p>
        <button className="ml-auto size-fit text-red-700">
          <UserRoundMinus className="size-6" />
        </button>
      </div>
    </div>
  );
}

export default ShowProfileBox;
