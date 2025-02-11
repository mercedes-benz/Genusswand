import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const NotFoundPage = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                textAlign: 'center',
                bgcolor: 'background.default',
                color: 'text.primary',
                p: 2,
            }}
        >
            <SentimentVeryDissatisfiedIcon sx={{ fontSize: 120, color: 'error.main' }} />
            <Typography variant="h1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                404
            </Typography>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Oops! This page seems to be lost...
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Maybe you got lost? Or we broke something 🤷‍♂️
            </Typography>
            <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/"
                sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '1rem' }}
            >
                Back to the homepage
            </Button>
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 10,
                    textAlign: 'center',
                    width: '100%',
                    color: 'text.secondary',
                }}
            >
                <Typography variant="caption">
                    We're sorry, the page has been swallowed by the internet! 🕳️🌍
                </Typography>
            </Box>
        </Box>
    );
};

export default NotFoundPage;
