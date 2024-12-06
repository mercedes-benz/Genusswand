import React from 'react';
import { Typography, Box } from '@mui/material';

const About: React.FC = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">About Us</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                Hier entsteht noch was :D
            </Typography>
        </Box>
    );
};

export default About;
