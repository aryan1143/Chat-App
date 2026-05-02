import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { uid } from "uid";
import { useSettingStore } from "./useSettingAuth";

export const useChatAndMessageStore = create((set, get) => ({
  messages: [],
  selectedUser: null,

  isSelectedUserTyping: false,

  isGettingMessages: false,
  isSendingMessage: false,

  newMessageUsersSet: new Set(),

  // add user to newMessageUser set with new message
  addNewMessageUser: (user) =>
    set((state) => ({
      newMessageUsersSet: new Set(state.newMessageUsersSet).add(user),
    })),

  // remove user from newMessageUser set after read the new message
  removeNewMessageUser: (user) =>
    set((state) => {
      const next = new Set(state.newMessageUsersSet);
      next.delete(user);
      return { newMessageUsersSet: next };
    }),

  //function to get message of a specific user
  getMessages: async (_id, scrolledTime = 0) => {
    if (!_id) return;
    set({ isGettingMessages: true });
    try {
      const response = await axiosInstance.get(`/message/messages/${_id}`, {
        params: {
          scrolledTime,
        },
      });
      set({ messages: [...response.data, ...get().messages] });
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
  sendMessage: async (receiverId, message) => {
    const { text, image } = message;
    if (!receiverId || (!text && !image)) return;
    const clientMsgId = uid(8);
    try {
      set({ isSendingMessage: true });

      const newMessage = {
        senderId: useAuthStore.getState()?.authUser?._id,
        receiverId: receiverId,
        clientMsgId,
        text,
        image,
        status: null,
      };

      const selectedUserId = get().selectedUser;
      if (selectedUserId === receiverId) {
        set({ messages: [...get().messages, newMessage] });
      }

      await axiosInstance.post(`/message/send/${receiverId}`, {
        text,
        image,
        clientMsgId,
      });
    } catch (error) {
      console.log("Error in sending message: ", error);
      toast.error("Error in sending message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  //function to edit an specific message
  editMessage: async (messageId, receiverId, text) => {
    if (!messageId || !text || !receiverId) return;

    try {
      const selectedUserId = get().selectedUser;
      if (selectedUserId === receiverId) {
        set((state) => ({
          messages: [
            ...state.messages.map((message) => {
              if (messageId === message._id)
                return { ...message, text, status: null };
              return message;
            }),
          ],
        }));
      }

      await axiosInstance.put(`/message/edit/${messageId}`, { text });
    } catch (error) {
      console.log("Error in editing message: ", error);
      toast.error("Error in editing message");
    }
  },

  //function to delete an specific message
  deleteMessage: async (messageId, receiverId) => {
    if (!messageId || !receiverId) return;

    try {
      const selectedUserId = get().selectedUser;
      if (selectedUserId === receiverId) {
        set((state) => ({
          messages: state.messages.filter(
            (message) => message._id !== messageId,
          ),
        }));
      }

      await axiosInstance.delete(`/message/delete/${messageId}`);
    } catch (error) {
      console.log("Error in deleting message: ", error);
      toast.error("Error in deleting message");
    }
  },

  //function to delete all messages with a specific user
  deleteAllMessage: async (otherUserId) => {
    if (!otherUserId) return;

    const allMessages = get()?.messages;
    try {
      const selectedUserId = get().selectedUser;
      if (selectedUserId === otherUserId) {
        set((state) => ({
          messages: [],
        }));
      }

      await axiosInstance.delete(`/message/delete-all/${otherUserId}`);
      toast.success("Chat deleted successfully");
    } catch (error) {
      set((state) => ({
        messages: allMessages,
      }));
      console.log("Error in deleting all messages: ", error);
      toast.error("Failed to delete all messages");
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
        const readReceipt = useSettingStore.getState()?.readReceipt;

        socket.emit("messageReceived", {
          _id: newMessage._id,
          clientMsgId: newMessage.clientMsgId,
          status:
            selectedUserId === newMessage.senderId && readReceipt
              ? "seen"
              : "received",
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

      //handeling sent new message
      socket.on("messageEditedSucessfully", (editedMessage) => {
        const selectedUserId = get().selectedUser;
        if (selectedUserId === editedMessage.receiverId) {
          set({
            messages: [
              ...get().messages.map((message) => {
                if (message._id === editedMessage._id) return editedMessage;
                return message;
              }),
            ],
          });
        }
      });

      //handeling message edited by sender
      socket.on("messageEdited", (updatedMessage) => {
        const selectedUserId = get().selectedUser;
        const readReceipt = useSettingStore.getState()?.readReceipt;

        socket.emit("messageReceived", {
          _id: updatedMessage._id,
          clientMsgId: updatedMessage.clientMsgId,
          status:
            selectedUserId === updatedMessage.senderId && readReceipt
              ? "seen"
              : "received",
          receivedAt: Date.now(),
        });
        if (selectedUserId === updatedMessage.senderId) {
          set({
            messages: [
              ...get().messages.map((message) => {
                if (message._id === updatedMessage._id) return updatedMessage;
                return message;
              }),
            ],
          });
        }
      });

      //handeling message deleted by sender
      socket.on("messageDeleted", (deletedMessage) => {
        const selectedUserId = get().selectedUser;
        if (selectedUserId === deletedMessage.senderId) {
          toast("Message deleted by user 😒");
          set({
            messages: [
              ...get().messages.filter(
                (message) => message._id !== deletedMessage._id,
              ),
            ],
          });
        }
      });

      //handeling all message deleted by other user
      socket.on("allMessageDeleted", (otherUserId) => {
        const selectedUserId = get().selectedUser;
        if (selectedUserId === otherUserId) {
          toast("Chat deleted by user 😒");
          set({
            messages: [],
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
