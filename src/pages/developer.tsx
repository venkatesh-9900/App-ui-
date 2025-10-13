import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Code, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function DeveloperPage() {
  return (
      <ComingSoonLayout item={{
        icon: Code,
        title: "Developer",
        description: "",
        color: "purple",
        comingSoonTitle: "Developer Settings Coming Soon",
        scope: "Manage developer tools and other developer settings for your platform."
      }}/>
    );
}