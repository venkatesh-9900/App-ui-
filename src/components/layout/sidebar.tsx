import { Link, useLocation } from "wouter";
// import { cn } from "@/lib/utils"; // No longer needed if all styling is MUI
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"; // No longer needed if using MUI Tooltip

// Material-UI imports
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip as MuiTooltip, // Alias to avoid conflict with shadcn Tooltip
  Divider,
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
  ChevronRight
} from "lucide-react"; // Keep lucide icons for consistency with original code
import {ChatSidebarContent} from "@/components/chat/chat-sidebar-content.tsx";
import navigation from "@/constants/navigation";
import { commonButtonStyles } from "@/common/menu-styles";

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  collapseSidebar?: () => void;
}

export default function Sidebar({
                                  isExpanded,
                                  onToggle,
                                }: SidebarProps) {

  const [location] = useLocation();

  const SidebarItem = ({ item }: { item: any; }) => {
    const Icon = item.icon;
    const isActive = location === item.href;

    if (isExpanded) {
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
    }

    // Collapsed state
    return (
      <MuiTooltip title={item.name} placement="right" arrow>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={Link}
                href={item.href}
            sx={{
              ...commonButtonStyles(isActive),
              justifyContent: 'center',
              width: 40, // Equivalent to w-10 (40px)
              height: 40 // Equivalent to h-10 (40px)
              // ...(isActive && {
              //   boxShadow: 1, // Equivalent to shadow-sm
              // }),
            }}
            >
            <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
              <Icon size={18} />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      </MuiTooltip>
    );
  };

  return (
    <Box
      component="nav"
      sx={{
        bgcolor: 'background.paper', // bg-white
        borderRight: 1, // border-r
        borderColor: 'divider', // border-slate-200
        position: 'fixed', // fixed
        left: 0,
        top: 100, // top-20 (assuming 80px based on common AppBar height)
        bottom: 0,
        overflowX: 'hidden', // overflow-hidden (to hide horizontal scroll during width transition)
        transition: 'width 0.3s ease-in-out', // transition-all duration-300 ease-in-out
        zIndex: (theme) => theme.zIndex.drawer, // z-40
        width: isExpanded ? 256 : 64, // w-64 : w-16 (256px for w-64, 64px for w-16)
        // Mobile-first responsiveness: Hide by default on small screens, show on medium and up
        display: { xs: 'none', md: 'block' },
      }}
      >
        {/* Toggle Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: isExpanded ? 'flex-end' : 'center',
          alignItems: 'center',
          p: 1, // p-2 (8px padding)
          borderBottom: 1,
          borderColor: 'divider', // border-slate-100
        }}
      >
        <IconButton
              onClick={onToggle}
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            sx={{
              p: 0.75, // p-1.5 (6px padding)
              borderRadius: '4px', // rounded-md
              '&:hover': {
                bgcolor: 'action.hover', // hover:bg-slate-100
              },
              transition: 'background-color 0.2s ease-in-out', // transition-colors duration-200
              color: 'text.secondary', // text-slate-600
            }}
          >
          {isExpanded ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </IconButton>
      </Box>

        {/* Scrollable Content */}
      <Box
        sx={{
          overflowY: 'auto',
          height: 'calc(100% - 48px)', // Total height minus toggle button box height (32px icon + 2*8px padding = 48px)
          pb: 4, // pb-4 (32px padding-bottom)
        }}
      >
        <Box
          sx={{
            transition: 'padding 0.3s ease-in-out', // transition-all duration-300
            p: isExpanded ? 2 : 1, // p-4 : p-2 (16px : 8px)
          }}
        >
            {navigation.map((section) => (
            <Box
              key={section.name}
              sx={{
                mb: isExpanded ? 3 : 2, // mb-6 : mb-4 (24px : 16px)
              }}
            >
              {isExpanded && (
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
              )}
              <List
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isExpanded ? 0.5 : 1, // space-y-1 : space-y-2 (4px : 8px)
                  p: 0, // Remove default List padding
                }}
              >
                    {section.items.map((item) => {
                      if (item.href === "/chat") {
                        return (
                          <ListItem key="chat-sidebar-content" disablePadding>
                            <ChatSidebarContent
                              isActive={location.startsWith('/chat')}
                              isMenuExpanded={isExpanded}
                              closeSidebar={ () => {} }
                            />
                          </ListItem>
                        );
                      }
                      return <SidebarItem key={item.name} item={item} />;
                    })}
              </List>
              {!isExpanded && navigation.indexOf(section) < navigation.length - 1 && (
                <Divider sx={{ my: 2, mx: 1 }} /> // border-b border-slate-200 my-4 mx-2 (16px margin, 8px horizontal margin)
              )}
            </Box>
            ))}
        </Box>
      </Box>
    </Box>
  );
}
