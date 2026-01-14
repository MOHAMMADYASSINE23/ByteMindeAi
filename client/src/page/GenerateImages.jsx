import React, { useState } from 'react';
import { Sparkles, Image, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

const imageStyle = [
  'Realistic',
  'Ghibli style',
  'Anime style',
  'Cartoon style',
  'Fantasy style',
  'Realistic style',
  '3D style',
  'Portrait style'
];

const GenerateImages = () => {
  const { getToken } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [input, setInput] = useState('');
  const [publish, setPublish] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3000/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: `${input} in ${selectedStyle}`,
          publish,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedImage(data);
      } else {
        setError(data.message || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 items-start flex flex-wrap gap-4 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00AD25]'/>
          <h1 className='text-xl font-semibold'>AI Image Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Describe Your Image</p>
        <textarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          rows={4}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='Describe what you want to see in the image..'
          required
        />
        <p className='mt-4 text-sm font-medium'>Style</p>
        <div className='mt-3 flex gap-3 flex-wrap sm:mx-w-9/11'>
          {imageStyle.map((item) => (
            <span
              onClick={() => setSelectedStyle(item)}
              className={`px-4 py-1 text-xs rounded-full border cursor-pointer ${
                selectedStyle === item
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-500  border-gray-300'
              }`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
        <div className='mt-6 flex items-center gap-2'>
              <label className='relative cursor-pointer'>
                <input type='checkbox' onChange={(e)=>setPublish(e.target.checked)} checked={publish} className='sr-only peer' />
                <div className='w-9 h-5 bg-slate-300 rounded-full  peer-checked:bg-green-500 transition'></div>
                <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
              </label>
              <p className='text-sm'>Make this image Public</p>
            </div>
        <br/>
        <button
          type="submit"
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 rounded-lg mt-6 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? (
            <>
              <Loader2 className='w-5 h-5 animate-spin' />
              Generating...
            </>
          ) : (
            <>
              <Image className='w-5' />
              Generate Image
            </>
          )}
        </button>

        {error && (
          <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-700 text-sm'>{error}</p>
          </div>
        )}
      </form>
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Image className='w-5 h-5 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>Generated Image</h1>
        </div>
        <div className='flex-1 flex justify-center items-center p-4'>
          {generatedImage ? (
            <div className='w-full space-y-4'>
              {/* Main Image */}
              <div className='relative group'>
                <img
                  src={generatedImage.optimized || generatedImage.content}
                  alt="Generated AI image"
                  className='w-full max-w-sm mx-auto rounded-lg shadow-lg'
                  loading="lazy"
                />
                <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <a
                    href={generatedImage.content}
                    download={`ai-image-${Date.now()}.png`}
                    className='bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors'
                    title="Download full size"
                  >
                    <Download className='w-4 h-4' />
                  </a>
                </div>
              </div>

              {/* Image Info */}
              <div className='text-center space-y-2'>
                <p className='text-sm text-gray-600'>
                  <strong>Prompt:</strong> {input}
                </p>
                <p className='text-sm text-gray-600'>
                  <strong>Style:</strong> {selectedStyle}
                </p>
                {generatedImage.sizes && (
                  <p className='text-xs text-gray-500'>
                    Available sizes: {generatedImage.sizes.thumbnail}, {generatedImage.sizes.optimized}, {generatedImage.sizes.original}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2 justify-center'>
                <button
                  onClick={() => setGeneratedImage(null)}
                  className='px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                >
                  Generate Another
                </button>
                <a
                  href={generatedImage.content}
                  download={`ai-image-${Date.now()}.png`}
                  className='px-4 py-2 text-sm bg-[#00AD25] hover:bg-[#00AD25]/90 text-white rounded-lg transition-colors flex items-center gap-2'
                >
                  <Download className='w-4 h-4' />
                  Download
                </a>
              </div>
            </div>
          ) : (
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Image className='w-9 h-9' />
              <p>Enter a description and click "Generate image" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default GenerateImages