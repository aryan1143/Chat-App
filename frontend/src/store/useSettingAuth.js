import toast from "react-hot-toast";
import { create } from "zustand";
import { themes } from "../lib/themes.json";
import { getDataLocal, setDataLocal } from "../lib/localStorageUtils";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";

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

export const useSettingStore = create((set, get) => ({
  theme: getInitialTheme(),

  //notification settings
  notification: getInitialNotification(),

  //privacy settings
  lastSeenAndOnline: false,
  readReceipt: false,

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

  //functionn to set initial privacy settings
  setInitialPrivacySetting: (value) => {
    if (!value || Object.keys(value).length < 1) return;
    set({ ...value });
  },

  //functionn to set privacy settings
  setPrivacySetting: async (value) => {
    if (!value || Object.keys(value).length < 1) return;
    const { lastSeenAndOnline, readReceipt } = get();
    try {
      set({ ...value });
      console.log(value);
      await axiosInstance.put("/auth/update-privacy", value);
      toast.success("Setting updated successfully");
    } catch (error) {
      console.log("Error in set privacy settings setting-auth: ", error);
      set({ lastSeenAndOnline, readReceipt });
      toast.error("Failed to update setting");
    }
  },
}));
