import { Box, Typography } from '@mui/material';
import { Card, CardContent } from "@/components/ui/card";
import { History, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComingSoonLayout from '@/components/templates/coming-soon';

export default function AlertHistoryPage() {
  return (
    <Box>
      <Box sx={{ mb: { xs: 3, md: 4 }, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
          <History className="w-8 h-8 text-purple-600" />
          <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
            Alert History
          </Typography>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Construction className="w-3 h-3 mr-1" />
            Under Construction
          </Badge>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.125rem' } }}>
          Historical record of all security alerts, threat notifications, and compliance warnings with detailed audit trails.
        </Typography>
      </Box>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <Construction className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">
                Alert History Dashboard Coming Soon
              </h3>
              <p className="text-yellow-700 text-sm">
                Complete historical view of all alerts with filtering, search, and export capabilities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Box>
  );
  return (
      <ComingSoonLayout item={{
        icon: History,
        title: "Alert History",
        description: "Historical record of all security alerts, threat notifications, and compliance warnings with detailed audit trails.",
        color: "purple",
        comingSoonTitle: "Alert History Dashboard Coming Soon",
        scope: "Complete historical view of all alerts with filtering, search, and export capabilities."
      }}/>
    );
}