import React from "react";
import { useChatAndMessageStore } from "../store/useChatAndMessageStore";

function UserList() {
  const { users, isGettingUsers, setSelectedUser, selectedUser, getMessages } = useChatAndMessageStore();

  if (isGettingUsers) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="loading loading-bars loading-md"></span>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden p-4 scrollbar-thumb-base-content/60 ky-700 scrollbar-track-base-content/20 scrollbar-thin [&::-webkit-scrollbar-button]:hidden">
      <div className="flex flex-col gap-2">
        {users?.map((user) => (
          <button
            onClick={() => {setSelectedUser(user._id); getMessages(user._id)}}
            key={user._id}
            className={`w-full rounded-lg flex gap-2 items-center p-2 transition-colors ${
              selectedUser === user._id ? "bg-primary-content/20" : "hover:bg-base-content/10"
            }`}
          >
            <img src={user.profilePic} className="rounded-full size-12 object-cover" />
            <div className="flex flex-col h-full justify-center gap-0.5 text-left">
              <p className="text-base font-semibold truncate">{user.fullName}</p>
              <p className="text-sm text-base-content/70">Offline</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default UserList;
