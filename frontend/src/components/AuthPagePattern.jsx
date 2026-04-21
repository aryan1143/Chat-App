import React from 'react'

function AuthPagePattern() {
  return (
    <div className='relative w-[85%] max-w-lg aspect-square rounded-3xl overflow-hidden border border-base-300/70 bg-base-100 shadow-2xl'>
      <div className='absolute inset-0 auth-grid-overlay'></div>

      <div className='absolute -top-14 -left-14 h-44 w-44 rounded-full bg-primary/35 blur-3xl auth-float-slow'></div>
      <div className='absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-secondary/35 blur-3xl auth-float-reverse'></div>
      <div className='absolute top-10 right-10 h-24 w-24 rounded-full bg-accent/30 blur-2xl auth-float-fast'></div>

      <div className='absolute inset-7 rounded-2xl border border-base-300/80 bg-base-200/55 backdrop-blur-sm'>
        <div className='relative h-full w-full p-6'>
          <div className='auth-orbit-track absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25'></div>
          <div className='auth-orbit-dot auth-orbit-one'></div>
          <div className='auth-orbit-dot auth-orbit-two'></div>

          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center'>
            <p className='text-xs uppercase tracking-[0.18em] text-primary/80'>Live Chat Space</p>
            <h3 className='mt-2 text-2xl font-bold'>Welcome</h3>
            <p className='mt-2 text-sm text-base-content/70'>Build your profile and jump into real-time conversations.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPagePattern