import React, { useEffect } from "react";
import ChatArea from "../components/ChatArea";
import UserList from "../components/UserList";
import { useChatAndMessageStore } from "../store/useChatAndMessageStore";

function HomePage() {
  const { selectedUser, getUsers } = useChatAndMessageStore();
  
    //getting initial data
    useEffect(() => {
      getUsers();
    }, []);

  return (
    <div className="flex w-full h-full min-h-0 text-base-content overflow-hidden">
      
      <div 
        className={`h-full min-h-0 border-r border-base-content/20 md:w-1/4 lg:w-1/3 overflow-hidden ${
          selectedUser ? "hidden md:block" : "w-full block"
        }`}
      >
        <UserList />
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