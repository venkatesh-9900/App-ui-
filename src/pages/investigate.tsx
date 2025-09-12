import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Search, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function InvestigatePage() {
  return (
    <ComingSoonLayout item={{
      icon: Search,
      title: "Investigate Fraud",
      description: "Investigating anomalous activities across multiple networks and bridges.",
      color: "red",
      comingSoonTitle: "Fraud Investigation Coming Soon",
      scope: "The system will provide tools for sequential investigation of fraud and anomalous activities across multiple networks and bridges."
    }}/>
  );
}