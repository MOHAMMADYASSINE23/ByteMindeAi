import React, { useState } from 'react';
import { Sparkles, FileText, TriangleAlert, ShieldCheck, CircleDollarSign } from 'lucide-react';

const ReviewResume = () => {
  const [input, setInput] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
  };

  return (
    <div className='h-full overflow-y-scroll p-6 items-start flex flex-wrap gap-4 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Invoice Risk Review</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Upload invoice or receipt</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          type="file"
          accept="application/pdf,image/*"
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          required
        />

        <p className='mt-4 text-sm font-medium text-gray-500'>Supports PDF, PNG, and JPG invoice files.</p>

        <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 rounded-lg mt-6 text-sm cursor-pointer'>
          <FileText className='w-5' />
          Review Invoice
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
        <div className='flex items-center gap-3'>
          <FileText className='w-5 h-5 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Risk Analysis</h1>
        </div>

        <div className='mt-5 space-y-4'>
          <div className='p-4 border border-amber-200 bg-amber-50 rounded-lg'>
            <div className='flex items-center gap-2 text-amber-700 font-medium'>
              <TriangleAlert className='w-4 h-4' />
              Price anomaly detected
            </div>
            <p className='mt-2 text-sm text-amber-800'>Keyboard price is 85% above the vendor's historical average of $48.</p>
          </div>

          <div className='p-4 border border-emerald-200 bg-emerald-50 rounded-lg'>
            <div className='flex items-center gap-2 text-emerald-700 font-medium'>
              <ShieldCheck className='w-4 h-4' />
              Duplicate check
            </div>
            <p className='mt-2 text-sm text-emerald-800'>No duplicate invoice number found in the last 90 days.</p>
          </div>

          <div className='p-4 border border-blue-200 bg-blue-50 rounded-lg'>
            <div className='flex items-center gap-2 text-blue-700 font-medium'>
              <CircleDollarSign className='w-4 h-4' />
              Risk score
            </div>
            <p className='mt-2 text-sm text-blue-800'>Overall risk level: Medium (67/100). Requires reviewer confirmation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewResume