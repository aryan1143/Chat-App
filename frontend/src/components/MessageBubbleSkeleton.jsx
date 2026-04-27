import React from "react";

function MessageBubbleSkeleton({ isOwn = false }) {
  if (isOwn) {
    return (
      <div className="ml-auto flex gap-1 w-fit h-fit my-1 lg:my-2 text-2sm">
        <div className="flex flex-col">
          <div className="skeleton h-3 w-14 ml-auto mr-2 mb-1"></div>
          <div className="flex justify-end">
            <div className="p-2 w-50 rounded-br-xs rounded-md bg-base-300 ml-5 lg:ml-10">
              <div className="skeleton h-4 w-36 mb-2"></div>
              <div className="skeleton h-4 w-22"></div>
            </div>
            <span className="mt-auto rounded-t-sm rounded-r-sm -ml-1 inline-block w-0 h-0 border-solid border-t-10 border-r-0 border-l-10 border-b-0 border-l-base-300 border-r-transparent border-t-transparent border-b-transparent"></span>
          </div>
        </div>
        <div className="h-full flex items-end shrink-0">
          <div className="skeleton size-8 lg:size-10 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mr-auto flex gap-1 w-fit h-fit my-1 lg:my-2 text-2sm">
      <div className="h-full w-8 lg:w-10 flex items-end shrink-0">
        <div className="skeleton size-8 lg:size-10 rounded-full"></div>
      </div>
      <div className="flex flex-col">
        <div className="skeleton h-3 w-14 ml-2 mb-1"></div>
        <div className="flex justify-start">
          <span className="mt-auto rounded-t-sm rounded-r-sm -mr-1 inline-block w-0 h-0 border-solid border-t-0 border-r-0 border-l-10 border-b-10 border-l-transparent border-r-transparent border-t-transparent border-b-base-300"></span>
          <div className="p-2 w-50 rounded-md rounded-bl-xs bg-base-300 mr-5 lg:mr-10">
            <div className="skeleton h-4 w-36 mb-2"></div>
            <div className="skeleton h-4 w-22"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubbleSkeleton;
