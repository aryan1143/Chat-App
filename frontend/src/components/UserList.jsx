import React, { useState } from "react";
import { useChatAndMessageStore } from "../store/useChatAndMessageStore";
import {
  EllipsisVertical,
  EllipsisVerticalIcon,
  Trash,
  UserPlus,
  UserRoundCheck,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { useConnectionStore } from "../store/useConnectionStore";
import FriendListItemSkeleton from "./FriendListItemSkeleton";
import { useEffect } from "react";

function UserList({ setIsSearchingFriends }) {
  const [userlistMode, setUserlistMode] = useState("friends");
  const [activeUserId, setActiveUserId] = useState(null);
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
    deleteFriend,
  } = useConnectionStore();

  //functions to handle long press on messages
  let timer;

  const handleTouchStart = (messageId) => {
    //starts the timer of holdLongpress on message
    timer = setTimeout(() => {
      handleLongPress(messageId);
    }, 600);
  };

  const handleTouchEnd = () => {
    // If the user lets go early, cancel the timer
    clearTimeout(timer);
  };

  const handleLongPress = (id) => {
    setActiveUserId(id);
  };

  useEffect(() => {
    const onBgClick = (e) => {
      e.stopPropagation();
      setActiveUserId(null);
    };
    window.addEventListener("click", onBgClick);
    return () => {
      window.addEventListener("click", onBgClick);
    };
  }, []);

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
            className={`relative cursor-pointer p-2 w-full justify-center flex items-center gap-1 rounded ${userlistMode === "requests" && "bg-base-300"}`}
            htmlFor="friendRequest"
          >
            <UserRoundPlus className="size-4" />
            Requests
            <div className="absolute top-[50%] right-2 -translate-y-[50%] p-2 ml-auto w-fit h-full flex justify-center items-center">
              {receivedRequests.length > 0 && (
                <span className="size-2 bg-green-500 rounded-full"></span>
              )}
            </div>
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
          friends?.length === 0 && (
            <div className="flex min-h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-base-content/20 px-6 py-10 text-center text-base-content/70">
              <Users className="size-10 text-base-content/40" />
              <div>
                <p className="text-lg font-semibold text-base-content">
                  No friends yet
                </p>
                <p className="mt-1 text-sm">
                  Add friends to start chatting right away.
                </p>
              </div>
              <button
                onClick={() => setIsSearchingFriends(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-content"
              >
                <UserPlus className="size-5" />
                Add Friends
              </button>
            </div>
          )}
        {userlistMode === "friends" &&
          !isGettingFriends &&
          friends?.map((user) => (
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                handleTouchStart(user._id);
              }}
              onMouseUp={handleTouchEnd}
              onTouchStart={(e) => {
                e.stopPropagation();
                handleTouchStart(user._id);
              }}
              onTouchEnd={handleTouchEnd}
              key={user._id}
              className="relative w-full flex gap-1 items-center"
            >
              <button
                onClick={() => {
                  if (selectedUser === user._id) return;
                  setSelectedUser(user._id);
                  useChatAndMessageStore.setState({ messages: [] });
                  getMessages(user._id);
                }}
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveUserId(user._id);
                }}
                className="hidden opacity-30 rounded-full hover:bg-base-300 size-6 hover:opacity-100 md:flex justify-center items-center"
              >
                <EllipsisVertical className="size-3.5" />
              </button>
              {activeUserId === user._id && (
                <span className="absolute w-fit flex gap-4 top-1/2 -translate-y-1/2 -right-2 lg:right-0 z-25 rounded-full bg-base-200 p-1.5 px-4 border border-base-content/30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Are you sure you want to unfriend ${user.fullName} `,
                        )
                      ) {
                        deleteFriend(user._id);
                      }
                    }}
                    className="flex flex-col justify-center items-center"
                  >
                    <Trash className="size-5 text-red-500" />
                    <p className="text-base-content/70 text-xs">
                      Delete Friend
                    </p>
                  </button>
                </span>
              )}
            </div>
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
