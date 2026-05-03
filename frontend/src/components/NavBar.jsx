import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatAndMessageStore } from "../store/useChatAndMessageStore";

function NavBar() {
  const { authUser, logOut } = useAuthStore();

  const pathname = useLocation().pathname;

  const { selectedUser } = useChatAndMessageStore();

  return (
    <header
      className={`${selectedUser && "hidden md:flex"} sticky top-0 z-20 navbar border-b border-base-300 bg-base-100 px-4 md:px-6`}
    >
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost gap-2 text-xl normal-case">
          {pathname !== "/profile" && pathname !== "/setting" ? (
            <>
              <img src="./logo-256.png" className="size-10" />
              <span>Yappy Now</span>
            </>
          ) : (
            <>
              <ArrowLeft />
              Back
            </>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/setting" className="btn btn-ghost btn-sm">
          <Settings className="size-4" />
          <span className="hidden sm:inline">Setting</span>
        </Link>

        {authUser && (
          <>
            <Link to="/profile" className="btn btn-ghost btn-sm">
              <User className="size-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            <button
              type="button"
              onClick={logOut}
              className="btn btn-ghost btn-sm"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default NavBar;
