import React from 'react'
import { Link } from 'react-router-dom';
import { LogOut, MessageSquare, Settings, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

function NavBar() {
  const { authUser, logOut } = useAuthStore();

  return (
    <header className='navbar border-b border-base-300 bg-base-100 px-4 md:px-6'>
      <div className='flex-1'>
        <Link to='/' className='btn btn-ghost gap-2 text-xl normal-case'>
          <MessageSquare className='size-6 text-primary' />
          <span>Chat App</span>
        </Link>
      </div>

      <div className='flex items-center gap-2'>
        <Link to='/setting' className='btn btn-ghost btn-sm'>
          <Settings className='size-4' />
          <span className='hidden sm:inline'>Setting</span>
        </Link>

        {authUser && (
          <>
            <Link to='/profile' className='btn btn-ghost btn-sm'>
              <User className='size-4' />
              <span className='hidden sm:inline'>Profile</span>
            </Link>

            <button type='button' onClick={logOut} className='btn btn-ghost btn-sm'>
              <LogOut className='size-4' />
              <span className='hidden sm:inline'>Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default NavBar