import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function WalletScreeningPage() {
  return (
    <ComingSoonLayout item={{
      icon: Wallet,
      title: "Wallet Screening",
      description: "Add wallets which should be monitored for suspicious activities",
      color: "blue",
      comingSoonTitle: "Setup Wallet Screening Coming Soon",
      scope: "The system will allow users to add wallets and enable automated screening and monitoring for suspicious activities."
    }}/>
  );
}