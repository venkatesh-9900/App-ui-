import * as React from 'react';
import {Box, Typography, Link, Container, Divider, Avatar} from '@mui/material';
import { Shield } from "lucide-react"; // Assuming you still want to use this icon

const SIDEBAR_WIDTH_EXPANDED = '256px';
const SIDEBAR_WIDTH_COLLAPSED = '64px';

interface FooterProps {
  sidebarPresent: boolean;
  sidebarExpanded: boolean;
}

export default function Footer({ sidebarPresent, sidebarExpanded }: FooterProps) {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        transition: (theme) => theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        ml: { xs: 0, md: sidebarPresent ? (sidebarExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED) : 0 },
      }}
    >
      <Container sx={{ py: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            py: 2
          }}
        >
          {/* Logo and Brand Name */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: { xs: 2, sm: 2 },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Avatar
                src="/assets/argus-logo.png"
                alt="Argus Intelligence Logo"
                variant="rounded"
                sx={{ width: { xs: 60, md: 40 }, height: { xs: 60, md: 40 }, mr: { xs: 0, md: 0.5 } }}
            />
            <Box>
              <Typography variant="h6" component="div" fontWeight={600} textTransform={'uppercase'} sx={{ color: '#666666' }}>
                Argus Intelligence
              </Typography>
              {/* <Typography variant="body2" color="text.secondary">
                The power of Natural language
              </Typography> */}
            </Box>
          </Box>

          {/* Footer Links */}
          <Box
            component="nav"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: { xs: 2, sm: 3 },
            }}
          >
            <Link href="#" color="text.secondary" underline="none">
              Privacy Policy
            </Link>
            <Link href="#" color="text.secondary" underline="none">
              Terms of Service
            </Link>
            <Link href="#" color="text.secondary" underline="none">
              Support
            </Link>
            <Link href="#" color="text.secondary" underline="none">
              Documentation
            </Link>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 2, md: 3 } }} />

        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Argus Intelligence. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
