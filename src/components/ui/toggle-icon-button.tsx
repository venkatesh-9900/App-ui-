import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import { SvgIconProps } from '@mui/material/SvgIcon';
import Box from '@mui/material/Box';
import LinkIcon from '@mui/icons-material/Link';
import { CircularProgress } from '@mui/material';

interface MuiToggleIconButtonProps {
  isSharable: boolean;
  onToggleChange: (isToggled: boolean) => void;
  isLoading: boolean;
}

export const MuiToggleIconButton: React.FC<MuiToggleIconButtonProps> = ({
  isSharable,
  onToggleChange,
  isLoading
}) => {
  const handleToggle = () => {
    onToggleChange(!isSharable);
  };

  const label = isSharable ? 'ON' : 'OFF';

  return (
    <IconButton aria-label={label} onClick={isLoading ? () => {} : handleToggle}>
      {isLoading ? <CircularProgress size={16} color="success"/> : <LinkIcon color={isSharable ? "primary" : "disabled"} />}
    </IconButton>
  );
};

// --- Example Usage ---

/**
 * An example of how to use the MuiToggleIconButton.
 * It manages its own state.
 */
// export const MuiToggleIconButtonExample = () => {
//   const [isShared, setIsShared] = useState(false);

//   return (
//     <Box sx={{ display: 'flex', alignItems: 'center', direction: 'row', gap: 1 }}>
//       <MuiToggleIconButton
//         isSharable={isShared}
//         onToggleChange={setIsShared}
//       />
//       <p>{isShared ? 'ON' : 'OFF'}</p>
//     </Box>
//   );
// };
