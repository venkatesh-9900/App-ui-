import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function AccountPage() {
  return (
      <ComingSoonLayout item={{
        icon: CreditCard,
        title: "Account",
        description: "",
        color: "green",
        comingSoonTitle: "Account Management Coming Soon",
        scope: "Manage subscription plans, billing information, and other account related settings for your platform."
      }}/>
    );
}