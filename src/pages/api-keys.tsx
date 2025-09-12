import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Stack, alpha,
} from "@mui/material";
import { Copy, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKey {
  id: number;
  name: string;
  key: string;
  isActive: boolean;
  createdAt: string;
  lastUsed: string | null;
}
// Hardcoded mock data array
export const apiKeys: ApiKey[] = [
  {
    id: 1,
    name: "Production Key",
    key: "ak_prod_xxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: "2023-12-14T10:00:00.000Z",
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isActive: true,
  },
  {
    id: 2,
    name: "Development Key",
    key: "ak_dev_xxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: "2023-12-09T15:30:00.000Z",
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isActive: true,
  },
  {
    id: 3,
    name: "Staging Key (Inactive)",
    key: "ak_stage_xxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: "2023-11-20T11:00:00.000Z",
    lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    isActive: false,
  },
];

// --- Helper Functions for Display ---

// A simple date formatter
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// A simple "time ago" formatter
const formatLastUsed = (dateString: string) => {
  const now = new Date();
  const lastUsedDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - lastUsedDate.getTime()) / 1000);

  const hours = Math.floor(diffInSeconds / 3600);
  if (hours > 48) return `${Math.floor(hours / 24)} days ago`;
  if (hours >= 1) return `${hours} hours ago`;

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes > 1) return `${minutes} minutes ago`;

  return "just now";
};

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [newKeyName, setNewKeyName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard"
    });
  };

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: { xs: 4, md: 5 }, mt: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            {/* <KeyRound size={32} color="var(--mui-palette-primary-main)" /> */}
            <Typography variant="h4" component="h1" fontWeight="bold">
              API Key Management
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Manage your API keys for programmatic access to Argus Intelligence.
          </Typography>
        </Box>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: { xs: 4, md: 5 }, mt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          {/* <KeyRound size={32} color="var(--mui-palette-primary-main)" /> */}
          <Typography variant="h4" component="h1" fontWeight="bold">
            API Key Management
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Manage your API keys for programmatic access to Argus Intelligence.
        </Typography>
      </Box>

      <Card>
        <CardHeader
          title="Your API Keys"
          titleTypographyProps={{ fontWeight: 'bold' }}
          action={
            <Button className="bg-[var(--argus-blue)] hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
              <Plus size={16} className="mr-2" />
              Generate New Key
            </Button>
          }
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            '& .MuiCardHeader-action': {
              mt: { xs: 2, sm: 0 },
              ml: { xs: 0, sm: 2 },
            }
          }}
        />
        <CardContent>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {apiKeys?.map((apiKey) => (
              <ListItem
                key={apiKey.id}
                sx={{
                  p: 2,
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: 2,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight="medium" color="text.primary">
                      {apiKey.name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.secondary" fontFamily="monospace">
                        {apiKey.key}
                      </Typography>
                      <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        Created: {formatDate(apiKey.createdAt)} • Last used: {formatLastUsed(apiKey.lastUsed!)}
                      </Typography>
                    </>
                  }
                  sx={{ m: 0, flex: 1, width: '100%' }}
                />
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: 'flex-end' }}
                >
                  <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                    {apiKey.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {/* <Chip
                    label={apiKey.isActive ? "Active" : "Inactive"}
                    color={"white"}
                    size="small"
                  /> */}
                  <Tooltip title="Copy Key">
                    <IconButton size="small" onClick={() => handleCopyKey(apiKey.key)}>
                      <Copy size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Key">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => {}}
                        disabled={true}
                        sx={{ color: 'error.main' }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </ListItem>
            ))}
          </List>

          <Box component={"div"} className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">API Usage Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keep your API keys secure and never expose them in client-side code</li>
              <li>• Production keys have higher rate limits than development keys</li>
              <li>• Monitor your usage in the Analytics dashboard</li>
            </ul>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Create New API Key</DialogTitle>
        <DialogContent>
          <Box component={"div"} className="space-y-4">
            <Box>
              <Label htmlFor="keyName">Key Name</Label>
              <Box className="mt-1"></Box>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter a name for your API key"
              />
            </Box>
            <Box component={"div"} className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                  onClick={() => {}}
                disabled={!newKeyName.trim() }
                className="bg-[var(--argus-blue)] hover:bg-blue-700"
              >
                {"Create Key"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
