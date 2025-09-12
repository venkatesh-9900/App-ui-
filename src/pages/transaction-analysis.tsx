import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightLeft, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function TransactionAnalysisPage() {
  return (
    <ComingSoonLayout item={{
      icon: ArrowRightLeft,
      title: "Transaction Analysis",
      description: "Advanced investigation tools for comprehensive transaction analysis.",
      color: "orange",
      comingSoonTitle: "Transaction Analysis Coming Soon",
      scope: "The system will provide users with advanced blockchain forensics and investigation tools for comprehensive transaction analysis."
    }}/>
  );
}