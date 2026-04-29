import React, { useEffect } from "react";
import ChatArea from "../components/ChatArea";
import UserList from "../components/UserList";
import { useChatAndMessageStore } from "../store/useChatAndMessageStore";
import SearchAndAddFriends from "../components/SearchAndAddFriends";
import { useState } from "react";
import { useConnectionStore } from "../store/useConnectionStore";
import { useAuthStore } from "../store/useAuthStore";

function HomePage() {
  const [isSearchingFriends, setIsSearchingFriends] = useState(false);
  const { selectedUser, getUsers } = useChatAndMessageStore();
  const { getReceivedRequests, getFriends, getReceivedRequestsInRealTime } =
    useConnectionStore();
  const { socket } = useAuthStore();

  //getting initial data
  useEffect(() => {
    getFriends();
    getReceivedRequests();
  }, []);

  useEffect(() => {
    getReceivedRequestsInRealTime();
  }, [socket]);

  return (
    <div className="flex w-full h-full min-h-0 text-base-content overflow-hidden">
      <div
        className={`h-full min-h-0 border-r border-base-content/20 md:w-1/4 lg:w-1/3 overflow-hidden ${
          selectedUser ? "hidden md:block" : "w-full block"
        }`}
      >
        {isSearchingFriends ? (
          <SearchAndAddFriends setIsSearchingFriends={setIsSearchingFriends} />
        ) : (
          <UserList setIsSearchingFriends={setIsSearchingFriends} />
        )}
      </div>

      <div
        className={`h-full min-h-0 md:w-3/4 lg:w-2/3 text-base-content overflow-hidden ${
          selectedUser ? "w-full block" : "hidden md:block"
        }`}
      >
        <ChatArea />
      </div>
    </div>
  );
}

export default HomePage;
