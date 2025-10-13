import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function NotificationsPage() {
  return (
    <ComingSoonLayout item={{
      icon: Bell,
      title: "Notifications",
      description: "",
      color: "blue",
      comingSoonTitle: "Notifications Coming Soon",
      scope: "Manage notifications and other updates."
    }}/>
  );
}