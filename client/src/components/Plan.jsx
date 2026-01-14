import React from 'react'
import { PricingTable } from '@clerk/clerk-react'

const Plan = () => {
  return (
    <div className='max-w-2xl mx-auto z-20 my-10'>
        <div className='text-center'>
            <h2 className='text-slate-700 text-[42px] font-semibold'> Choose the plan</h2>
            <p className='text-gray-500 max-w-lg mx-auto'>Select the plan that best fits your needs and start leveraging the power of AI to enhance your content creation process.</p>
        </div>
        <div className='mt-10 max-sm:mx-0-8'>
            <PricingTable/>
        </div>
    </div>
  )
}

export default Plan