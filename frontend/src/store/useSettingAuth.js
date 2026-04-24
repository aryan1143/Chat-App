import toast from "react-hot-toast";
import { create } from "zustand";
import { themes } from "../lib/themes.json";
import { getDataLocal, setDataLocal } from "../lib/localStorageUtils";

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    document.documentElement.setAttribute("data-theme", "light");
    return "light";
  }

  const savedTheme = getDataLocal("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    return savedTheme;
  }

  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  systemPrefersDark
    ? document.documentElement.setAttribute("data-theme", "dark")
    : document.documentElement.setAttribute("data-theme", "dark");
  return systemPrefersDark ? "dark" : "light";
};

const getInitialNotification = () => {
  if (typeof window === "undefined") return false;

  const savedNotificationValue = getDataLocal("notification");
  if (savedNotificationValue) return savedNotificationValue;

  return false;
};

const getInitialSound = () => {
  if (typeof window === "undefined") return false;

  const savedSoundValue = getDataLocal("sound");
  return savedSoundValue;
};

export const useSettingStore = create((set) => ({
  theme: getInitialTheme(),

  //notification settings
  sound: getInitialSound(),
  notification: getInitialNotification(),

  //privacy settings
  lastSeenAndOnline: true,
  showAbout: true,
  readRecipts: true,

  isGettingNotificationPermission: false,

  //function to set theme
  setThemeSetting: (themeName) => {
    if (!themeName || !themes.includes(themeName)) return;
    set({ theme: themeName });
    setDataLocal("theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
    toast.success("Theme changed successfully");
  },

  //function to set sound and notification
  setNotificationSetting: async (value) => {
    try {
      if (!value) {
        set({ notification: false });
        setDataLocal("notification", false);
        return toast.success("Notifications disabled 🔕");
      }

      if (Notification.permission === "denied") {
        return toast.error(
          "Notifications are blocked. Please enable them from browser settings.",
        );
      }

      if (Notification.permission === "default") {
        set({ isGettingNotificationPermission: true });

        const permission = await Notification.requestPermission();

        set({ isGettingNotificationPermission: false });

        if (permission !== "granted") {
          return toast.error("Notification permission not granted");
        }
      }

      set({ notification: true });
      setDataLocal("notification", true);

      toast.success("Notifications enabled 🔔");
    } catch (err) {
      set({ isGettingNotificationPermission: false });
      toast.error("Something went wrong");
    }
  },

  setSoundSetting: (value) => {
    set({sound: value});
    setDataLocal('sound', value);
    toast.success(value ? "Sound Enabled Successfully" : "Sound Disabled Successfully");
  },

  //functionn to set privacy settings
  setPrivacySetting: (value) => {
    if (!value || Object.keys(value).length < 1) return;
    set({ ...value });
    toast.success("Setting updated successfully");
  },
}));
