import { ChangeEvent, useState } from 'react';
import { Button } from './Button';

interface ModalProps {
  showModal: boolean;
  onClose: () => void;
  onSave: (inputValue: string) => void;
}

function Modal({ showModal, onClose, onSave }: ModalProps) {
  const [inputValue, setInputValue] = useState<string>(
    localStorage.getItem('filepathPrefix') ?? 'c:/git/grizzly'
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSave = () => {
    onSave(inputValue);
    onClose();
  };

  return (
    <div
      className={`modal ${
        showModal ? 'visible items-center justify-center' : 'hidden'
      } relative z-10`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white dark:bg-slate-700 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="flex h-12 w-12 mx-5 flex-shrink-0  self-end items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 text-slate-300 dark:text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-folder"
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                  </svg>
                </div>
                <div className="flex flex-col mx-3">
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label htmlFor="inputField">Filepath prefix</label>
                  <input
                    className="w-full rounded mb-1 px-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-white border-none focus:border-none focus:border-0"
                    type="text"
                    id="inputField"
                    value={inputValue}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-600 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <Button
                onClick={handleSave}
                onKeyDown={handleSave}
                type="button"
                className="inline-flex w-full text-green-300 hover:text-green-500 justify-center rounded-md bg-slate-500 dark:bg-slate-700 px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto"
              >
                Save
              </Button>
              <Button
                type="button"
                onClick={onClose}
                onKeyDown={onClose}
                className="inline-flex w-full text-orange-300 hover:text-orange-500 justify-center rounded-md bg-slate-500 dark:bg-slate-700 px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Modal };
