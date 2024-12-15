import React, {useEffect, useState, useCallback} from 'react';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    TextField,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import UploadIcon from '@mui/icons-material/Upload';
import InfoIcon from '@mui/icons-material/Info';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {useParams, useNavigate} from 'react-router-dom';
import {
    getCredentialCookie,
    HTTP_JSON_HEADERS_WITH_AUTH,
    HTTP_METHOD_GET,
    REQUEST_URL,
    STRICH_GET_STRICHE_FROM_LIST,
    STRICH_CREATE_URL,
    IMAGE_UPLOAD_URL_STRICH_REASON,
    USER_GET_USER,
    USER_PROFILE_IMAGE_SMALL,
    LIST_ADD_USER_URL, STRICH_SET_DONE, LIST_GET_SPECIFIC_LIST_NAME, HTTP_AUTH_HEADERS, STRICH_GET_IMAGE_MEDIUM
} from '../global/constants/constants';
import {styled} from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import Typography from "@mui/material/Typography";
import Image from "@mui/icons-material";

const Card = styled(MuiCard)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '500px',
    },
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const DesignContainer = styled(Stack)(({theme}) => ({
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

interface Strich {
    uuid: string;
    owner_id: string;
    reporter_id: string;
    creation_date: string;
    reason: string;
    reason_image_id: string | null;
    done: boolean;
}

interface PersonWithStriche {
    person_id: string;
    striche: Strich[];
    name: string;
    imageUrl: string | null;
}

interface User {
    uuid: string;
    name: string;
}


export default function SpecificListPage() {
    const {listId} = useParams<{ listId: string }>();
    const [peopleWithStriche, setPeopleWithStriche] = useState<PersonWithStriche[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [strichDialogOpen, setStrichDialogOpen] = useState<boolean>(false);
    const [doneDialogOpen, setDoneDialogOpen] = useState<boolean>(false);
    const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
    const [selectedPersonInformation, setSelectedInformationPerson] = useState<string | null>(null);
    const [informationDialogOpen, setInformationDialogOpen] = useState<boolean>(false);
    const [selectedStrich, setSelectedStrich] = useState<Strich | null>(null);
    const [reason, setReason] = useState<string>('');
    const [reasonImage, setReasonImage] = useState<string | null>(null);
    const [reasonImageID, setReasonImageID] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [addUserDialogOpen, setAddUserDialogOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const [title, setTitle] = useState<string>('');
    const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});
    const [reasonImageSrc, setReasonImageSrc] = useState<string | null>(null);

    const getProfileImage = useCallback(async (userId: string) => {
        if (imageCache[userId]) {
            return imageCache[userId];
        }

        try {
            const response = await fetch(REQUEST_URL + USER_PROFILE_IMAGE_SMALL + `/${userId}`, {
                method: HTTP_METHOD_GET,
                headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie())
            });

            if (response.ok) {
                const data = await response.blob();
                const imageUrl = URL.createObjectURL(data);

                setImageCache(prevCache => ({...prevCache, [userId]: imageUrl}));

                return imageUrl;
            }
        } catch (error) {
            console.error("Error fetching profile image:", error);
        }

        return null;
    }, [imageCache]);

    const getDoneStricheCount = (personId: string) => {
        let temp = 0;

        peopleWithStriche.find(person => person.person_id === personId)?.striche.map(strich => {
            if (strich.done) {
                temp++;
            }
        });
        return temp;
    }

    const getReasonImage = useCallback(async (strich_id: string) => {
        if (imageCache[strich_id]) {
            return imageCache[strich_id];
        }

        try {
            const response = await fetch(REQUEST_URL + STRICH_GET_IMAGE_MEDIUM + `/${strich_id}`, {
                method: HTTP_METHOD_GET,
                headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie())
            });

            if (response.ok) {
                const data = await response.blob();
                const imageUrl = URL.createObjectURL(data);

                setImageCache(prevCache => ({...prevCache, [strich_id]: imageUrl}));

                return imageUrl;
            }
        } catch (error) {
            console.error("Error fetching strich image:", error);
        }

        return null;
    }, [imageCache]);

    useEffect(() => {
        const fetchStriche = async () => {
            try {
                fetch(
                    REQUEST_URL + LIST_GET_SPECIFIC_LIST_NAME + `/${listId}`,
                    {
                        method: HTTP_METHOD_GET,
                        headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie())
                    }
                )
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Failed to fetch list name.");
                        }
                        return response.json();
                    })
                    .then(data => {
                        setTitle(data.name);
                    })
                    .catch(error => {
                        console.error("Error fetching list name:", error);
                    });


                const response = await fetch(
                    REQUEST_URL + STRICH_GET_STRICHE_FROM_LIST + `/${listId}`,
                    {
                        method: HTTP_METHOD_GET,
                        headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie())
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch striche.");
                }

                const data: PersonWithStriche[] = await response.json();

                // Namen und Profilbilder der Personen abrufen
                const updatedPeople = await Promise.all(data.map(async (person) => {
                    const name = await fetchUserName(person.person_id);
                    const imageUrl = await getProfileImage(person.person_id);
                    return {...person, name, imageUrl};
                }));

                setPeopleWithStriche(updatedPeople);
                setLoading(false);
            } catch (error) {
                setError('Fehler beim Abrufen der Striche.');
                setLoading(false);
            }
        };

        fetchStriche();
    }, [listId, getProfileImage]);

    const fetchUserName = async (userId: string) => {
        try {
            const response = await fetch(REQUEST_URL + USER_GET_USER + `/${userId}`, {
                method: HTTP_METHOD_GET,
                headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie())
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user.");
            }

            const data: User = await response.json();
            return data.name;
        } catch (error) {
            console.error("Error fetching user:", error);
            return userId;
        }
    };

    const handleOpenDialog = (personId: string) => {
        setSelectedPerson(personId);
        setDialogOpen(true);
    };

    const handleOpenStrichDialog = async (strich: Strich) => {
        setSelectedStrich(strich);
        setStrichDialogOpen(true);

        if (strich.reason_image_id) {
            const imageUrl = await getReasonImage(strich.uuid);
            setReasonImageSrc(imageUrl);
        } else {
            setReasonImageSrc(null); // Reset if no image
        }
    };

    const handleOpenDoneDialog = (personId: string) => {
        setSelectedPerson(personId);
        setDoneDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setReason('');
        setReasonImage(null);
        setReasonImageID(null);
        setSelectedPerson(null);
    };

    const handleCloseStrichDialog = () => {
        setStrichDialogOpen(false);
        setSelectedStrich(null);
        setReasonImageSrc(null);
    };

    const handleCloseDoneDialog = () => {
        setDoneDialogOpen(false);
    };


    const handleOpenInformationDialog = (personId: string) => {
        setSelectedInformationPerson(personId);
        setInformationDialogOpen(true);
    }

    const handleCloseInformationDialog = () => {
        setInformationDialogOpen(false);
        setSelectedInformationPerson(null);
    }

    const handleDoneStrich = async () => {
        if (!selectedPerson) return;

        const person = peopleWithStriche.find(p => p.person_id === selectedPerson);
        if (!person) return;

        const oldestStrich = person.striche
            .filter(strich => !strich.done)
            .sort((a, b) => new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime())[0];

        if (!oldestStrich) return;

        try {
            const response = await fetch(REQUEST_URL + STRICH_SET_DONE + `/${oldestStrich.uuid}`, {
                method: 'POST',
                headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie())
            });

            if (!response.ok) {
                throw new Error("Failed to mark strich as done.");
            }

            setDoneDialogOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error marking strich as done:", error);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(REQUEST_URL + IMAGE_UPLOAD_URL_STRICH_REASON, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Image upload failed");
            }

            const data = await response.json();
            setReasonImageID(data.image_id);
            setReasonImage(URL.createObjectURL(file));
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const handleCreateStrich = async () => {
        const data = {
            reason,
            reason_image_id: reasonImageID,
            list_id: listId,
            getter_id: selectedPerson,
        };

        try {
            const response = await fetch(REQUEST_URL + STRICH_CREATE_URL, {
                method: 'POST',
                headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie()),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Strich creation failed");
            }

            handleCloseDialog();
            window.location.reload();
        } catch (error) {
            console.error("Error creating strich:", error);
        }
    };

    const handleAddUser = async () => {
        try {
            const response = await fetch(REQUEST_URL + LIST_ADD_USER_URL + `/${listId}/${username}`, {
                method: 'POST',
                headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie())
            });

            if (!response.ok) {
                throw new Error("Failed to add user.");
            }

            setAddUserDialogOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    if (loading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <CircularProgress/>
        </Box>;
    }

    if (error) {
        return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <p>{error}</p>
        </Box>;
    }

    return (
        <div>
            <Header/>

            <DesignContainer>
                <Card>
                    <Typography variant="h6">
                        {title}
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => setAddUserDialogOpen(true)}
                        startIcon={<AddIcon/>}
                        sx={{marginBottom: 2, marginTop: 2}}
                    >
                        Mitglied hinzufügen
                    </Button>

                    <Dialog open={addUserDialogOpen} onClose={() => setAddUserDialogOpen(false)}>
                        <DialogTitle>Add a new user</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Username"
                                type="text"
                                fullWidth
                                variant="standard"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setAddUserDialogOpen(false)} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleAddUser} color="primary">
                                Add
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <List>
                        {peopleWithStriche.map(person => {
                            const incompleteStriche = person.striche.filter(strich => !strich.done);
                            const maxIconsToShow = 3;

                            // sort striche in ascending order by date
                            incompleteStriche.sort((a, b) => new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime());


                            return (
                                <ListItem key={person.person_id}>
                                    <Avatar src={person.imageUrl || undefined}
                                            sx={{width: 56, height: 56, marginRight: 1}}/>
                                    <ListItemText primary={person.name}/>
                                    <div>
                                        {incompleteStriche.slice(0, maxIconsToShow).map(strich => (
                                            <IconButton key={strich.uuid}
                                                        onClick={() => handleOpenStrichDialog(strich)}>
                                                🍰
                                            </IconButton>
                                        ))}

                                        {incompleteStriche.length > maxIconsToShow && (
                                            <span style={{marginLeft: '8px', fontSize: '14px'}}>
                            +{incompleteStriche.length - maxIconsToShow}
                        </span>
                                        )}

                                        <IconButton onClick={() => handleOpenDialog(person.person_id)}>
                                            <AddIcon/>
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenDoneDialog(person.person_id)}>
                                            <CheckIcon/>
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenInformationDialog(person.person_id)}>
                                            <InfoOutlinedIcon/>
                                        </IconButton>
                                    </div>
                                </ListItem>
                            );
                        })}
                    </List>

                    <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                        <DialogTitle>Neuer Strich</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Begründung"
                                type="text"
                                fullWidth
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                            <Button variant="contained" component="label" startIcon={<UploadIcon/>}>
                                Upload Image
                                <input type="file" hidden onChange={handleImageUpload}/>
                            </Button>
                            {reasonImage &&
                                <img src={reasonImage} alt="Reason Image"
                                     style={{marginTop: '10px', maxWidth: '100%'}}/>}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleCreateStrich} color="primary">
                                Erstellen
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {selectedStrich && (
                        <Dialog open={strichDialogOpen} onClose={handleCloseStrichDialog}>
                            <DialogTitle>Strich Details</DialogTitle>
                            <DialogContent>
                                <p><strong>Begründung:</strong> {selectedStrich.reason}</p>
                                <p>
                                    <strong>Reporter:</strong>{" "}
                                    {selectedStrich.reporter_id
                                        ? peopleWithStriche.find(person => person.person_id === selectedStrich.reporter_id)?.name || selectedStrich.reporter_id
                                        : "Automatic System"}
                                </p>
                                <p><strong>Datum:</strong> {selectedStrich.creation_date}</p>

                                {reasonImageSrc && (
                                    <img
                                        src={reasonImageSrc}
                                        alt="Reason Image"
                                        style={{maxWidth: '100%'}}
                                    />
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseStrichDialog}>Schließen</Button>
                            </DialogActions>
                        </Dialog>
                    )}

                    <Dialog open={doneDialogOpen} onClose={handleCloseDoneDialog}>
                        <DialogTitle>Ältesten Strich abschließen</DialogTitle>
                        <DialogContent>
                            <p>Wurde der Strich wirklich eingelöst</p>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDoneDialog} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleDoneStrich} color="primary">
                                Abschließen
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={informationDialogOpen} onClick={handleCloseInformationDialog}>
                        <DialogTitle>User Information</DialogTitle>
                        <DialogContent>
                            <p><strong>Abgeschlossene Striche:</strong> {getDoneStricheCount(selectedPersonInformation || "")}</p>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseInformationDialog}>Schließen</Button>
                        </DialogActions>
                    </Dialog>
                </Card>
            </DesignContainer>
            <Footer/>
        </div>
    );
};

