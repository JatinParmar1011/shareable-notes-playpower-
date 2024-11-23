import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from 'lucide-react';

const RichTextEditor = ({ selectedNote, handleNoteContentChange }) => {
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState(16); 
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]); 

  useEffect(() => {
    if (editorRef.current && selectedNote) {
      editorRef.current.innerHTML = selectedNote.content;
      setUndoStack([selectedNote.content]);
    }
  }, [selectedNote]);

  const handleFontSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setFontSize(newSize);
    applyFontSizeToNote(editorRef.current, newSize);
    handleNoteContentChange(editorRef.current.innerHTML);
    saveStateToUndoStack();
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleNoteContentChange(editorRef.current.innerHTML); 
    saveStateToUndoStack();
  };

  const saveStateToUndoStack = () => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      setUndoStack((prev) => [...prev, currentContent]);
      setRedoStack([]);
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 1) {
      const previousState = undoStack[undoStack.length - 2];
      setRedoStack((prev) => [undoStack[undoStack.length - 1], ...prev]); 
      setUndoStack((prev) => prev.slice(0, -1)); 
      editorRef.current.innerHTML = previousState;
      handleNoteContentChange(previousState); 
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setUndoStack((prev) => [...prev, nextState]); 
      setRedoStack((prev) => prev.slice(1));
      editorRef.current.innerHTML = nextState; 
      handleNoteContentChange(nextState); 
    }
  };

  const applyFontSizeToNote = (editor, newSize) => {
    if (editor) {
      const children = Array.from(editor.childNodes);
      children.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          child.style.fontSize = `${newSize}px`;
        }
        if (child.nodeType === Node.TEXT_NODE) {
          const span = document.createElement('span');
          span.style.fontSize = `${newSize}px`; 
          span.textContent = child.textContent;
          editor.replaceChild(span, child);
        }
      });
      editor.style.fontSize = `${newSize}px`; 
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      handleNoteContentChange(editorRef.current.innerHTML);
      saveStateToUndoStack();
    }
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-lg shadow-2xl max-w-6xl mx-auto overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-gray-300 via-gray-300 to-gray-400 border-b border-gray-400 shadow-md">
        {/* Undo Button */}
        <button
          onClick={handleUndo}
          title="Undo"
          className="p-2 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-all duration-300 transform hover:scale-110"
        >
          <Undo size={22} className="text-gray-700" />
        </button>

        {/* Redo Button */}
        <button
          onClick={handleRedo}
          title="Redo"
          className="p-2 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-all duration-300 transform hover:scale-110"
        >
          <Redo size={22} className="text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-400 mx-2" />

        {/* Other buttons (Bold, Italic, etc.) */}
        <button
          onClick={() => execCommand('bold')}
          title="Bold"
          className="p-2 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-all duration-300 transform hover:scale-110"
        >
          <Bold size={22} className="text-gray-700" />
        </button>
        <button
          onClick={() => execCommand('italic')}
          title="Italic"
          className="p-2 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-all duration-300 transform hover:scale-110"
        >
          <Italic size={22} className="text-gray-700" />
        </button>
        <button
          onClick={() => execCommand('underline')}
          title="Underline"
          className="p-2 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-all duration-300 transform hover:scale-110"
        >
          <Underline size={22} className="text-gray-700" />
        </button>
        <div className="w-px h-6 bg-gray-400 mx-2" />
        <button
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
          className="p-2 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-all duration-300 transform hover:scale-110"
        >
          <AlignLeft size={22} className="text-gray-700" />
        </button>
        <button
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
          className="p-2 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-all duration-300 transform hover:scale-110"
        >
          <AlignCenter size={22} className="text-gray-700" />
        </button>
        <button
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
          className="p-2 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition-all duration-300 transform hover:scale-110"
        >
          <AlignRight size={22} className="text-gray-700" />
        </button>
        <div className="w-px h-6 bg-gray-400 mx-2" />
        <select
          value={fontSize}
          onChange={handleFontSizeChange}
          title="Font Size"
          className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring focus:ring-blue-300 transition-all duration-200"
        >
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px (Default)</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="30">30px</option>
        </select>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[400px] p-6 bg-gray-50 focus:outline-none prose max-w-none border border-gray-200 rounded-b-lg shadow-inner"
        onInput={handleInput}
        spellCheck="true"
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: `${fontSize}px`,
          lineHeight: '1.8',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
