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
                Oops! Diese Seite ist wohl verloren gegangen...
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Vielleicht hast du dich verlaufen? Oder wir haben etwas kaputt gemacht. 🤷‍♂️
            </Typography>
            <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/"
                sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '1rem' }}
            >
                Zurück zur Startseite
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
                    Es tut uns leid, die Seite wurde vom Internet verschluckt! 🕳️🌍
                </Typography>
            </Box>
        </Box>
    );
};

export default NotFoundPage;
