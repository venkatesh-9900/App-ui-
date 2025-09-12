import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function UserManagementPage() {
  return (
    <ComingSoonLayout item={{
      icon: Users,
      title: "User Management",
      description: "Manage user accounts, roles, permissions, and access controls for your organization's security platform.",
      color: "blue",
      comingSoonTitle: "User Management System Coming Soon",
      scope: "Complete user administration with role-based access control and team management features."
    }}/>
  );
}