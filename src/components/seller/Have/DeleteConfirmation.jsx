import React from "react";
import { Loader } from "lucide-react";

const DeleteConfirmation = ({ onCancel, onConfirm, isLoading }) => {
  return (
    <div className="fixed inset-0 -mt-8 ml-4 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-black max-w-lg w-full">
        <div className="mb-15"> {/* Increased spacing below text */}
          <p className="text-[14] font-bold leading-relaxed">
            This was not created by you. Click Yes to Delete anyways?
          </p>
        </div>

        <div className="flex justify-between mt-14 gap-10"> {/* Increased gap between buttons */}
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-6 border border-black rounded-sm text-black bg-white font-bold hover:bg-gray-100 transition text-[12] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-6 bg-black text-white font-bold rounded-sm hover:bg-gray-800 transition text-[12] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Deleting...
              </>
            ) : (
              "Yes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
