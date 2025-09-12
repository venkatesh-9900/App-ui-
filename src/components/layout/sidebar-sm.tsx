import { Link, useLocation } from "wouter";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip as MuiTooltip,
  Divider,
  Drawer,
  Avatar,
  Button
} from '@mui/material';
import {
  Home,
  BarChart,
  ArrowRightLeft,
  Wallet,
  Network,
  AlertTriangle,
  ShieldCheck,
  ClipboardCheck,
  Bell,
  Settings,
  History,
  Bot,
  Sliders,
  Gauge,
  Users,
  Cog,
  Key,
  Code,
  Book,
  Plug,
  User,
  CreditCard,
  Building,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOutIcon,
  Mail,
} from "lucide-react";
import {ChatSidebarContent} from "@/components/chat/chat-sidebar-content.tsx";
import {useEffect, useState} from "react";
import {AppUserProfile} from "@/types";
import {getUserProfile} from "@/hooks/user-service.ts";
import config from "../../config/config.ts";
import {toast} from "sonner";
import navigation from "@/constants/navigation.tsx";
import { commonButtonStyles, logoutButtonStyle } from "@/common/menu-styles.tsx";
import ProfileDetailsLayout from "@/components/templates/profile-details.tsx";

interface SidebarProps {
  isExpanded: boolean;
  onToggle: (value: boolean) => void;
}

const logoutUrl = config.ENDPOINTS.AUTH.LOGOUT;

export default function Sidebar({
                                  isExpanded,
                                  onToggle,
                                }: SidebarProps) {

  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };
    loadProfile();
  }, []);

  const displayName = profile?.displayName || "User";
  const fallbackInitials = profile?.displayName?.slice(0, 2).toUpperCase() || "??";
  const email = profile?.email || "user@example.com";
  const organization = profile?.organization || "Default Organization";

  const handleLogout = async () => {
    try {
      onToggle(false);
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        await fetch(logoutUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
          credentials: 'include',
        });
      }
    } catch (err) {
      console.warn('Logout error:', err);
    }
    // Cleanup local storage
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    toast('Logged out', {
      description: 'You have been successfully logged out.',
    });
    window.location.href = "/";
  };

  const [location] = useLocation();
  const SidebarItem = ({ item }: { item: any; }) => {
    const Icon = item.icon;
    const isActive = location === item.href;

    return (
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={Link}
              href={item.href}
            sx={{
              ...commonButtonStyles(isActive),
              gap: 1.5, // Equivalent to space-x-3 (12px)
              px: 1.5, // Equivalent to px-3 (12px)
              py: 1.25, // Equivalent to py-2.5 (10px)
            }}
            onClick={() => onToggle(false)}
          >
            <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
              <Icon size={18} />
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              sx={{
                '& .MuiTypography-root': {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
    );
  };

  return (
    <Drawer open={isExpanded} onClose={() => onToggle(false)}>
        <Box
            sx={{
                overflowY: 'auto',
                height: 'calc(100% - 48px)', 
                pb: 4,
                mt: 15
            }}
        >
            <Box component={"div"} sx={{"display": "flex", "alignItems": "center", ml: 3, py: 2 }}>
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
            <Box component={"div"} sx={{"display": "inline-block", ml: 2}}>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={Button}
                  onClick={() => handleLogout()}
                  sx={{
                    ...logoutButtonStyle,
                    gap: 1.5, // Equivalent to space-x-3 (12px)
                    px: 1.5, // Equivalent to px-3 (12px)
                    py: 1.25, // Equivalent to py-2.5 (10px)
                    textTransform: 'none'
                  }}
                >
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
                </ListItemButton>
              </ListItem>
            </Box>
            <Box
                sx={{
                    transition: 'padding 0.3s ease-in-out',
                    p: 2,
                }}
            >
                {navigation.map((section) => (
                    <Box
                        key={section.name}
                        sx={{ mb: 3 }}
                    >
                        <Typography
                            variant="subtitle2" // text-xs
                            fontWeight="medium" // font-semibold
                            color="text.secondary" // text-slate-500
                            textTransform="uppercase"
                            sx={{
                                mb: 1.5, // mb-3 (12px)
                                px: 1.5, // px-3 (12px)
                                fontSize: '0.75rem', // text-xs
                                letterSpacing: '0.05em', // tracking-wider
                            }}
                        >
                            {section.name}
                        </Typography>
                        <List
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            p: 0,
                        }}
                        >
                            {section.items.map((item) => {
                                if (item.href === "/chat") {
                                    return (
                                        <ListItem key="chat-sidebar-content" disablePadding>
                                        <ChatSidebarContent
                                            isActive={location.startsWith('/chat')}
                                            isMenuExpanded={true}
                                            closeSidebar={() => onToggle(false)}
                                        />
                                        </ListItem>
                                    );
                                }
                                return <SidebarItem key={item.name} item={item} />;
                            })}
                        </List>
                    </Box>
                ))}
            </Box>
        </Box>
    </Drawer>
  )
}