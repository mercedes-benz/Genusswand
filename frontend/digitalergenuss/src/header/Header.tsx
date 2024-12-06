import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {
    getCredentialCookie,
    HTTP_JSON_HEADERS_WITH_AUTH,
    HTTP_METHOD_POST, logout,
    REQUEST_URL,
    IMAGE_UPDATE_URL, USER_PROFILE_IMAGE_SMALL, HTTP_METHOD_GET, HTTP_AUTH_HEADERS, USER_UPDATE,
} from "../global/constants/constants";
import {useCallback, useEffect, useState} from "react";
import {getUserInfo} from "../user/me/me";
import ImageUpdate from "./ImageUpdater/ImageUpdater";
import {Link as RouterLink} from "react-router-dom";
import {Link} from "@mui/material";


export default function Header() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [firstname, setFirstname] = useState<string>("");
    const [lastname, setLastname] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [birthday, setBirthday] = useState<string>("01.01.1970");
    const [avatarUrl, setAvatarUrl] = useState<string>('../global/image/blank-profile-picture.png');
    const [profilbildID, setProfilbildID] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const open = Boolean(anchorEl);
    const title = 'Digitale Genusswand';

    const getProfileImage = useCallback(async () => {
        try {
            const response = await fetch(REQUEST_URL + USER_PROFILE_IMAGE_SMALL, {
                method: HTTP_METHOD_GET,
                headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie())
            });

            if (response.ok) {
                const data = await response.blob();
                const imageUrl = URL.createObjectURL(data);
                return imageUrl;
            }
        } catch (error) {
            console.error("Error fetching list image:", error);
        }

        return '../global/image/blank-profile-picture.png';
    }, []);

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        setProfileDialogOpen(true);
        handleClose();
    };

    const handleProfileClose = () => {
        setProfileDialogOpen(false);
        getProfileImage()
            .then((imageUrl) => {
                setAvatarUrl(imageUrl);
            })
    };

    const handleLogout = () => {
        logout();
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedImage(file); // Image Vorschau anzeigen, wenn gewünscht
    };

    const handleUpdateProfile = async () => {

        if (userName.trim() === "" || firstname.trim() === "" || lastname.trim() === "" || birthday.trim() === "") {
            console.error("Please fill out all fields");
            return;
        }

        const data = {
            username: userName,
            vorname: firstname,
            nachname: lastname,
            geburtstag: birthday
        };

        try {
            fetch(REQUEST_URL + USER_UPDATE, {
                method: HTTP_METHOD_POST,
                headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie()),
                body: JSON.stringify(data)
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Update failed");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                })
                .catch((error) => {
                    console.error("Error updating user:", error);
                });
            handleProfileClose();
        } catch (error) {
            console.error("Error updating image:", error);
        }
    };


    useEffect(() => {
        getUserInfo()
            .then((data) => {
                setFirstname(data.vorname);
                setLastname(data.nachname);
                setUserId(data.uuid);
                setBirthday(data.geburtstag);
                setProfilbildID(data.profilbild_id);
                setUserName(data.username);
            })
            .catch((error) => {
                console.error("Error getting user info:", error);
            });

        getProfileImage()
            .then((imageUrl) => {
                setAvatarUrl(imageUrl);
            })

    }, []);

    return (
        <>
            <AppBar position="sticky" sx={{backgroundColor: 'primary.main'}}>
                <Toolbar sx={{justifyContent: 'space-between'}}>


                    <Typography variant="h6" component="div" sx={{}}>
                        <Link component={RouterLink} to="/" underline="none" sx={{ color: "white" }}>
                            {title}
                        </Link>
                    </Typography>

                    <IconButton onClick={handleAvatarClick} sx={{}}>
                        <Avatar src={avatarUrl} alt={userName}/>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Dialog open={profileDialogOpen} onClose={handleProfileClose}>
                <DialogTitle>Profile Information</DialogTitle>
                <DialogContent>
                    <ImageUpdate image_url={avatarUrl} image_id={profilbildID}/>
                    <div>

                        <TextField
                            margin="dense"
                            label="Vorname"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            sx={{marginTop: '2rem'}}
                        />
                        <TextField
                            margin="dense"
                            label="Nachname"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Username"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />

                        <TextField
                            margin="dense"
                            autoComplete="birthdate"
                            name="birthdate"
                            label="Birthday"
                            fullWidth
                            id="birthdate"
                            type="date"
                            variant={"outlined"}
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                        />

                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleProfileClose}>Cancel</Button>
                    <Button onClick={handleUpdateProfile}>
                        Update Profile
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
