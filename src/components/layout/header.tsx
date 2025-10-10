import { Bell, Building, Code, CreditCard, Key, LogOutIcon, Mail, MoreVertical, Settings } from "lucide-react";
import { Menu as Menuicon } from "lucide-react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import {toast} from "sonner";
import config from "../../config/config.ts";
import {useEffect, useState} from "react";
import {AppUserProfile} from "@/types";
import ProfileDetailsLayout from "@/components/templates/profile-details.tsx";
import { fetchLogoutURL, logoutUser } from "@/hooks/auth-service.ts";
import { navigate } from "wouter/use-browser-location";


const logoutUrl = config.ENDPOINTS.AUTH.LOGOUT;

interface HeaderProps {
  onMenuClick?: () => void;
  userProfile: AppUserProfile | null;
}
export default function Header({ onMenuClick, userProfile }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const displayName = userProfile?.displayName || "User";
  const fallbackInitials = userProfile?.displayName?.slice(0, 2).toUpperCase() || "??";
  const email = userProfile?.email || "user@example.com";
  const organization = userProfile?.organization || "Default Organization";

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    toast('Logging out', {
      description: 'Please wait while we log you out',
    });
    const logoutURL = await fetchLogoutURL({
      errorTask: () => {
        toast('Error', {
          description: 'An unexpected error occurred while logging out',
        });
      }
    });
    if (logoutURL) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("isAuthenticated");
          window.location.replace(logoutURL);
    }
  };

  return (
      <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
      >
        <Toolbar>
          {/* Left side: Logo and Title */}
          <Box sx={{ py: 2, display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden' }}>
            <Box sx={{ display: {xs: 'block', md: 'none'}}}>
              <Button
              variant="outlined"
              onClick={onMenuClick}
              sx={{
                padding: '4px',
                minWidth: 32,
                mr: 2,
                border: "none",
                color: 'grey'
              }}>
                <Menuicon size={23}/>
              </Button>
            </Box>
            <Avatar
                src="/assets/argus-logo.png"
                alt="Argus Intelligence Logo"
                variant="rounded"
                sx={{ width: 40, height: 40, mr: 1.5 }}
            />
            <Box sx={{ display: 'block'}}>
              <Typography variant="h6" component="h1" fontWeight="bold" textTransform="uppercase" sx={{ color: '#666666' }} noWrap>
                Argus Intelligence
              </Typography>
            </Box>
          </Box>

          {/* Right side: Actions and User Menu */}
          <Box sx={{ alignItems: 'center', gap: { xs: 0, sm: 1 } }}>
            {/* <Tooltip title="Notifications">
              <IconButton color="default">
                <Bell size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton color="default">
                <Settings size={20} />
              </IconButton>
            </Tooltip> */}

            {/* User Menu */}
            <Tooltip title="Explore">
              <Button
                  onClick={handleMenuOpen}
                  sx={{
                    p: { xs: 0.5, sm: 1 },
                    minWidth: 'auto',
                    textTransform: 'none',
                    color: 'text.primary',
                    borderRadius: '8px',
                  }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
              >
                <Avatar sx={{ display: {xs: 'none', md: 'flex'}, width: 32, height: 32, bgcolor: 'var(--argus-green)', fontSize: '0.875rem' }}>
                  {fallbackInitials}
                </Avatar>
                <Typography sx={{ display: {xs: 'none', md: 'flex'}, mx: 1 }}>
                  {displayName}
                </Typography>
                <KeyboardArrowDown sx={{ display: {xs: 'none', md: 'flex'}, color: 'text.secondary' }} />
                <Box sx={{ display: {xs: 'flex', md: 'none'}}}>
                  <MoreVertical className="h-5 w-5" style={{ color: '#666666' }}/>
                </Box>
              </Button>
            </Tooltip>
            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 1 }}
            >
              <Box component={"div"} sx={{"display": {xs: 'flex', md: 'none'}, "alignItems": "center", ml: 3, py: 2 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--argus-green)', fontSize: '0.875rem' }}>
                  {fallbackInitials}
                </Avatar>
                <Typography sx={{ display: 'block', mx: 1 }}>
                  {displayName}
                </Typography>
              </Box>
              <ProfileDetailsLayout item={{
                  email: email,
                  organization: organization
                }}
              />
              <Divider/>
              <MenuItem onClick={() => {
                handleMenuClose();
                navigate('/account');
              }}>
                <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
                  <CreditCard size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={"Account"}
                  sx={{
                    '& .MuiTypography-root': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              </MenuItem>
              <MenuItem onClick={() => {
                handleMenuClose();
                navigate('/developer');
              }}>
                <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
                  <Code size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={"Developer"}
                  sx={{
                    '& .MuiTypography-root': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              </MenuItem>
              <MenuItem onClick={() => {
                handleMenuClose();
                navigate('/administration');
              }}>
                <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
                  <Key size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={"Administration"}
                  sx={{
                    '& .MuiTypography-root': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              </MenuItem>
              <MenuItem onClick={() => {
                handleMenuClose();
                navigate('/notifications');
              }}>
                <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
                  <Bell size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={"Notifications"}
                  sx={{
                    '& .MuiTypography-root': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              </MenuItem>
              <Divider/>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
                  <LogOutIcon size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={"Logout"}
                  sx={{
                    '& .MuiTypography-root': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
  );
}
