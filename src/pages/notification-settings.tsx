import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function NotificationSettingsPage() {
  return (
    <ComingSoonLayout item={{
      icon: Settings,
      title: "Notification Settings",
      description: "Configure notification preferences, delivery methods, and alert channels for real-time security updates.",
      color: "blue",
      comingSoonTitle: "Notification Configuration Coming Soon",
      scope: "Comprehensive notification management system with email, SMS, webhook, and mobile push notifications."
    }}/>
  );
}