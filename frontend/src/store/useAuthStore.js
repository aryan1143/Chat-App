import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:3001";

export const useAuthStore = create((set, get) => ({
  authUser: null,

  isSigningUp: false,
  isLoggingIng: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,

  socket: null,

  //function to check if user is authenticated or not
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in check-Auth: ", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  //function to signUp the user
  signUp: async (data) => {
    set({ isSigningUp: true });
    const { fullName, email, password } = data;
    try {
      const response = await axiosInstance.post("/auth/signup", data);
      set({ authUser: response.data });
      get().connectSocket();
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("Error in sign-up fn: ", error);
      set({ authUser: null });
    } finally {
      set({ isSigningUp: false });
    }
  },

  //function to login the user
  login: async (data) => {
    set({ isLoggingIng: true });
    const { email, password } = data;
    try {
      const response = await axiosInstance.post("/auth/login", data);
      set({ authUser: response.data });
      get().connectSocket();
      toast.success("Logged-in successfully");
    } catch (error) {
      toast.error(error?.message);
      console.log("Error in login fn: ", error);
      set({ authUser: null });
    } finally {
      set({ isLoggingIng: false });
    }
  },

  //function to logout the user
  logOut: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      get().disConnectSocket();
      toast.success("Logout successfully");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("Error in logout fn: ", error);
    }
  },

  //function to update profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const response = await axiosInstance.put("/auth/update-profile", data);
      console.log(response?.data);
      set({ authUser: response?.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.response?.data);
      console.log("Error in update-profile fn: ", error);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  //function to connect to the socket.io
  connectSocket: async () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id
      }
    });
    socket.connect();
    set({socket: socket});

    socket.on("getOnlineUsers", (users)=> {
      console.log(users)
    })
  },

  //function to disconnect from the socket.io
  disConnectSocket: async () => {
    if(get().socket?.connected) get().socket.disconnect();
  },
}));
