import React from 'react';
import { IconButton, Tooltip, Stack } from '@mui/material';
import {
  ContentCopy as CopyIcon,
  ContentPaste as PasteIcon,
} from '@mui/icons-material';
import { useCopyPaste } from '../hooks/useCopyPaste';

interface CopyPasteButtonsProps {
  type: string;
  data?: any;
  onPaste?: (data: any) => void;
  copyTooltip?: string;
  pasteTooltip?: string;
  size?: 'small' | 'medium' | 'large';
  showCopy?: boolean;
  showPaste?: boolean;
  onCopySuccess?: () => void;
}

export function CopyPasteButtons({
  type,
  data,
  onPaste,
  copyTooltip = 'Copy (Ctrl+C)',
  pasteTooltip = 'Paste (Ctrl+V)',
  size = 'small',
  showCopy = true,
  showPaste = true,
  onCopySuccess,
}: CopyPasteButtonsProps) {
  const { copy, paste, hasType } = useCopyPaste();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data) {
      copy(type, data);
      onCopySuccess?.();
    }
  };

  const handlePaste = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pastedData = paste(type);
    if (pastedData && onPaste) {
      onPaste(pastedData);
    }
  };

  const canPaste = hasType(type);

  return (
    <Stack direction="row" spacing={0.5}>
      {showCopy && data && (
        <Tooltip title={copyTooltip}>
          <IconButton size={size} onClick={handleCopy}>
            <CopyIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {showPaste && onPaste && (
        <Tooltip title={canPaste ? pasteTooltip : 'Nothing to paste'}>
          <span>
            <IconButton size={size} onClick={handlePaste} disabled={!canPaste}>
              <PasteIcon fontSize={size} />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Stack>
  );
}

interface CopyButtonProps {
  type: string;
  data: any;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
  onSuccess?: () => void;
}

export function CopyButton({
  type,
  data,
  tooltip = 'Copy',
  size = 'small',
  onSuccess,
}: CopyButtonProps) {
  const { copy } = useCopyPaste();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(type, data);
    onSuccess?.();
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton size={size} onClick={handleCopy}>
        <CopyIcon fontSize={size} />
      </IconButton>
    </Tooltip>
  );
}

interface PasteButtonProps {
  type: string;
  onPaste: (data: any) => void;
  tooltip?: string;
  size?: 'small' | 'medium' | 'large';
}

export function PasteButton({
  type,
  onPaste,
  tooltip = 'Paste',
  size = 'small',
}: PasteButtonProps) {
  const { paste, hasType } = useCopyPaste();

  const handlePaste = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pastedData = paste(type);
    if (pastedData) {
      onPaste(pastedData);
    }
  };

  const canPaste = hasType(type);

  return (
    <Tooltip title={canPaste ? tooltip : 'Nothing to paste'}>
      <span>
        <IconButton size={size} onClick={handlePaste} disabled={!canPaste}>
          <PasteIcon fontSize={size} />
        </IconButton>
      </span>
    </Tooltip>
  );
}
