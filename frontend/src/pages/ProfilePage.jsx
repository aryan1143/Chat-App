import { Camera, Check, Info, SquarePen } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

function ProfilePage() {
  const [memberSince, setMemberSince] = useState();
  const [fullNameInput, setFullNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [isEditing, setIsEditing] = useState({
    fullName: false,
    bio: false,
  });
  const fullNameInputRef = useRef(null);
  const bioInputRef = useRef(null);

  const { authUser, updateProfile } = useAuthStore();

  useEffect(() => {
    setFullNameInput(authUser.fullName);
    setBioInput(authUser.bio);
    const dateObj = new Date(authUser.createdAt);
    const options = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    const formatted = dateObj.toLocaleDateString('en-GB', options).replace(/ /g, '-');
    setMemberSince(formatted);
  }, [authUser]);

  //function to handle updateProfile
  const handleUpdateProfile = () => {
    console.log(fullNameInput, authUser.fullName)
    if(fullNameInput !== authUser.fullName && fullNameInput) {
      return updateProfile({fullName: fullNameInput});
    }
    if(bioInput !== authUser.bio && bioInput) {
      return updateProfile({bio: bioInput});
    }
  }

  return (
    <div className='grow w-screen grid grid-cols-1 lg:grid-cols-[3fr_7fr] items-center'>
      {/* left side--- */}
      <div className='lg:h-9/10 h-9/10 flex flex-col gap-5 items-center px-5 lg:px-15'>
        {/* profile info */}
        <div className='lg:h-7/10 w-full bg-primary/10 rounded-md flex flex-col gap-3 items-center px-2 py-5'>
          <h1 className='text-2xl font-bold mt-2 text-primary-content'>Profile</h1>
          <p className='text-primary-content/50'>Your Profile Information</p>
          <div className='relative'>
            {/* profile-pic */}
            <img className='size-30 lg:size-25 rounded-full' src={authUser.profilePic} /> 
            <button className='absolute flex gap-1 p-1 px-2 bg-primary rounded-xl -bottom-3 left-[50%] translate-x-[-50%]'>
              <Camera />
              <p>Edit</p>
            </button>
          </div>
          {/* name feild */}
          <div className={`w-8/10 flex flex-col items-center border-b-2 ${isEditing.fullName ? "border-primary-content" : "border-primary-content/40"} pb-1`}>
            <p className='text-xs self-start'>Full Name</p>
            <div className='flex gap-2 items-center w-full'>
              {isEditing.fullName ?
                <>
                  <input name='fullName' value={fullNameInput} onChange={(e)=> setFullNameInput(e.target.value)} autoFocus ref={fullNameInputRef} className='text-md flex-1 font-semibold text-primary-content focus:outline-0' type="text" />
                  <button className='w-fit' onClick={() =>{handleUpdateProfile(); setIsEditing(prev => ({ ...prev, fullName: !prev.fullName }))}}>
                    <Check className='size-5' />
                  </button>
                </>
                :
                <>
                  <p className='text-md flex-1 truncate font-semibold text-primary-content'>{authUser.fullName}</p>
                  <button className='w-fit' onClick={() => setIsEditing(prev => ({ ...prev, fullName: !prev.fullName }))}>
                    <SquarePen className='size-5' />
                  </button>
                </>
              }
            </div>
          </div>
          {/* bio feild */}
          <div className={`w-8/10 flex flex-col items-center border-b-2 ${isEditing.bio ? "border-primary-content" : "border-primary-content/40"} pb-1`}>
            <p className='text-xs self-start'>About</p>
            <div className='flex gap-2 items-center w-full'>
              {isEditing.bio ?
                <>
                  <input name='bio' value={bioInput} onChange={(e)=> setBioInput(e.target.value)} autoFocus ref={bioInputRef} className='text-sm flex-1 text-primary-content focus:outline-0' type="text" />
                  <button className='w-fit' onClick={() =>{handleUpdateProfile(); setIsEditing(prev => ({ ...prev, bio: !prev.bio }))}}>
                    <Check className='size-4' />
                  </button>
                </>
                :
                <>
                  <p className='text-sm flex-1 line-clamp-2 text-primary-content'>{authUser.bio}</p>
                  <button className='w-fit' onClick={() => setIsEditing(prev => ({ ...prev, bio: !prev.bio }))}>
                    <SquarePen className='size-4' />
                  </button>
                </>
              }
            </div>
          </div>
          {/* email feild not-editable*/}
          <div className='w-8/10 flex flex-col items-center mt-2'>
            <p className='text-xs self-start'>Email</p>
            <div className='flex gap-2 items-center w-full'>
              <p className='text-2sm flex-1 truncate text-primary-content/70'>{authUser.email}</p>
            </div>
          </div>

        </div>

        {/* account info */}
        <div className='h-fit w-full bg-primary/8 rounded-md p-4'>
          <div className='flex gap-2 items-center'>
            <h2 className='text-primary-content'>Account Information</h2>
            <Info className='size-4' />
          </div>

          <div className='flex h-25 grow flex-col text-md text-primary-content/80 lg:text-xs'>
            <div className='h-1/2 border-b-2 border-primary-content/50 flex justify-between items-center pt-3'>
              <p >Member since</p>
              <p>{memberSince}</p>
            </div>
            <div className='h-1/2 border-b-2 border-primary-content/50 flex justify-between items-center pt-3'>
              <p>Account status</p>
              <p className='text-green-400'>• Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* right side--- */}
      <div className='hidden'>

      </div>
    </div>
  )
}

export default ProfilePage