import NavBar from "./components/NavBar";
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import SettingPage from './pages/SettingPage';
import ProfilePage from './pages/ProfilePage';

import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from "react";
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from "react-hot-toast";


function App() {

  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="h-dvh w-dvw flex justify-center items-center">
        <span className="loading loading-bars loading-xl"></span>
      </div>
    )
  }


  return (
    <>
      <div className="h-dvh w-dvw flex flex-col">
        <NavBar />

        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to={"/login"} />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
          <Route path="/setting" element={authUser ? <SettingPage /> : <Navigate to={"/login"} />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />} />
        </Routes>

        <Toaster
          position="bottom-right"
          reverseOrder={false}
        />
      </div>
    </>
  )
}

export default App
