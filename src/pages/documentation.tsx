import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Book, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function DocumentationPage() {
  return (
    <ComingSoonLayout item={{
      icon: Book,
      title: "Documentation",
      description: "Comprehensive API documentation, integration guides, and developer resources for blockchain security platform.",
      color: "blue",
      comingSoonTitle: "Developer Documentation Coming Soon",
      scope: "Complete API reference, SDK documentation, and integration tutorials for developers."
    }}/>
  );
}