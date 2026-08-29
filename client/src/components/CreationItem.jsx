import React, { useState } from "react";
import Markdown from 'react-markdown';

const CreationItem = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    const itemDate = item.createdAt || item.created_at || new Date().toISOString();
    const itemType = item.type || 'invoice';

    return (
        <div onClick={() => setExpanded(!expanded)}
            className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer"
        >
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h2>{item.prompt}</h2>
                    <p className="text-gray-500">{itemType} - {new Date(itemDate).toLocaleDateString()}</p>
                </div>
                <button
                    className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full"
                    type="button"
                >
                    {itemType}
                </button>
            </div>
            {expanded && (
                <div className="mt-4">
                    {item.type === 'image' ? (
                        <img src={item.content} alt="image" className="mt-3 w-full max-w-md" />
                    ) : (
                        <div className="mt-3 w-full overflow-y-scroll text-sm text-slate-700">
                            <div className="reset-tw">
                                <Markdown>
                                {item.content}
                                </Markdown>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CreationItem