import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { uid } from "uid";

export const useChatAndMessageStore = create((set, get) => ({
  messages: null,
  selectedUser: null,

  isSelectedUserTyping: false,

  isGettingMessages: false,
  isSendingMessage: false,

  newMessageUsersSet: new Set(),

  // add user with new message
  addNewMessageUser: (user) =>
    set((state) => ({
      newMessageUsersSet: new Set(state.newMessageUsersSet).add(user),
    })),

  // remove user after read the new message
  removeNewMessageUser: (user) =>
    set((state) => {
      const next = new Set(state.newMessageUsersSet);
      next.delete(user);
      return { newMessageUsersSet: next };
    }),

  //function to get message of a specific user
  getMessages: async (_id) => {
    if (!_id) return;
    set({ isGettingMessages: true });
    try {
      const response = await axiosInstance.get(`/message/messages/${_id}`);
      set({ messages: response.data });
      get().removeNewMessageUser(_id);
    } catch (error) {
      console.log("Error in getting messages for chat: ", error);
      toast.error("Error in getting message");
    } finally {
      set({ isGettingMessages: false });
    }
  },

  //function to get all new messages from friends
  getNewMessages: async () => {
    try {
      const response = await axiosInstance.get("/message/new-messages");
      if (Array.isArray(response)) {
        const newMessages = response.data;
        newMessages.forEach((message) => {
          get().addNewMessageUser(message.senderId);
        });
      }
    } catch (error) {
      console.log("Error in getting new messages for chat: ", error);
      toast.error("Error in getting new messages");
    }
  },

  //function to send message to a specific user
  sendMessage: async (_id, message) => {
    const { text, image } = message;
    if (!_id || (!text && !image)) return;
    const clientMsgId = uid(8);
    try {
      set({ isSendingMessage: true });

      const newMessage = {
        senderId: useAuthStore.getState()?.authUser?._id,
        receiverId: _id,
        clientMsgId,
        text,
        image,
      };

      set({ messages: [...get().messages, newMessage] });

      await axiosInstance.post(`/message/send/${_id}`, {
        text,
        image,
        clientMsgId,
      });
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

  setDefaultValuesOfMessageStore: () => {
    set({
      messages: null,
      selectedUser: null,

      isGettingMessages: false,
      isSendingMessage: false,
    });
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    if (socket) {
      //handeling received new message
      socket.on("newMessageReceived", (newMessage) => {
        const selectedUserId = get().selectedUser;

        socket.emit("messageReceived", {
          _id: newMessage._id,
          clientMsgId: newMessage.clientMsgId,
          status: selectedUserId === newMessage.senderId ? "seen" : "received",
          receivedAt: Date.now(),
        });

        if (selectedUserId && selectedUserId === newMessage?.senderId) {
          set({ messages: [...get().messages, newMessage] });
        } else {
          toast("New message received 🔔", {
            position: "top-center",
          });
          get().addNewMessageUser(newMessage.senderId);
        }
      });

      socket.on("receiverReceivedMessage", (newMessage) => {
        const selectedUserId = get().selectedUser;
        if (selectedUserId === newMessage.receiverId) {
          set({
            messages: [
              ...get().messages.map((message) => {
                if (message.clientMsgId === newMessage.clientMsgId)
                  return newMessage;
                return message;
              }),
            ],
          });
        }
      });

      //handeling sent new message
      socket.on("newMessageSent", (newMessage) => {
        const selectedUserId = get().selectedUser;
        if (selectedUserId === newMessage.receiverId) {
          set({
            messages: [
              ...get().messages.map((message) => {
                if (message.clientMsgId === newMessage.clientMsgId)
                  return newMessage;
                return message;
              }),
            ],
          });
        }
      });
    }
  },

  handleSelectedUserStartedTyping: () => {
    const socket = useAuthStore.getState().socket;

    if (socket) {
      //handeling if user started typing...
      socket.on("typing", (query) => {
        const selectedUserId = get().selectedUser;

        if (selectedUserId && selectedUserId === query?.from) {
          set({ isSelectedUserTyping: true });
        }
      });
    }
  },

  handleSelectedUserStoppedTyping: () => {
    const socket = useAuthStore.getState().socket;

    if (socket) {
      //handeling if user started typing...
      socket.on("stopTyping", (query) => {
        const selectedUserId = get().selectedUser;

        if (selectedUserId && selectedUserId === query?.from) {
          set({ isSelectedUserTyping: false });
        }
      });
    }
  },
}));
