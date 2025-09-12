import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function CompliancePage() {
  return (
    <ComingSoonLayout item={{
      icon: ClipboardCheck,
      title: "Compliance",
      description: "Comprehensive regulatory compliance management system designed to ensure adherence to global financial regulations, AML/KYC requirements, and jurisdiction-specific cryptocurrency laws while maintaining operational efficiency and audit readiness.",
      color: "green",
      comingSoonTitle: "Compliance Dashboard Coming Soon",
      scope: "The system will support multi-jurisdictional compliance with automated reporting and audit trail generation to ensure your organization meets all regulatory obligations."
    }}/>
  );
}
