import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Key, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function AdministrationPage() {
  return (
      <ComingSoonLayout item={{
        icon: Key,
        title: "Administration",
        description: "",
        color: "orange",
        comingSoonTitle: "Administration Coming Soon",
        scope: "Manage admin privilege related settings for your platform."
      }}/>
    );
}