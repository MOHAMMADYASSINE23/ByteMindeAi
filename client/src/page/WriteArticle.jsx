import { Sparkles, UploadCloud, ShieldCheck } from 'lucide-react'
import React, { useState } from 'react'

const WriteArticle = () => {
  const invoiceTypes = [
    { value: 'invoice', label: 'Invoice' },
    { value: 'receipt', label: 'Expense Receipt' },
    { value: 'purchase-order', label: 'Purchase Order' },
  ]

  const [selectedType, setSelectedType] = useState(invoiceTypes[0]);
  const [input, setInput] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
  };

  return (
    <div className='h-full overflow-y-scroll p-6 items-start flex flex-wrap gap-4 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Invoice Intake</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Vendor name</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='ABC Supplies'
          required
        />

        <p className='mt-4 text-sm font-medium'>Document type</p>
        <div className='mt-3 flex gap-3 flex-wrap'>
          {invoiceTypes.map((item) => (
            <span
              onClick={() => setSelectedType(item)}
              className={`px-4 py-1 text-xs rounded-full border cursor-pointer ${
                selectedType.value === item.value
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'border-gray-300 text-gray-700'
              }`}
              key={item.value}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div className='mt-5 flex items-center gap-3'>
          <UploadCloud className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Upload document</h1>
        </div>

        <input
          type="file"
          accept="application/pdf,image/*"
          className='w-full p-2 px-3 mt-3 outline-none text-sm rounded-md border border-gray-300'
          required
        />

        <button
          type="submit"
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#3C81F6] to-[#9234EE] text-white px-3.5 py-2.5 rounded-md mt-6 hover:opacity-90 transition cursor-pointer'
        >
          <ShieldCheck className='w-5' />
          Audit Document
        </button>
      </form>

      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
        <div className='flex items-center gap-3'>
          <ShieldCheck className='w-5 h-5 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Audit Summary</h1>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400 text-center'>
            <ShieldCheck className='w-9 h-9' />
            <p>Upload an invoice to get extraction, risk score, and historical price comparisons.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WriteArticle