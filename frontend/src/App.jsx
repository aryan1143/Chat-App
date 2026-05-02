import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SettingPage from "./pages/SettingPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import { useChatAndMessageStore } from "./store/useChatAndMessageStore";
import { useSettingStore } from "./store/useSettingAuth";

function App() {
  const { checkAuth, authUser, isCheckingAuth, socket } = useAuthStore();
  const {
    getNewMessages,
    subscribeToMessages,
    handleSelectedUserStartedTyping,
    handleSelectedUserStoppedTyping,
  } = useChatAndMessageStore();
  const { setInitialPrivacySetting } = useSettingStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    subscribeToMessages();
    handleSelectedUserStartedTyping();
    handleSelectedUserStoppedTyping();
  }, [socket]);

  useEffect(() => {
    if (!authUser) return;
    getNewMessages();
    setInitialPrivacySetting({
      lastSeenAndOnline: authUser?.lastSeenAndOnline,
      readReceipt: authUser?.readReceipt,
    });
  }, [authUser]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="h-dvh w-dvw flex justify-center items-center bg-base-100 text-base-content">
        <span className="loading loading-bars loading-xl"></span>
      </div>
    );
  }

  return (
    <>
      <div className="w-dvw h-dvh min-h-dvh overflow-hidden flex flex-col bg-base-100 text-base-content select-none">
        <NavBar />

        <div className="flex-1 min-h-0">
          <Routes>
            <Route
              path="/"
              element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
            />
            <Route
              path="/signup"
              element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />}
            />
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
            />
            <Route
              path="/setting"
              element={authUser ? <SettingPage /> : <Navigate to={"/login"} />}
            />
            <Route
              path="/profile"
              element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />}
            />
          </Routes>
        </div>

        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </>
  );
}

export default App;
