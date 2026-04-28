import {
  ArrowLeft,
  CirclePlus,
  EllipsisVertical,
  MessageSquare,
  Plus,
  SendHorizontal,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useChatAndMessageStore } from "../store/useChatAndMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import readFile from "../lib/readImageFile";
import { formatMessageTime } from "../lib/utils";
import { useConnectionStore } from "../store/useConnectionStore";
import MessageBubbleSkeleton from "./MessageBubbleSkeleton";
import ShowProfileBox from "./ShowProfileBox";

function ChatArea() {
  const [textMessage, setTextMessage] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [selectedUserData, setSelectedUserData] = useState({});
  const [showUserInfo, setShowUserInfo] = useState(false);
  const profileOpenBtnRef = useRef(null);

  const messageAreaRef = useRef(null);

  const { authUser, socket } = useAuthStore();

  const { friendsOnline } = useConnectionStore();

  const {
    setSelectedUser,
    selectedUser,
    isGettingMessages,
    messages,
    users,
    sendMessage,
    subscribeToMessages,
  } = useChatAndMessageStore();

  useEffect(() => {
    subscribeToMessages();
  }, [socket]);

  useEffect(() => {
    if (!messageAreaRef.current || !messages?.length) return;

    messageAreaRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [messages, selectedUser]);

  const { friends } = useConnectionStore();

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
    e.target.value = null;
  };

  const handleSendMessage = () => {
    sendMessage(selectedUser, { text: textMessage, image: imageSrc });
    setTextMessage("");
    setImageSrc(null);
  };

  useEffect(() => {
    if (friends.length === 0) return;
    const userData = friends.find((user) => user._id === selectedUser);
    if (userData) setSelectedUserData(userData);
  }, [friends, selectedUser]);

  if (!selectedUser) {
    return (
      <div className="h-full w-full p-4">
        <div className="w-full h-full flex flex-col gap-2 justify-center items-center">
          <div className="p-3 bg-primary/20 rounded-xl w-fit bubble">
            <MessageSquare className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mt-2">Welcome to Chat App</h1>
          <p className="text-base-content/60">
            Select a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  if (isGettingMessages) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="w-full flex gap-2 items-center bg-base-100 p-4 py-2 border-b border-base-content/20">
          <button onClick={() => setSelectedUser(null)}>
            <ArrowLeft />
          </button>
          <div className="skeleton rounded-full size-10"></div>
          <div className="skeleton h-5 w-35"></div>
          <div className="skeleton h-8 w-8 rounded-full ml-auto"></div>
        </div>

        <div className="flex flex-col-reverse w-full p-4 flex-1 overflow-y-scroll scrollbar-thumb-base-content/60 ky-700 scrollbar-track-base-content/20 scrollbar-thin [&::-webkit-scrollbar-button]:hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <MessageBubbleSkeleton
              key={`message-skeleton-${index}`}
              isOwn={index % 2 !== 0}
            />
          ))}
        </div>

        <div className="w-full p-4 flex gap-1">
          <div className="skeleton rounded-full size-10"></div>
          <div className="skeleton h-10 w-full rounded-full"></div>
          <div className="skeleton rounded-full size-10"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* user profile data */}
      <div className="w-full flex gap-2 items-center bg-base-100 p-4 py-2 border-b border-base-content/20">
        <button onClick={() => setSelectedUser(null)}>
          <ArrowLeft />
        </button>
        <button
          ref={profileOpenBtnRef}
          onClick={() => setShowUserInfo((prev) => !prev)}
          className="flex items-center w-4/10 gap-1 truncate"
        >
          <div className="shrink-0 relative">
            <img
              src={selectedUserData?.profilePic}
              className="rounded-full size-10"
            />
            <span
              className={`absolute size-2.5 z-10 rounded-full ${friendsOnline.includes(selectedUser) ? "bg-green-500" : "bg-gray-500"}  bottom-0 right-0 outline-2 outline-base-100`}
            ></span>
          </div>
          <div className="flex flex-col w-full justify-start">
            <h2 className="truncate mr-auto">{selectedUserData.fullName}</h2>
            <p className="truncate mr-auto text-xs text-base-content/60">
              {selectedUserData.bio}
            </p>
          </div>
        </button>
        <button className="ml-auto">
          <EllipsisVertical />
        </button>
      </div>
      {showUserInfo && (
        <ShowProfileBox
          setShowUserInfo={setShowUserInfo}
          userData={selectedUserData}
          btnRef={profileOpenBtnRef}
        />
      )}
      {/* messages */}
      <div
        ref={messageAreaRef}
        className="relative flex flex-col-reverse w-full p-4 flex-1 overflow-y-scroll scrollbar-thumb-base-content/60 ky-700 scrollbar-track-base-content/20 scrollbar-thin [&::-webkit-scrollbar-button]:hidden"
      >
        {messages &&
          !isGettingMessages &&
          messages.toReversed().map((message) => {
            return message.receiverId === authUser._id ? (
              <div
                key={message._id}
                className="mr-auto flex gap-1 w-fit h-fit my-1 lg:my-2 text-2sm"
              >
                <div className="h-full w-8 lg:w-10 flex items-end shrink-0">
                  <img
                    src={selectedUserData.profilePic}
                    className="size-8 lg:size-10 rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs ml-2">
                    {formatMessageTime(message.createdAt)}
                  </p>
                  <div className="flex justify-start">
                    <span className="mt-auto rounded-t-sm rounded-r-sm -mr-1 inline-block w-0 h-0 border-solid border-t-0 border-r-0 border-l-10 border-b-10 border-l-transparent border-r-transparent border-t-transparent border-b-base-300"></span>
                    <div className="p-1 w-fit rounded-md rounded-bl-xs bg-base-300 wrap-anywhere mr-5 lg:mr-10">
                      {message?.image && (
                        <img
                          className="w-50 lg:w-80 rounded-sm"
                          src={message.image}
                        />
                      )}
                      <p className="px-1">{message.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={message._id}
                className="ml-auto flex gap-1 w-fit h-fit my-1 lg:my-2 text-2sm"
              >
                <div className="flex flex-col">
                  <p className="text-xs ml-auto mr-2">
                    {formatMessageTime(message.createdAt)}
                  </p>
                  <div className="flex justify-end">
                    <div className="p-1 w-fit rounded-br-xs rounded-md bg-base-300 wrap-anywhere ml-5 lg:ml-10">
                      {message?.image && (
                        <img
                          className="w-50 lg:w-80 rounded-sm"
                          src={message.image}
                        />
                      )}
                      <p className="px-1">{message.text}</p>
                    </div>
                    <span className="mt-auto rounded-t-sm rounded-r-sm -ml-1 inline-block w-0 h-0 border-solid border-t-10 border-r-0 border-l-10 border-b-0 border-l-base-300 border-r-transparent border-t-transparent border-b-transparent"></span>
                  </div>
                </div>
                <div className="h-full flex items-end shrink-0">
                  <img
                    src={authUser.profilePic}
                    className="size-8 lg:size-10 rounded-full"
                  />
                </div>
              </div>
            );
          })}
      </div>
      {/* chat options */}
      <div className="w-full p-4 flex gap-1">
        <label
          htmlFor="imageInput"
          className="cursor-pointer bg-base-300 rounded-full p-1"
        >
          <Plus className="size-8" />
          <input
            className="peer hidden"
            type="file"
            name="imageInput"
            id="imageInput"
            accept="image/*"
            onChange={onFileChange}
          />
        </label>
        <input
          className="bg-base-300 w-full rounded-full p-1 px-5 focus:outline-0 text-xl"
          type="text"
          name="messageInput"
          id="messageInput"
          placeholder="Message"
          value={textMessage}
          onChange={(e) => setTextMessage(e.target.value)}
        />
        <button
          onClick={handleSendMessage}
          className="ml-auto bg-base-content aspect-square flex justify-center items-center text-base-100 p-1 rounded-full"
        >
          <SendHorizontal className="size-6" />
        </button>
      </div>
    </div>
  );
}

export default ChatArea;
