import { Box, Typography } from "@mui/material";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ComingSoonLayout = ({ item }: { item: any; }) => {
    const Icon = item.icon;
    const colorMap = {
        "green": "text-green-600",
        "yellow": "text-yellow-600",
        "red": "text-red-600",
        "blue": "text-blue-600",
        "purple": "text-purple-600",
        "pink": "text-pink-600",
        "orange": "text-orange-600",
        "teal": "text-teal-600",
        "cyan": "text-cyan-600",
        "gray": "text-gray-600",
    }

    return (
        <Box>
            <Box sx={{ mb: { xs: 3, md: 4 }, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
                    <Icon className={cn("w-8 h-8", colorMap[item.color as keyof typeof colorMap] || "text-green-600")} />
                    <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
                        {item.title}
                    </Typography>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        <Construction className="w-3 h-3 mr-1" />
                        Under Construction
                    </Badge>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.125rem' } }}>
                {item.description}
                </Typography>
            </Box>

            <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                        <Construction className="w-8 h-8 text-yellow-600" />
                        <div>
                        <h3 className="font-semibold text-yellow-800 mb-1">
                            {item.comingSoonTitle}
                        </h3>
                        <p className="text-yellow-700 text-sm">
                            {item.scope}
                        </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Box>
    );
}

export default ComingSoonLayout;