
import React from 'react';

const Modal = ({ isOpen, onClose, title, onConfirm, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="mr-2 bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
          <button onClick={onConfirm} className="bg-blue-500 text-white px-4 py-2 rounded-md">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;