import React from "react";

function FriendListItemSkeleton() {
  return (
    <div className="w-full rounded-lg flex gap-2 items-center p-2">
      <div className="skeleton rounded-full size-12 shrink-0"></div>
      <div className="flex flex-col h-full justify-center gap-2 text-left flex-1">
        <div className="skeleton h-4 w-36 max-w-8/10"></div>
        <div className="skeleton h-3 w-16 max-w-5/10"></div>
      </div>
    </div>
  );
}

export default FriendListItemSkeleton;
