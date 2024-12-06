import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Verwende React Router Link
import { Box, Container, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
            }}
        >
            <Container maxWidth="md">
                <Typography variant="body1">
                    © {new Date().getFullYear()} Simon Berndt. All rights reserved.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    <Link component={RouterLink} to="/impressum" underline="hover">
                        Impressum
                    </Link>
                    {' | '}
                    <Link component={RouterLink} to="/about" underline="hover">
                        About
                    </Link>
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
