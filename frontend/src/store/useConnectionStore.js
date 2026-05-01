import { create } from "zustand";
import { debounce, throttle } from "../lib/utils";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useConnectionStore = create((set, get) => ({
  query: "",
  searchedUsers: [],
  isSearchingUsers: false,
  receivedRequests: [],
  isGettingReceivedRequests: false,
  friends: [],
  isGettingFriends: false,
  friendsOnline: [],

  getReceivedRequests: async () => {
    try {
      set({ isGettingReceivedRequests: true });
      const response = await axiosInstance.get("/connection/find/requests");
      set({ receivedRequests: response.data });
    } catch (error) {
      console.log(
        "Error in getReceiveRequests in connection store : ",
        error?.message,
      );
      set({ receivedRequests: [] });
    } finally {
      set({ isGettingReceivedRequests: false });
    }
  },

  getRealTimeConnectionData: () => {
    const socket = useAuthStore.getState().socket;

    if (socket) {
      socket.on("requestReceived", (connection) => {
        set({ receivedRequests: [connection] });
      });

      socket.on("friendDeleted", (connection) => {
        set({
          friends: get().friends.filter(
            (friend) =>
              !(
                connection.recipientID === friend._id ||
                connection.requesterID === friend._id
              ),
          ),
        });
      });
    }
  },

  getFriends: async () => {
    try {
      set({ isGettingFriends: true });
      const response = await axiosInstance.get("/connection/find/friends");
      set({ friends: response.data });
      useAuthStore.getState().connectSocket();
    } catch (error) {
      console.log("Error in getFriends in connection store : ", error?.message);
      set({ friends: [] });
    } finally {
      set({ isGettingFriends: false });
    }
  },

  throttledGetReceivedRequest: throttle(() => {
    get().getReceivedRequests();
  }, 1500),

  sendRequest: async (userId) => {
    if (!userId) return;
    try {
      get().updateUserConnectionStatus(userId, "sent", null);
      const { data } = await axiosInstance.post(`/connection/send/${userId}`);
      get().updateUserConnectionStatus(userId, "sent", data?._id ?? null);
      toast.success("Request sent successfully");
    } catch (error) {
      console.log(
        "Error in search users in connection store : ",
        error?.message,
      );
      get().updateUserConnectionStatus(userId, "none", null);
      toast.error(error?.response?.data?.message || "Failed to send request");
    }
  },

  acceptRequest: async (connectionID, userId) => {
    if (!connectionID || !userId) return;
    try {
      get().updateUserConnectionStatus(userId, "friends", connectionID);
      get().updateReceivedRequestsAndFriends(connectionID);
      await axiosInstance.put(`/connection/accept/${connectionID}`);
      toast.success("Request accepted successfully");
    } catch (error) {
      console.log(
        "Error in accept request in connection store : ",
        error?.message,
      );
      get().updateUserConnectionStatus(userId, "received", connectionID);
      toast.error(error?.response?.data?.message || "Failed to accept request");
    }
  },

  deleteFriend: async (userId) => {
    if (!userId) return;
    const friends = get().friends;
    try {
      set({ friends: friends.filter((user) => user._id !== userId) });
      await axiosInstance.delete(`/connection/delete/${userId}`);
      toast.success("Unfriended successfully");
    } catch (error) {
      console.log(
        "Error in delete friend in connection store : ",
        error?.message,
      );
      set({ friends: friends });
      toast.error(error?.response?.data?.message || "Failed to delete friend");
    }
  },

  rejectRequest: async (connectionID, userId) => {
    if (!connectionID || !userId) return;
    try {
      get().updateUserConnectionStatus(userId, "none", null);
      get().updateReceivedRequestsAndFriends(connectionID);
      await axiosInstance.delete(`/connection/reject/${connectionID}`);
      toast.success("Request rejected successfully");
    } catch (error) {
      console.log(
        "Error in reject request in connection store : ",
        error?.message,
      );
      get().updateUserConnectionStatus(userId, "received", connectionID);
      toast.error(error?.response?.data?.message || "Failed to reject request");
    }
  },

  throttledSendRequest: throttle((userId) => {
    get().sendRequest(userId);
  }, 1500),

  throttledAcceptRequest: throttle((connectionID, userId) => {
    get().acceptRequest(connectionID, userId);
  }, 1500),

  throttledRejectRequest: throttle((connectionID, userId) => {
    get().rejectRequest(connectionID, userId);
  }, 1500),

  updateUserConnectionStatus: (userId, status, connectionID) => {
    if (get().searchedUsers.length === 0) return;
    set((state) => ({
      searchedUsers: state.searchedUsers.map((u) =>
        u._id === userId
          ? {
              ...u,
              connectionStatus: status,
              ...(connectionID !== undefined ? { connectionID } : {}),
            }
          : u,
      ),
    }));
  },

  updateReceivedRequestsAndFriends: (connectionID) => {
    set((state) => {
      const acceptedUser = state.receivedRequests.find(
        (u) => u.connectionID === connectionID,
      );

      return {
        receivedRequests: state.receivedRequests.filter(
          (u) => u.connectionID !== connectionID,
        ),

        friends: acceptedUser
          ? [...state.friends, acceptedUser]
          : state.friends,
      };
    });
  },

  fetchUsers: async (query) => {
    if (!query) return;

    try {
      set({ isSearchingUsers: true });

      const { data } = await axiosInstance("/connection/find", {
        params: { query },
      });

      set({ searchedUsers: data });
    } catch (error) {
      console.log(
        "Error in seach users in connection store : ",
        error?.message,
      );
      set({ searchedUsers: [] });
    } finally {
      set({ isSearchingUsers: false });
    }
  },

  debouncedSearchUsers: debounce((query) => {
    get().fetchUsers(query);
  }, 1000),

  setSearchQuery: (query) => {
    set({ query });
    get().debouncedSearchUsers(query);
  },

  setDefaultValuesOfConnectionStore: () => {
    set({
      query: "",
      searchedUsers: [],
      isSearchingUsers: false,
      receivedRequests: [],
    });
  },
}));
