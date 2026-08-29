import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'


const Hero = () => {
     const navigate = useNavigate();
  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen'>
        <div className='text-center mb-6'>
            <h1 className='text-3x1 sm:text-5x1 md:text-6x1 2xl:text-7xl font-semibold mx-auto leading-[1.2]'> Audit invoices <br/> before they become <span className='text-primary'> costly mistakes </span> </h1>
            <p className='mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto max-sm:text-xs text-gray-600'>Use AI and rule-based checks to spot duplicate charges, suspicious pricing, policy violations, and out-of-pattern expenses before payment.</p>
        </div>
        
        <div className='flex flex-wrap justify-center items-center gap-5 text-sm mx-sm:text-xs'>
            <button onClick={() => navigate('/ai')} className='bg-primary text-white px-10 py-2.5 rounded-lg hover:scale-102 active:scale-96 transition cursor-pointer'>Get Started</button>
            <button onClick={() => navigate('/ai/review-resume')} className='bg-primary text-black px-10 py-2.5 rounded-lg hover:scale-102 active:scale-96 transition cursor-pointer'>Review sample</button>
        </div>
        <div className='flex items-center gap-4 mt-8 mx-auto text-gray-600'>
         <img src={assets.user_group} alt="" className='h-8' /> Trusted by finance teams and operators
        </div>
    </div>
  )
}

export default Hero