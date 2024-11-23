import React from 'react';
import { Pin, Trash2 } from 'lucide-react';

const NoteList = ({ notes, togglePin, deleteNote, setSelectedNote, selectedNote }) => {
  // Helper function to format the timestamp into a human-readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleString(undefined, options);
  };

  return (
    <div className="space-y-4 max-h-[800px] overflow-y-auto p-4 border rounded-lg bg-white shadow-md custom-scrollbar">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer 
            ${note.isPinned ? 'bg-purple-500 bg-opacity-10 border-l-4 border-[#3B1E54]' : 'bg-white'} 
            ${selectedNote?.id === note.id ? 'ring-2 ring-[#3B1E54]' : ''}`}
          onClick={() => setSelectedNote(note)}
        >
          <div className="flex justify-between items-start">
            {/* Note title */}
            <h3 className="text-lg font-semibold text-gray-800 truncate">{note.title || 'Untitled'}</h3>
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(note.id);
                }}
                title="Pin Note"
              >
                <Pin size={20} className={note.isPinned ? 'text-[#3B1E54]' : 'text-gray-400 hover:text-[#3B1E54]'} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                title="Delete Note"
              >
                <Trash2 size={20} className="text-gray-400 hover:text-red-600" />
              </button>
            </div>
          </div>
          {/* Note metadata */}
          <p className="text-sm text-gray-500 mt-2">
            {formatDate(note.lastModified)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
