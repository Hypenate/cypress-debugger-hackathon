import { ChangeEvent, useState } from 'react';
import { Button } from './Button';

interface ModalProps {
  showModal: boolean;
  onClose: () => void;
  onSave: (inputValue: string) => void;
}

function Modal({ showModal, onClose, onSave }: ModalProps) {
  const [inputValue, setInputValue] = useState<string>('');

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
      }`}
      role="dialog"
    >
      <div className="modal-content flex flex-row gap-4 m-4">
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label htmlFor="inputField">Filepath prefix</label>
        <input
          type="text"
          id="inputField"
          value={inputValue}
          onChange={handleInputChange}
        />
        <Button onClick={handleSave} onKeyDown={handleSave}>
          Save
        </Button>
        <Button className="close" onClick={onClose} onKeyDown={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export { Modal };
