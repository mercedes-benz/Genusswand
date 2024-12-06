import * as React from 'react';
import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import {PaletteMode, styled,} from '@mui/material/styles';
import {register} from "./register";
import ImageUpload from "./image-upload/ImageUpload";
import Footer from "../../footer/Footer";
import {Alert} from "@mui/material";

interface RegisterForm {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    birthdate: string;
    profilbild_id: string;
}

const Card = styled(MuiCard)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const SignUpContainer = styled(Stack)(({theme}) => ({
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    backgroundImage:
        'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
        backgroundImage:
            'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
}));

export default function SignUp() {
    const [mode, setMode] = React.useState<PaletteMode>('light');
    const [nameError, setNameError] = React.useState(false);
    const [nameErrorMessage, setNameErrorMessage] = React.useState('');
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [failed, setFailed] = React.useState(false);
    const [tried, setTried] = React.useState(false);

    // This code only runs on the client side, to determine the system color preference
    React.useEffect(() => {
        // Check if there is a preferred mode in localStorage
        const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
        if (savedMode) {
            setMode(savedMode);
        } else {
            // If no preference is found, it uses system preference
            const systemPrefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches;
            setMode(systemPrefersDark ? 'dark' : 'light');
        }
    }, []);

    const validateInputs = () => {
        const email = document.getElementById('email') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;
        const firstname = document.getElementById('first-name') as HTMLInputElement;
        const lastname = document.getElementById('last-name') as HTMLInputElement;

        let isValid = true;

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (!firstname.value || firstname.value.length < 1) {
            setNameError(true);
            setNameErrorMessage('Name is required.');
            isValid = false;
        } else {
            setNameError(false);
            setNameErrorMessage('');
        }

        if (!lastname.value || lastname.value.length < 1) {
            setNameError(true);
            setNameErrorMessage('Name is required.');
            isValid = false;
        } else {
            setNameError(false);
            setNameErrorMessage('');
        }

        return isValid;
    };

    const [formData, setFormData] = useState<RegisterForm>({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        birthdate: '',
        profilbild_id: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const [profile_image_id, set_profile_image_id] = useState<string>('');

    const handleImageUpload = (imageId: string) => {
        console.log(imageId)
        set_profile_image_id(imageId)
        setFormData({
            ...formData,
            profilbild_id: imageId
        });
    };


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (nameError || emailError || passwordError) {
            event.preventDefault();
            return;
        }
        const data = new FormData(event.currentTarget);
        try {
            register(
                data.get('first-name') as string,
                data.get('last-name') as string,
                data.get('birthdate') as string,
                data.get('username') as string,
                data.get('email') as string,
                data.get('password') as string,
                profile_image_id as string
            )
                .then(
                    (response) => {
                        console.log(response)
                        if(response === 403 || response === 404) {
                            setFailed(true)
                        }
                    }
                )
            ;
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <div>
            <CssBaseline enableColorScheme/>
            <SignUpContainer direction="column" justifyContent="space-between">
                <Card variant="outlined">
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)'}}
                    >
                        Sign up
                    </Typography>

                    <Box>
                        <Alert severity="error" sx={{display: failed ? 'block' : 'none'}}>
                            Registration failed. Please try again.
                        </Alert>
                    </Box>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{display: 'flex', flexDirection: 'column', gap: 2}}
                    >
                        <FormControl>
                            <FormLabel>Profilbild</FormLabel>
                            <ImageUpload onImageUpload={handleImageUpload}/>

                        </FormControl>

                        <FormControl>

                            <FormLabel htmlFor="name">Vorname</FormLabel>
                            <TextField
                                autoComplete="first-name"
                                name="first-name"
                                required
                                fullWidth
                                id="first-name"
                                placeholder="Michael"
                                error={nameError}
                                helperText={nameErrorMessage}
                                color={nameError ? 'error' : 'primary'}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel htmlFor="name">Nachname</FormLabel>
                            <TextField
                                autoComplete="last-name"
                                name="last-name"
                                required
                                fullWidth
                                id="last-name"
                                placeholder="Mustermann"
                                error={nameError}
                                helperText={nameErrorMessage}
                                color={nameError ? 'error' : 'primary'}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel htmlFor="name">Username</FormLabel>
                            <TextField
                                autoComplete="username"
                                name="username"
                                required
                                fullWidth
                                id="username"
                                placeholder="michiMuster"
                                error={nameError}
                                helperText={nameErrorMessage}
                                color={nameError ? 'error' : 'primary'}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel htmlFor="birthdate">Geburtstag</FormLabel>
                            <TextField
                                autoComplete="birthdate"
                                name="birthdate"
                                required
                                fullWidth
                                id="birthdate"
                                type="date"
                                color={nameError ? 'error' : 'primary'}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                placeholder="your@email.com"
                                name="email"
                                autoComplete="email"
                                variant="outlined"
                                error={emailError}
                                helperText={emailErrorMessage}
                                color={passwordError ? 'error' : 'primary'}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                placeholder="••••••"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                variant="outlined"
                                error={passwordError}
                                helperText={passwordErrorMessage}
                                color={passwordError ? 'error' : 'primary'}
                            />
                        </FormControl>
                        <FormControlLabel
                            control={<Checkbox value="allowExtraEmails" color="primary"/>}
                            label="I want to receive updates via email."
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            onClick={validateInputs}
                        >
                            Sign up
                        </Button>
                        <Typography sx={{textAlign: 'center'}}>
                            Already have an account?{' '}
                            <span>
                  <Link
                      href="/"
                      variant="body2"
                      sx={{alignSelf: 'center'}}
                  >
                    Sign in
                  </Link>
                </span>
                        </Typography>
                    </Box>
                </Card>
            </SignUpContainer>
            <Footer />
        </div>
    );
}
