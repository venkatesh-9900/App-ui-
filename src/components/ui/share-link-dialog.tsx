import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Typography } from '@mui/material';

interface ShareLinkDialogProps {
  /**
   * The link to be displayed and copied.
   */
  link: string;
  /**
   * If `true`, the dialog is open.
   */
  open: boolean;
  /**
   * Callback fired when the component requests to be closed.
   */
  onClose: () => void;
}

/**
 * A dialog for displaying a link with a button to copy it to the clipboard.
 */
export const ShareLinkDialog: React.FC<ShareLinkDialogProps> = ({
  link,
  open,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      // Reset the copied state after a few seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // You could add user feedback here for the error case
    }
  };

  // Ensure the copied state is reset when the dialog is closed and reopened
  React.useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle variant="h3" sx={{ fontSize: 30, mt: 2, color: 'text.primary' }}>Session Chat Share Link</DialogTitle>
      <DialogContent>
        <Typography variant="h4" sx={{ fontSize: 16, mt: 1, color: 'text.secondary' }}> Please copy below link to share the session chat with other users within your organization. </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
          <TextField
            fullWidth
            value={link}
            // Make it read-only
            slotProps={{input: { readOnly: true }}}
            variant="outlined"
            size="small"
          />
          <IconButton
            aria-label="copy link"
            onClick={copied ? ()=>{} : handleCopy}
            color={copied ? 'success' : 'primary'}
          >
            {copied ? <CheckIcon /> : <ContentCopyIcon />}
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// --- Example Usage ---

export const ShareLinkDialogExample = () => {
  const [open, setOpen] = useState(false);
  const exampleLink = 'https://example.com/shared-item-12345-shared-item-12345-shared-item-12345-shared-item-12345-shared-item-12345?id=shared-item-12345';

  return (
    <div>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Share Dialog
      </Button>
      <ShareLinkDialog link={exampleLink} open={open} onClose={() => setOpen(false)} />
    </div>
  );
};
