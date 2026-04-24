import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useChatAndMessageStore = create((set) => ({
  users: null,
  messages: null,
  selectedUser: null,

  isGettingUsers: false,
  isGettingMessages: false,
  isSendingMessage: false,

  //function to get users for the chat
  getUsers: async () => {
    set({ isGettingUsers: true });
    try {
      const response = await axiosInstance.get("/message/users");
      set({ users: response.data });
    } catch (error) {
      console.log("Error in getting users for chat: ", error);
      toast.error("Error in getting users");
    } finally {
      set({ isGettingUsers: false });
    }
  },

  //function to get message of a specific user
  getMessages: async (_id) => {
    if (!_id) return;
    set({ isGettingMessages: true });
    try {
      const response = await axiosInstance.get(`/message/${_id}`);
      set({ messages: response.data });
    } catch (error) {
      console.log("Error in getting messages for chat: ", error);
      toast.error("Error in getting message");
    } finally {
      set({ isGettingMessages: false });
    }
  },

  //function to send message to a specific user
  sendMessage: async (_id, message) => {
    const { text, image } = message;
    if (!_id || (!text && !image)) return;
    try {
      set({ isSendingMessage: true });

      await axiosInstance.post(`/message/send/${_id}`, { text, image });
    } catch (error) {
      console.log("Error in sending messages: ", error);
      toast.error("Error in sending message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  //function to set selected user
  setSelectedUser: (_id) => {
    set({ selectedUser: _id });
  },

  setDefault: () => {
    set({
      users: null,
      messages: null,
      selectedUser: null,

      isGettingUsers: false,
      isGettingMessages: false,
      isSendingMessage: false,
    });
  },
}));
