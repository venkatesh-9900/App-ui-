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
      gap: 1.5, // Equivalent to space-x-3 (12px)
      px: 1.5, // Equivalent to px-3 (12px)
      py: 1.25, // Equivalent to py-2.5 (10px)
    }};

const sidebarMenuSectionHeadingStyle = {
  mb: 1.5, // mb-3 (12px)
  px: 1.5, // px-3 (12px)
  fontSize: '0.75rem', // text-xs
  letterSpacing: '0.05em', // tracking-wider
};

const sideBarMenuBoxLayoutStyle = {
  overflowY: 'auto',
  height: 'calc(100% - 48px)',
  pb: 2
}

const sideBarMenuInnerBoxStyle = (isExpanded: boolean) => {
  return {
    transition: 'padding 0.3s ease-in-out',
    p: isExpanded ? 2 : 1
  };
}

const sideBarMenuListStyle = (isExpanded: boolean) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: isExpanded ? 0.5 : 1, // space-y-1 : space-y-2 (4px : 8px)
    p: 0, // Remove default List padding
  };
}

const sideBarMenuItemNameStyle = {
  '& .MuiTypography-root': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const logoutButtonStyle = {
    borderRadius: '8px',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    color: 'text.secondary',
    '&:hover': {
        bgcolor: 'action.hover', // hover:bg-slate-100
        color: 'text.primary'
    }
};

export {commonButtonStyles, logoutButtonStyle, sidebarMenuSectionHeadingStyle, sideBarMenuBoxLayoutStyle, sideBarMenuInnerBoxStyle, sideBarMenuListStyle, sideBarMenuItemNameStyle};