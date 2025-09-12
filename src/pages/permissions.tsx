import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { Key, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function PermissionsPage() {
  return (
      <ComingSoonLayout item={{
        icon: Key,
        title: "Permissions",
        description: "Role-based access control and permission management for secure platform operations and data access.",
        color: "orange",
        comingSoonTitle: "Permissions Management Coming Soon",
        scope: "Granular access control system with role-based permissions and security policies."
      }}/>
    );
}