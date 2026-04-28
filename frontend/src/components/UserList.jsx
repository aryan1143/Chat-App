import React, { useState } from "react";
import { useChatAndMessageStore } from "../store/useChatAndMessageStore";
import {
  UserPlus,
  UserRoundCheck,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { useConnectionStore } from "../store/useConnectionStore";
import FriendListItemSkeleton from "./FriendListItemSkeleton";

function UserList({ setIsSearchingFriends }) {
  const [userlistMode, setUserlistMode] = useState("friends");
  const {
    users,
    setSelectedUser,
    selectedUser,
    getMessages,
    newMessageUsersSet,
  } = useChatAndMessageStore();

  const {
    receivedRequests,
    isGettingReceivedRequests,
    throttledAcceptRequest,
    throttledRejectRequest,
    friends,
    isGettingFriends,
    friendsOnline,
  } = useConnectionStore();

  return (
    <div className="relative flex flex-col h-full min-h-0 w-full">
      <button
        onClick={() => setIsSearchingFriends(true)}
        className="absolute bottom-5 right-5 p-3 pl-3.5 pr-2.5 rounded-full bg-primary text-primary-content"
      >
        <UserPlus className="size-8" />
      </button>
      <form className="flex w-full justify-around items-center py-2 p-4 min-h-0 border-b border-base-content/20">
        <div className="w-4/10">
          <label
            className={`cursor-pointer p-2 w-full justify-center flex items-center gap-1 rounded ${userlistMode === "friends" && "bg-base-300"}`}
            htmlFor="friends"
          >
            <Users className="size-4" /> Friends
          </label>
          <input
            type="radio"
            name="userListMode"
            id="friends"
            className="peer hidden"
            checked={userlistMode === "friends"}
            value="friends"
            onChange={(e) => setUserlistMode(e.target.value)}
          />
        </div>
        <div className="w-4/10">
          <label
            className={`cursor-pointer p-2 w-full justify-center flex items-center gap-1 rounded ${userlistMode === "requests" && "bg-base-300"}`}
            htmlFor="friendRequest"
          >
            <UserRoundPlus className="size-4" />
            Requests
          </label>
          <input
            type="radio"
            name="userListMode"
            id="friendRequest"
            className="peer hidden"
            checked={userlistMode === "requests"}
            value="requests"
            onChange={(e) => setUserlistMode(e.target.value)}
          />
        </div>
      </form>
      <div className="flex pt-2 p-4 grow min-h-0 flex-col gap-2 overflow-y-auto overflow-x-hidden scrollbar-thumb-base-content/60 ky-700 scrollbar-track-base-content/20 scrollbar-thin [&::-webkit-scrollbar-button]:hidden">
        {userlistMode === "friends" &&
          isGettingFriends &&
          Array.from({ length: 6 }).map((_, index) => (
            <FriendListItemSkeleton key={`friend-skeleton-${index}`} />
          ))}
        {userlistMode === "friends" &&
          !isGettingFriends &&
          friends?.map((user) => (
            <button
              onClick={() => {
                setSelectedUser(user._id);
                getMessages(user._id);
              }}
              key={user._id}
              className={`w-full rounded-lg flex gap-2 items-center p-2 transition-colors ${
                selectedUser === user._id
                  ? "bg-primary-content/20"
                  : "hover:bg-base-content/10"
              }`}
            >
              <img
                src={user.profilePic}
                className="rounded-full size-12 object-cover"
              />
              <div className="flex flex-col h-full justify-center gap-0.5 text-left">
                <p className="text-base font-semibold truncate">
                  {user.fullName}
                </p>
                <p className="text-sm text-base-content/70">
                  {friendsOnline.includes(user._id) ? "Online" : "Oflline"}
                </p>
              </div>
              <div className="p-2 ml-auto w-fit h-full flex justify-center items-center">
                {newMessageUsersSet && newMessageUsersSet.has(user._id) && (
                  <span className="size-2 bg-green-500 rounded-full"></span>
                )}
              </div>
            </button>
          ))}
        {userlistMode === "requests" && isGettingReceivedRequests && (
          <div className="h-full w-full flex items-center justify-center">
            <span className="loading loading-bars loading-md"></span>
          </div>
        )}
        {userlistMode === "requests" &&
          !isGettingReceivedRequests &&
          receivedRequests?.map((user) => (
            <div
              key={user._id}
              className="border-t border-b border-base-content/10 rounded-lg flex gap-2 items-center p-2 transition-colors hover:bg-base-content/10"
            >
              <img
                src={user.profilePic}
                className="rounded-full size-12 object-cover"
              />
              <div className="flex flex-col h-full justify-center gap-0.5 text-left">
                <p className="text-base font-semibold truncate">
                  {user.fullName}
                </p>
                <p className="text-sm text-base-content/70">{user?.email}</p>
              </div>
              <div className="ml-auto mr-2 flex items-center gap-1">
                <button
                  onClick={() =>
                    throttledAcceptRequest(user.connectionID, user._id)
                  }
                  className="rounded-lg p-1.5 hover:bg-base-content/10 transition-colors"
                >
                  <UserRoundCheck />
                </button>
                <button
                  onClick={() =>
                    throttledRejectRequest(user.connectionID, user._id)
                  }
                  className="rounded-lg p-1.5 hover:bg-base-content/10 transition-colors"
                >
                  <X />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default UserList;
