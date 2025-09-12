import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Cog, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function SettingsPage() {
  return (
      <ComingSoonLayout item={{
        icon: Cog,
        title: "Settings",
        description: "System configuration, preferences, and platform settings for optimal security monitoring experience.",
        color: "gray",
        comingSoonTitle: "Settings Panel Coming Soon",
        scope: "Comprehensive system configuration with customizable preferences and security settings."
      }}/>
    );
}