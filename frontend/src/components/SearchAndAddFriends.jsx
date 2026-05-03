import {
  ArrowLeft,
  UserRoundCheck,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import React from "react";
import { useConnectionStore } from "../store/useConnectionStore";
import FriendListItemSkeleton from "./FriendListItemSkeleton";

function SearchAndAddFriends({ setIsSearchingFriends }) {
  const {
    setSearchQuery,
    searchedUsers,
    query,
    isSearchingUsers,
    throttledSendRequest,
    throttledRejectRequest,
    throttledAcceptRequest,
  } = useConnectionStore();

  return (
    <div className="relative flex flex-col h-full min-h-0 w-full">
      <div className="flex items-center gap-2 p-6 py-4">
        <button onClick={() => setIsSearchingFriends(false)}>
          <ArrowLeft />
        </button>
        <p className="text-base font-semibold">Search Friends</p>
      </div>
      {/* search bar */}
      <div className="w-full p-6 pt-2">
        <input
          value={query}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
          autoFocus
          placeholder="Search via name or email"
          autoComplete="none"
          className="w-full rounded-lg border border-base-content/20 bg-base-100 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>
      {/* users list */}
      <div className="flex flex-col gap-2 min-h-0 grow overflow-y-auto overflow-x-hidden p-2 scrollbar-thumb-base-content/60 ky-700 scrollbar-track-base-content/20 scrollbar-thin [&::-webkit-scrollbar-button]:hidden">
        {/* search results will be here */}
        {isSearchingUsers && <FriendListItemSkeleton />}
        {searchedUsers &&
          searchedUsers?.map((user) => (
            <div
              key={user._id}
              className="mx-4 border-t border-b border-base-content/10 rounded-lg flex gap-2 items-center p-2 transition-colors hover:bg-base-content/10"
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
              {user.connectionStatus === "none" && (
                <button
                  onClick={() => throttledSendRequest(user._id)}
                  className="ml-auto mr-2 rounded-lg p-1.5 hover:bg-base-content/10 transition-colors"
                >
                  <UserRoundPlus />
                </button>
              )}

              {user.connectionStatus === "sent" && (
                <button
                  onClick={() =>
                    throttledRejectRequest(user.connectionID, user._id)
                  }
                  className="ml-auto mr-2 rounded-lg p-1.5 hover:bg-base-content/10 transition-colors"
                >
                  <UserRoundCheck />
                </button>
              )}

              {user.connectionStatus === "friends" && (
                <span className="ml-auto mr-2 text-base-content/80">
                  <Users />
                </span>
              )}

              {user.connectionStatus === "received" && (
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
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default SearchAndAddFriends;
