import React, { useMemo, useState } from 'react';
import { AlertTriangle, LineChart, ShieldAlert } from 'lucide-react';
import { analyzeInvoicePrice } from '../utils/anomalyDetection';

const defaultHistory = [45, 48, 47, 51, 49];

const AnomalyTask = () => {
  const [historyInput, setHistoryInput] = useState(defaultHistory.join(', '));
  const [currentPrice, setCurrentPrice] = useState('89');
  const [threshold, setThreshold] = useState('25');

  const result = useMemo(() => {
    const parsedHistory = historyInput
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => !Number.isNaN(value));

    return analyzeInvoicePrice({
      history: parsedHistory,
      currentPrice: Number(currentPrice),
      thresholdPercent: Number(threshold),
    });
  }, [historyInput, currentPrice, threshold]);

  return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700'>
      <div className='max-w-5xl mx-auto space-y-6'>
        <div className='bg-white border border-gray-200 rounded-xl p-5'>
          <div className='flex items-center gap-3'>
            <AlertTriangle className='text-amber-500 w-6 h-6' />
            <h1 className='text-2xl font-semibold'>Price Anomaly Challenge</h1>
          </div>
          <p className='mt-3 text-sm text-gray-600'>
            This task teaches you how to compare a new invoice item against vendor history and flag suspicious price jumps before payment.
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          <div className='bg-white border border-gray-200 rounded-xl p-5'>
            <label className='block text-sm font-medium mb-2'>Historical prices</label>
            <textarea
              value={historyInput}
              onChange={(e) => setHistoryInput(e.target.value)}
              rows={5}
              className='w-full border border-gray-300 rounded-lg p-3 outline-none'
              placeholder='45, 48, 47, 51, 49'
            />

            <label className='block text-sm font-medium mt-4 mb-2'>Current invoice price</label>
            <input
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              type='number'
              className='w-full border border-gray-300 rounded-lg p-3 outline-none'
            />

            <label className='block text-sm font-medium mt-4 mb-2'>Anomaly threshold (%)</label>
            <input
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              type='number'
              className='w-full border border-gray-300 rounded-lg p-3 outline-none'
            />
          </div>

          <div className='bg-white border border-gray-200 rounded-xl p-5'>
            <div className='flex items-center gap-3'>
              <LineChart className='w-5 h-5 text-blue-600' />
              <h2 className='text-lg font-semibold'>Detection result</h2>
            </div>

            <div className='mt-4 space-y-3'>
              <div className='p-3 rounded-lg bg-slate-50'>
                <p className='text-sm text-gray-500'>Average price</p>
                <p className='text-xl font-semibold'>${result.average.toFixed(2)}</p>
              </div>

              <div className='p-3 rounded-lg bg-slate-50'>
                <p className='text-sm text-gray-500'>Difference</p>
                <p className='text-xl font-semibold'> {result.differencePercent.toFixed(2)}% </p>
              </div>

              <div className={`p-3 rounded-lg ${result.isAnomaly ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                <div className='flex items-center gap-2 font-medium'>
                  <ShieldAlert className='w-4 h-4' />
                  {result.isAnomaly ? 'Anomaly detected' : 'Within tolerated range'}
                </div>
                <p className='mt-2 text-sm'>{result.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyTask;
