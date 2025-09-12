import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function LandingPage() {
  return (
    <ComingSoonLayout item={{
      icon: BarChart,
      title: "Analyze",
      description: "Analyze transactions, screen wallets, identify anomalies, across multiple public networks.",
      color: "green",
      comingSoonTitle: "Analysis Page Coming Soon",
      scope: "The system will provide tools for analysis of transactions, screen wallets, identify anomalies, across multiple public networks."
    }}/>
  );
}