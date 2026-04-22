import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { LogOut } from 'lucide-react';

export const useAuthStore = create((set) => ({
    authUser: null,

    isSigningUp: false,
    isLoggingIng: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,

    //function to check if user is authenticated or not
    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("/auth/check");
            set({ authUser: response.data });
        } catch (error) {
            console.log("Error in check-Auth: ", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    //function to signUp the user
    signUp: async (data) => {
        set({ isSigningUp: true })
        const { fullName, email, password } = data;
        try {
            const response = await axiosInstance.post("/auth/signup", data);
            set({ authUser: response.data });
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
        set({isLoggingIng: true})
        const { email, password } = data;
        try {
            const response = await axiosInstance.post("/auth/login", data);
            set({ authUser: response.data });
            toast.success("Logged-in successfully");
        } catch (error) {
            toast.error(error.response.data.message);
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
            toast.success("Logout successfully");
            set({ authUser: null });
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in logout fn: ", error);
        }
    },

    updateProfile: async (data) => {
        set({isUpdatingProfile: true});
        try {
            const response = await axiosInstance.put("/auth/update-profile", data);
            console.log(response?.data)
            set({authUser: response?.data});
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error?.response?.data);
            console.log("Error in update-profile fn: ", error);
        } finally {
            set({isUpdatingProfile: false});
        }
    }
}))