import {
  ArrowLeft,
  Check,
  CheckCheck,
  CirclePlus,
  EllipsisVertical,
  Forward,
  MessageSquare,
  Plus,
  Reply,
  SendHorizontal,
  SquarePen,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useChatAndMessageStore } from "../store/useChatAndMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import readFile from "../lib/readImageFile";
import { formatMessageTime, formatMessageTimeForBubble } from "../lib/utils";
import { useConnectionStore } from "../store/useConnectionStore";
import MessageBubbleSkeleton from "./MessageBubbleSkeleton";
import ShowProfileBox from "./ShowProfileBox";
import handleUserTypingStatus from "../lib/handleUserTypingStatus";
import useTypingStatus from "../lib/handleUserTypingStatus";
import ImageView from "./ImageView";

function ChatArea({ setIsSearchingFriends }) {
  const [textMessage, setTextMessage] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [selectedUserData, setSelectedUserData] = useState({});
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [isVeiwingImage, setIsVeiwingImage] = useState(false);
  const [viewingImageSrc, setVeiwingImageSrc] = useState(null);
  const [showDeleteChatBtn, setShowDeleteChatBtn] = useState(false);
  const [activeMsg, setActiveMsg] = useState(null);
  const [repliedTo, setRepliedTo] = useState(null);
  const [repliedToMessage, setRepliedToMessage] = useState({});
  const [scrolledTime, setScrolledTime] = useState(1);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const profileOpenBtnRef = useRef(null);

  const messageAreaRef = useRef(null);

  const { authUser, socket } = useAuthStore();

  const { friendsOnline, friends } = useConnectionStore();

  const {
    getMessages,
    setSelectedUser,
    selectedUser,
    isGettingMessages,
    messages,
    sendMessage,
    isSelectedUserTyping,
    editMessage,
    deleteMessage,
    deleteAllMessage,
  } = useChatAndMessageStore();

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
    setActiveMsg(id);
  };

  useEffect(() => {
    const onBgClick = (e) => {
      e.stopPropagation();
      setActiveMsg(null);
      setShowDeleteChatBtn(false);
    };
    window.addEventListener("click", onBgClick);
    return () => {
      window.addEventListener("click", onBgClick);
    };
  }, []);

  const handleTyping = useTypingStatus(selectedUser, authUser._id);

  useEffect(() => {
    if (!messageAreaRef.current || !messages?.length || scrolledTime) return;

    messageAreaRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [messages, selectedUser, isSelectedUserTyping]);

  useEffect(() => {
    setScrolledTime(1);
  }, [selectedUser]);

  const handleOnscroll = (e) => {
    if (isGettingMessages) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight + scrollTop - clientHeight < 5) {
      getMessages(selectedUser, scrolledTime);
      console.log(scrolledTime);
      setScrolledTime((prev) => prev + 1);
    }
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
    e.target.value = null;
  };

  const handleSendMessage = () => {
    if (isEditingMessage && editingMessageId) {
      editMessage(editingMessageId, selectedUser, textMessage);
      setIsEditingMessage(false);
      setEditingMessageId(null);
    } else {
      sendMessage(selectedUser, {
        text: textMessage,
        image: imageSrc,
        repliedTo,
      });
    }
    setTextMessage("");
    setImageSrc(null);
    setRepliedTo(null);
    setRepliedToMessage(null);
  };

  console.log(messages);

  useEffect(() => {
    if (friends.length === 0) return;
    const userData = friends.find((user) => user._id === selectedUser);
    if (userData) setSelectedUserData(userData);
  }, [friends, selectedUser]);

  if (isVeiwingImage && viewingImageSrc) {
    return (
      <ImageView
        imageSrc={viewingImageSrc}
        setIsVeiwingImage={setIsVeiwingImage}
      />
    );
  }

  if (!selectedUser) {
    return (
      <div className="h-full w-full p-4">
        <div className="w-full h-full flex flex-col gap-3 justify-center items-center text-center">
          <div className="p-1 bubble">
            <img src="./logo-256.png" className="size-28" />
          </div>
          <h1 className="text-2xl font-bold mt-2">Welcome to Yappy Talk</h1>
          <p className="text-base-content/60 max-w-sm">
            Select a conversation from the sidebar to start chatting
          </p>
          {friends.length === 0 && (
            <button
              onClick={() => setIsSearchingFriends(true)}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-content"
            >
              <Plus className="size-5" />
              Add Friends
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isGettingMessages && scrolledTime === 1) {
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
      <div className="relative w-full flex gap-2 items-center bg-base-100 p-4 py-2 border-b border-base-content/20">
        <button onClick={() => setSelectedUser(null)}>
          <ArrowLeft />
        </button>
        <button
          ref={profileOpenBtnRef}
          onClick={() => setShowUserInfo((prev) => !prev)}
          className="flex items-center w-7/10 gap-1 truncate"
        >
          <div className="shrink-0 relative">
            <img
              src={selectedUserData?.profilePic}
              className="rounded-full size-10"
            />
            <span
              className={`absolute size-3 z-10 rounded-full ${friendsOnline.includes(selectedUser) ? "bg-green-500" : "bg-gray-500"}  bottom-0 right-0 outline-2 outline-base-100`}
            ></span>
          </div>
          <div className="flex flex-col w-full justify-start">
            <h2 className="truncate mr-auto">{selectedUserData.fullName}</h2>
            <p className="truncate mr-auto text-xs text-base-content/60">
              {friendsOnline.includes(selectedUser)
                ? selectedUserData.bio
                : `Last online: ${formatMessageTimeForBubble(selectedUserData?.lastOnline)}`}
            </p>
          </div>
        </button>
        <div className="ml-auto h-fit w-fit">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteChatBtn((prev) => !prev);
            }}
          >
            <EllipsisVertical />
          </button>
          {showDeleteChatBtn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (
                  confirm(
                    "Are you sure you want to delete chat with " +
                      selectedUserData.fullName,
                  )
                ) {
                  deleteAllMessage(selectedUser);
                  setShowDeleteChatBtn(false);
                }
              }}
              className="absolute top-8/10 right-2 z-40 bg-base-100 text-red-500 font-semibold border border-base-content/50 p-1.5 rounded-md flex shrink-0"
            >
              <Trash2 className="shrink-0" />
              <p className="shrink-0">Delete Chat</p>
            </button>
          )}
        </div>
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
        onScroll={handleOnscroll}
        className="relative flex flex-col-reverse w-full p-4 flex-1 overflow-y-scroll scrollbar-thumb-base-content/60 ky-700 scrollbar-track-base-content/20 scrollbar-thin [&::-webkit-scrollbar-button]:hidden"
      >
        {messages?.length == 0 && !isGettingMessages && (
          <div className="flex min-h-full w-full items-center justify-center py-10 text-center">
            <div className="max-w-sm rounded-3xl border border-base-content/10 bg-base-100/80 px-6 py-8 shadow-sm backdrop-blur-sm">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MessageSquare className="size-7" />
              </div>
              <h3 className="text-xl font-semibold">Start the conversation</h3>
              <p className="mt-2 text-sm text-base-content/60">
                Send a quick hello to break the ice.
              </p>
              <button
                onClick={() => sendMessage(selectedUser, { text: "hello" })}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-content"
              >
                <SendHorizontal className="size-4" />
                hello
              </button>
            </div>
          </div>
        )}
        {isSelectedUserTyping && (
          <div
            key={"typing"}
            className="mr-auto mt-3 lg:mt-4 flex gap-1 w-fit h-fit my-1 lg:my-2 text-2sm"
          >
            <div className="h-full w-8 lg:w-10 flex items-end shrink-0">
              <img
                src={selectedUserData.profilePic}
                className="size-8 lg:size-10 rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex justify-start">
                <span className="mt-auto rounded-t-sm rounded-r-sm -mr-1 inline-block w-0 h-0 border-solid border-t-0 border-r-0 border-l-10 border-b-10 border-l-transparent border-r-transparent border-t-transparent border-b-base-300"></span>
                <div className="p-1 w-fit rounded-md rounded-bl-xs bg-base-300 wrap-anywhere mr-5 lg:mr-10">
                  <p className="px-1">
                    <span className="loading loading-dots loading-xs"></span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {messages &&
          messages.toReversed().map((message) => {
            return message.receiverId === authUser._id ? (
              <div key={message.clientMsgId}>
                {message?.repliedTo && (
                  <div
                    key={`${message._id}repliedTo`}
                    className="ml-8 -mb-2 mt-2 opacity-60 message mr-auto flex gap-1 w-fit h-fit text-2sm"
                  >
                    <p className="mr-auto text-sm">
                      {selectedUserData.fullName} replied
                    </p>
                    <div className="flex flex-col">
                      <div className="relative flex justify-start">
                        <div className="p-1 w-fit rounded-md rounded-bl-xs bg-base-300 wrap-anywhere mr-5 lg:mr-10">
                          {message.repliedTo?.image && (
                            <img
                              className="w-30 lg:w-50 rounded-sm"
                              src={repliedTo.image}
                            />
                          )}
                          <span className="w-full flex h-fit">
                            <p className="px-1">{message.repliedTo.text}</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  onContextMenu={(e) => {
                    e.preventDefault();
                  }}
                  className="message mr-auto flex gap-1 w-fit h-fit my-1 lg:my-2 text-2sm"
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
                    <div className="relative flex justify-start">
                      <button
                        onClick={(e) => {
                          setRepliedTo(message._id);
                          setRepliedToMessage({
                            text: message?.text,
                            image: message?.image,
                          });
                        }}
                        className="opacity-70 absolute p-1 rounded-full hover:bg-base-300 hover:opacity-100 flex justify-center items-center top-[50%] -right-2 lg:right-2 -translate-y-1/2 mb-auto ml-auto"
                      >
                        <Reply className="size-5" />
                      </button>
                      <span className="mt-auto rounded-t-sm rounded-r-sm -mr-1 inline-block w-0 h-0 border-solid border-t-0 border-r-0 border-l-10 border-b-10 border-l-transparent border-r-transparent border-t-transparent border-b-base-300"></span>
                      <div className="p-1 w-fit rounded-md rounded-bl-xs bg-base-300 wrap-anywhere mr-5 lg:mr-10">
                        {message?.image && (
                          <img
                            onClick={() => {
                              setIsVeiwingImage(true);
                              setVeiwingImageSrc(message?.image);
                            }}
                            className="w-50 lg:w-80 rounded-sm cursor-pointer"
                            src={message.image}
                          />
                        )}
                        <span className="w-full flex h-fit">
                          <p className="px-1">{message.text}</p>
                          <p className="text-xs mt-auto ml-auto text-base-content/50">
                            {formatMessageTimeForBubble(message?.createdAt)}
                          </p>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div key={message.clientMsgId}>
                {message?.repliedTo && (
                  <div
                    key={`${message._id}repliedTo`}
                    className="mr-10 -mb-2 mt-2 opacity-60 message ml-auto flex gap-1 w-fit h-fit text-2sm"
                  >
                    <div className="flex flex-col">
                      <p className="ml-auto text-sm">You replied</p>
                      <div className="relative flex justify-end">
                        <div className="p-1 w-fit rounded-md rounded-br-xs bg-base-300 wrap-anywhere ml-5 lg:ml-10">
                          {message.repliedTo?.image && (
                            <img
                              className="w-30 lg:w-50 rounded-sm"
                              src={message.repliedTo?.image}
                            />
                          )}
                          <span className="w-full flex h-fit">
                            <p className="px-1">{message.repliedTo?.text}</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveMsg(message._id);
                  }}
                  className="message relative ml-auto flex gap-1 w-fit h-fit my-1 lg:my-2 text-2sm"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleTouchStart(message._id);
                  }}
                  onMouseUp={handleTouchEnd}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    handleTouchStart(message._id);
                  }}
                  onTouchEnd={handleTouchEnd}
                >
                  {activeMsg === message._id && (
                    <span className="absolute flex gap-4 -bottom-5 -left-2 lg:left-10 z-25 rounded-full bg-base-200 p-1.5 px-4 border border-base-content/50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingMessage(true);
                          setEditingMessageId(activeMsg);
                          setTextMessage(message?.text || "");
                        }}
                        className="flex flex-col justify-center items-center"
                      >
                        <SquarePen className="size-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(message._id, selectedUser);
                        }}
                        className="flex flex-col justify-center items-center"
                      >
                        <Trash2 className="size-6 text-red-500" />
                      </button>
                    </span>
                  )}
                  <div className="relative flex flex-col">
                    <p className="text-xs ml-auto mr-2">
                      {formatMessageTime(message.createdAt)}
                    </p>
                    <button
                      onClick={(e) => {
                        setRepliedTo(message._id);
                        setRepliedToMessage({
                          text: message?.text,
                          image: message?.image,
                        });
                      }}
                      className="opacity-70 absolute mt-2 p-1 rounded-full hover:bg-base-300 hover:opacity-100 md:flex justify-center items-center top-[50%] -left-2 lg:left-2 -translate-y-1/2 mb-auto ml-auto"
                    >
                      <Forward className="size-5" />
                    </button>
                    <div className="flex justify-end">
                      <div className="p-1 w-fit rounded-br-xs rounded-md bg-base-300 wrap-anywhere ml-5 lg:ml-10">
                        {message?.image && (
                          <div className="w-50 lg:w-70 relative rounded-sm overflow-hidden">
                            <img
                              onClick={() => {
                                setIsVeiwingImage(true);
                                setVeiwingImageSrc(message?.image);
                              }}
                              className="w-full cursor-pointer"
                              src={message.image}
                            />
                            {!message?.createdAt && (
                              <div className="absolute top-0 left-0 w-full h-full bg-base-300/20 backdrop-blur-sm flex justify-center items-center">
                                <span className="loading loading-infinity loading-xl stroke-3 w-15"></span>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="w-full flex h-fit">
                          <p className="px-1">{message.text}</p>
                          <p className="text-xs mt-auto ml-auto text-base-content/50 shrink-0">
                            {formatMessageTimeForBubble(message?.createdAt)}
                          </p>
                          {message.status === "sent" && (
                            <Check className="ml-1 size-3 lg:size-3.5 mt-auto opacity-60 stroke-3 shrink-0" />
                          )}
                          {message.status === "received" && (
                            <CheckCheck className="ml-1 size-3 lg:size-3.5 mt-auto opacity-60 stroke-3 shrink-0" />
                          )}
                          {message.status === "seen" && (
                            <CheckCheck className="ml-1 size-3 lg:size-3.5 mt-auto opacity-80 text-[#468aff] stroke-3 shrink-0" />
                          )}
                          {message.status === null && (
                            <Timer className="ml-1 size-3 lg:size-3.5 mt-auto opacity-60 stroke-3 shrink-0" />
                          )}
                        </span>
                      </div>
                      <span className="mt-auto rounded-t-sm rounded-r-sm -ml-1 inline-block w-0 h-0 border-solid border-t-10 border-r-0 border-l-10 border-b-0 border-l-base-300 border-r-transparent border-t-transparent border-b-transparent"></span>
                    </div>
                  </div>
                  <div className="h-full mt-auto flex items-end shrink-0">
                    <img
                      src={authUser.profilePic}
                      className="size-8 lg:size-10 rounded-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        {imageSrc && (
          <span className="absolute bottom-0 left-10 flex flex-col">
            <div className="relative rounded-md border-3 overflow-hidden size-fit border-base-content">
              <div className="absolute top-0 left-0 w-full flex bg-base-300/40 px-1">
                <p className="pl-1">Selected Image</p>
                <button onClick={() => setImageSrc(null)} className="ml-auto">
                  <X className="stroke-3" />
                </button>
              </div>
              <img src={imageSrc} className="w-40 lg:w-60" />
            </div>
            <span className="mx-auto -mt-0.5 inline-block w-0 h-0 border-solid border-t-[10px] border-r-[12px] border-l-[12px] border-b-0 border-l-transparent border-r-transparent border-t-base-content border-b-transparent"></span>
          </span>
        )}
        {isGettingMessages && scrolledTime !== 1 && (
          <div className="w-full flex justify-center">
            <span className="loading loading-spinner loading-xl text-base-content/80"></span>
          </div>
        )}
      </div>
      {/* chat options */}
      {isEditingMessage && editingMessageId && (
        <div className="w-full p-2 flex justify-between border-t border-base-content/30">
          <p>Editing message</p>
          <button
            onClick={() => {
              setIsEditingMessage(false);
              setEditingMessageId(null);
              setTextMessage("");
            }}
          >
            <X />
          </button>
        </div>
      )}
      {repliedTo && repliedToMessage && (
        <div className="w-full flex flex-col gap-1 p-2 border-t border-base-content/30">
          <div className="w-full flex justify-between">
            <p>Replying To</p>
            <button
              onClick={() => {
                setRepliedTo(null);
                setTextMessage("");
                setRepliedToMessage({});
              }}
            >
              <X />
            </button>
          </div>
          <div className="flex flex-col gap-1 w-full pl-2 opacity-80">
            {repliedToMessage?.image && (
              <img className="h-25 w-fit" src={repliedToMessage.image} />
            )}
            {repliedToMessage?.text && <p>{repliedToMessage.text}</p>}
          </div>
        </div>
      )}
      <div className="w-full p-4 flex gap-1 justify-center items-center">
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
          className="bg-base-300 w-full rounded-full p-1.5 px-5 focus:outline-0 text-xl"
          type="text"
          name="messageInput"
          id="messageInput"
          placeholder="Message"
          value={textMessage}
          onChange={(e) => {
            setTextMessage(e.target.value);
            handleTyping();
          }}
          autoFocus
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
