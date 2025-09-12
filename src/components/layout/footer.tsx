import * as React from 'react';
import {Box, Typography, Link, Container, Divider} from '@mui/material';
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
      <Container sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 4,
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
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'var(--argus-blue)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield color="white" size={16} />
            </Box>
            <Box>
              <Typography variant="h6" component="div" fontWeight={600}>
                Argus Intelligence
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The power of Natural language
              </Typography>
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
            <Link href="#" color="text.secondary" underline="hover">
              Privacy Policy
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              Terms of Service
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              Support
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              Documentation
            </Link>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 4, md: 6 } }} />

        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Argus Intelligence. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
