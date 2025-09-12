const commonButtonStyles = (isActive: boolean) => {
    return {
      borderRadius: '8px',
      transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
      '&:hover': {
        bgcolor: 'action.hover', // hover:bg-slate-100
      },
      ...(isActive && {
        bgcolor: 'action.hover', // bg-blue-50
        color: 'primary.main', // text-blue-700
        fontWeight: 'medium', // font-medium
        '& .MuiListItemIcon-root': {
          color: 'primary.main', // icon color for active state
        },
      }),
      ...(!isActive && {
        color: 'text.secondary', // text-slate-700
        '&:hover': {
          color: 'text.primary', // hover:text-slate-900
        },
      }),
    }};

const logoutButtonStyle = {
    borderRadius: '8px',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    color: 'text.secondary',
    '&:hover': {
        bgcolor: 'action.hover', // hover:bg-slate-100
        color: 'text.primary'
    }
};

export {commonButtonStyles, logoutButtonStyle};