import { Bell, Building, LogOutIcon, Mail, Settings } from "lucide-react";
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
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import MenuIcon from '@mui/icons-material/Menu';
import {toast} from "sonner";
import config from "../../config/config.ts";
import {useEffect, useState} from "react";
import {AppUserProfile} from "@/types";
import {getUserProfile} from "@/hooks/user-service.ts";
import ProfileDetailsLayout from "@/components/templates/profile-details.tsx";
import { logoutUser } from "@/hooks/auth-service.ts";


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
    logoutUser({
      successTask: (idToken: String) => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("isAuthenticated");
        window.location.replace(`http://35.225.223.235:8080/realms/main/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=https%3A%2F%2Fjwt.io%2F`);
      },
      failureTask: () => {
        toast('Failure', {
          description: 'Logout failed unexpectedly. Please try again.',
        });
      },
      errorTask: () => {
        toast('Error', {
          description: 'Logout failed due to error',
        });
      },
    });
    // try {
      
    //   const accessToken = localStorage.getItem('access_token');
    //   if (accessToken) {
    //     const response = await fetch(logoutUrl, {
    //       method: 'GET',
    //       headers: {
    //         'Authorization': `Bearer ${accessToken}`,
    //       }
    //     });

    //     if (!response.ok) {
    //       throw new Error(`Logout failed with status: ${response.status}`);
    //     }
    //     const responseText = await response.text();
    //     const idToken = JSON.parse(responseText);
    //     console.log(idToken);
    //     if (idToken.id_token) {
    //       localStorage.removeItem("access_token");
    //       localStorage.removeItem("isAuthenticated");
    //       window.location.replace(`http://35.225.223.235:8080/realms/main/protocol/openid-connect/logout?id_token_hint=${idToken.id_token}&post_logout_redirect_uri=https%3A%2F%2Fjwt.io%2F`);
    //     } else {
    //       toast('Failure', {
    //         description: 'Login failed unexpectedly. Please try again.',
    //       });
    //     }
    //   }
    // } catch (err) {
    //   toast('Error', {
    //     description: 'Login failed due to error',
    //   });
    // }
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
          <Box sx={{ py: 3, display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden' }}>
            <Box sx={{ display: {xs: 'block', sm: 'none'}, px: 1}}>
              <Button
              variant="outlined"
              onClick={onMenuClick}
              sx={{
                padding: '4px',
                minWidth: 32
              }}>
                <Menuicon size={16}/>
              </Button>
            </Box>
            <Avatar
                src="/assets/argus-logo.png"
                alt="Argus Intelligence Logo"
                variant="rounded"
                sx={{ width: 40, height: 40, mr: 1.5 }}
            />
            <Box sx={{ display: 'block'}}>
              <Typography variant="h6" component="h1" fontWeight="bold" color="text.primary" noWrap>
                Argus Intelligence
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                the power of Natural language
              </Typography>
            </Box>
          </Box>

          {/* Right side: Actions and User Menu */}
          <Box sx={{ display: {xs: 'none', sm: 'flex'}, alignItems: 'center', gap: { xs: 0, sm: 1 } }}>
            <Tooltip title="Notifications">
              <IconButton color="default">
                <Bell size={20} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton color="default">
                <Settings size={20} />
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Account settings">
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
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--argus-green)', fontSize: '0.875rem' }}>
                  {fallbackInitials}
                </Avatar>
                <Typography sx={{ display: { xs: 'none', md: 'block' }, mx: 1 }}>
                  {displayName}
                </Typography>
                <KeyboardArrowDown sx={{ display: { xs: 'none', md: 'block' }, color: 'text.secondary' }} />
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
              <ProfileDetailsLayout item={{
                email: email,
                  organization: organization
                }}
              />
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
