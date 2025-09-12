import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Network, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function NetworkAnalyticsPage() {
  return (
    <ComingSoonLayout item={{
      icon: Network,
      title: "Network Analytics",
      description: "Enable/Configure Analytics and Comprehensive Monitoring for any Blockchain or L2 network.",
      color: "green",
      comingSoonTitle: "Network Analytics Coming Soon",
      scope: "The system can be used to setup, enable and configure comprehensive analytics and monitoring systems for any blockchain or L2 network."
    }}/>
  );
}