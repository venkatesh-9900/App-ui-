import { Link, useLocation } from "wouter";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Drawer,
} from '@mui/material';
import {AppUserProfile} from "@/types";
import config from "../../config/config.ts";
import navigation from "@/constants/navigation.tsx";
import { commonButtonStyles, sideBarMenuBoxLayoutStyle, sideBarMenuInnerBoxStyle, sideBarMenuItemNameStyle, sideBarMenuListStyle, sidebarMenuSectionHeadingStyle } from "@/common/menu-styles.tsx";
import ChatHistory from "@/components/layout/chat-history.tsx";

interface SidebarProps {
  isExpanded: boolean;
  onToggle: (value: boolean) => void;
  userProfile: AppUserProfile | null;
}

export default function Sidebar({
                                  isExpanded,
                                  onToggle
                                }: SidebarProps) {
  const [location] = useLocation();
  const SidebarItem = ({ item }: { item: any; }) => {
    const Icon = item.icon;
    const isActive = location === item.href;

    return (
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            component={Link}
              href={item.href}
            sx={commonButtonStyles(isActive)}
            onClick={() => onToggle(false)}
          >
            <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
              <Icon size={18} />
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              sx={sideBarMenuItemNameStyle}
            />
          </ListItemButton>
        </ListItem>
    );
  };

  return (
    <Drawer open={isExpanded} onClose={() => onToggle(false)}>
        <Box
            sx={{
                ...sideBarMenuBoxLayoutStyle,
                mt: 10
            }}
        >
            <Box
                sx={sideBarMenuInnerBoxStyle(true)}
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
                            sx={sidebarMenuSectionHeadingStyle}
                        >
                            {section.name}
                        </Typography>
                        <List
                        sx={sideBarMenuListStyle(true)}
                        >
                            {section.items.map((item) => {
                                return <SidebarItem key={item.name} item={item} />;
                            })}
                        </List>
                    </Box>
                ))}
                <Box
                        key={"all_chats_mob"}
                        sx={{ mb: 3 }}
                >
                  <Typography
                        variant="subtitle2" // text-xs
                        fontWeight="medium" // font-semibold
                        color="text.secondary" // text-slate-500
                        textTransform="uppercase"
                        sx={sidebarMenuSectionHeadingStyle}
                    >
                    All Chats
                  </Typography>
                  <ChatHistory onMenuItemClick={() => {onToggle(false)}}/>
                </Box>
            </Box>
        </Box>
    </Drawer>
  )
}