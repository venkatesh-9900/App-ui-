import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function BillingPage() {
  return (
      <ComingSoonLayout item={{
        icon: CreditCard,
        title: "Billing",
        description: "Manage subscription plans, billing information, and payment methods for your security platform.",
        color: "green",
        comingSoonTitle: "Billing Management Coming Soon",
        scope: "Comprehensive billing dashboard with subscription management and payment processing."
      }}/>
    );
}