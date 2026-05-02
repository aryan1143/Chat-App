import { Bell, Palette, UserLock } from "lucide-react";
import React, { useState } from "react";
import { themes } from "../lib/themes.json";
import { useSettingStore } from "../store/useSettingAuth";

function SettingPage() {
  const [currentSetting, setCurrentSetting] = useState("theme");

  const {
    setThemeSetting,
    theme,
    setNotificationSetting,
    notification,
    setPrivacySetting,
    lastSeenAndOnline,
    readReceipt,
  } = useSettingStore();

  return (
    <div className="grow w-screen h-full flex flex-col lg:grid lg:grid-cols-[2fr_8fr] lg:items-center">
      {/* left side */}
      <div className="sticky top-15 z-30 bg-base-100 lg:h-full h-fit lg:border-r border-base-content/50 p-4 text-base-content">
        <ul className="w-full flex flex-col gap-2 font-semibold">
          <li className="p-2 w-full">
            <input
              type="radio"
              name="setting"
              value="theme"
              checked={currentSetting === "theme"}
              onChange={() => setCurrentSetting("theme")}
              id="theme-setting"
              className="hidden peer"
            />
            <label
              htmlFor="theme-setting"
              className="w-full flex gap-2 items-center p-3 rounded-sm cursor-pointer
             lg:hover:bg-base-content/10 
             peer-checked:bg-primary peer-checked:text-primary-content
             lg:peer-checked:hover:bg-primary/85"
            >
              <Palette className="size-5" />
              Theme
            </label>
          </li>
          <li className="p-2 w-full">
            <input
              type="radio"
              name="setting"
              value="notificationAndSound"
              checked={currentSetting === "notificationAndSound"}
              onChange={() => setCurrentSetting("notificationAndSound")}
              id="notificationAndSound-setting"
              className="hidden peer"
            />
            <label
              htmlFor="notificationAndSound-setting"
              className="w-full flex gap-2 items-center p-3 rounded-sm cursor-pointer 
             lg:hover:bg-base-content/10 
             peer-checked:bg-primary peer-checked:text-primary-content
             lg:peer-checked:hover:bg-primary/85"
            >
              <Bell className="size-5" />
              Notification
            </label>
          </li>
          <li className="p-2 w-full">
            <input
              type="radio"
              name="setting"
              value="privacy"
              checked={currentSetting === "privacy"}
              onChange={() => setCurrentSetting("privacy")}
              id="privacy-setting"
              className="hidden peer"
            />
            <label
              htmlFor="privacy-setting"
              className="w-full flex gap-2 items-center p-3 rounded-sm cursor-pointer 
             lg:hover:bg-base-content/10 
             peer-checked:bg-primary peer-checked:text-primary-content
             lg:peer-checked:hover:bg-primary/85"
            >
              <UserLock className="size-5" />
              Privacy
            </label>
          </li>
        </ul>
      </div>

      {/* right side */}
      <div className="h-full overflow-y-scroll scrollbar-thumb-base-content/60 ky-700 scrollbar-track-base-content/20 scrollbar-thin [&::-webkit-scrollbar-button]:hidden">
        {/* theme settings */}
        {currentSetting === "theme" && (
          <div className="h-full w-full p-5 flex flex-wrap gap-4 items-center justify-center">
            {themes.map((themeName) => (
              <button
                onClick={() => setThemeSetting(themeName)}
                data-theme={themeName}
                key={themeName}
                className={`cursor-pointer w-fit h-fit font-bold ${themeName === theme ? "ring-4 ring-base-content" : "ring-1 ring-base-content/40"} rounded-xl grid grid-cols-[2fr_8fr] overflow-hidden bg-base-100`}
              >
                <div className="flex flex-col">
                  <div className="w-full h-6/10 bg-accent-content/80"></div>
                  <div className="w-full h-4/10 bg-accent-content"></div>
                </div>
                <div className="flex w-full flex-col gap-1 justify-center p-2.5 px-2">
                  <p className="text-base-content leading-none capitalize">
                    {themeName.replaceAll("-", " ")}
                  </p>
                  <div className="w-full flex gap-1">
                    <div className="rounded-md bg-primary text-primary-content w-6 h-6 flex justify-center items-center">
                      A
                    </div>
                    <div className="rounded-md bg-accent text-accent-content w-6 h-6 flex justify-center items-center">
                      A
                    </div>
                    <div className="rounded-md bg-primary-content text-primary w-6 h-6 flex justify-center items-center">
                      A
                    </div>
                    <div className="rounded-md bg-accent-content text-accent w-6 h-6 flex justify-center items-center">
                      A
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* notification setting */}
        {currentSetting === "notificationAndSound" && (
          <div className="h-full w-full p-5 flex flex-col items-center gap-3">
            <fieldset className="fieldset bg-base-100 border-base-400 rounded-box w-9/10 border p-4 mx-2">
              <legend className="fieldset-legend text-xl">Notification</legend>
              <label className="label py-5 px-3 text-xl flex items-center gap-3">
                <input
                  onChange={() => setNotificationSetting(!notification)}
                  type="checkbox"
                  checked={notification}
                  className="toggle"
                />
                Send Notification
              </label>
            </fieldset>
          </div>
        )}

        {/* Privacy settings */}
        {currentSetting === "privacy" && (
          <div className="h-full w-full p-5 flex flex-col items-center gap-3">
            <fieldset className="fieldset bg-base-100 border-base-400 rounded-box w-9/10 border p-4 mx-2">
              <legend className="fieldset-legend text-xl">Privacy</legend>
              <label className="label py-5 px-3 text-xl flex items-center gap-3">
                <input
                  onChange={() =>
                    setPrivacySetting({ lastSeenAndOnline: !lastSeenAndOnline })
                  }
                  type="checkbox"
                  checked={lastSeenAndOnline}
                  className="toggle"
                />
                Show Last Seen & Online
              </label>
              <label className="label py-5 px-3 text-xl flex items-center gap-3">
                <input
                  onChange={() =>
                    setPrivacySetting({ readReceipt: !readReceipt })
                  }
                  type="checkbox"
                  checked={readReceipt}
                  className="toggle"
                />
                Read recipts
              </label>
            </fieldset>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingPage;
