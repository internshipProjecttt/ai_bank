'use client';

import ModalWrapper from './ModalWrapper';
import OcrScanModalContent from './OcrScanModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accountId: number;
}

export default function OcrScanModal({
  isOpen,
  onClose,
  accountId,
}: Props) {
  return (
    <ModalWrapper open={isOpen} onClose={onClose}>
      <OcrScanModalContent />
    </ModalWrapper>
  );
}
