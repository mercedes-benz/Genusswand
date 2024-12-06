import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
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
    TextField
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import {
    getCredentialCookie,
    HTTP_JSON_HEADERS_WITH_AUTH,
    HTTP_METHOD_GET,
    IMAGE_UPLOAD_URL_LIST,
    LIST_CREATE_URL,
    LIST_GET_ADDED_LISTS,
    LIST_GET_IMAGE_SMALL,
    LIST_GET_SPECIFIC_LIST, logout,
    REQUEST_URL
} from '../global/constants/constants';
import {styled} from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Footer from "../footer/Footer";
import Header from "../header/Header";

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

// Typ für die Listenelemente
interface ListItemProps {
    list: {
        id: string;
        name: string;
        imageUrl: string;
    };
    onClick: () => void;
}

// Memoized Listenelement mit Typen
const ListItemComponent: React.FC<ListItemProps> = React.memo(({list, onClick}) => {
    return (
        <ListItem key={list.id} onClick={onClick} style={{cursor: 'pointer'}}>
            <Avatar src={list.imageUrl} sx={{width: 56, height: 56, marginRight: 1}}/>
            <ListItemText primary={list.name}/>
        </ListItem>
    );
});

const WelcomePage: React.FC = () => {
    const [lists, setLists] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const
        [listName, setListName] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const navigate = useNavigate();
    const defaultImage = '../global/image/blank-profile-picture.png';
    const [imageID, setImageID] = useState<string | null>(null);

    // Bildabfrage
    const getListImage = useCallback(async (listId: string) => {
        try {
            const response = await fetch(REQUEST_URL + LIST_GET_IMAGE_SMALL + `/${listId}`, {
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

        return defaultImage;
    }, []); // Leeres Abhängigkeitsarray

    useEffect(() => {
        const fetchLists = async () => {
            const cookie = getCredentialCookie();
            if (!cookie) {
                navigate('/login');  // Kein Cookie vorhanden, weiterleiten zur Login-Seite
                return;
            }

            try {
                const addedListsResponse = await fetch(
                    REQUEST_URL + LIST_GET_ADDED_LISTS,
                    {
                        method: HTTP_METHOD_GET,
                        headers: HTTP_JSON_HEADERS_WITH_AUTH(cookie)
                    }
                );

                if (addedListsResponse.status === 401) {
                    logout();
                    return;
                }

                const listIds = await addedListsResponse.json();  // Liste der IDs

                const promises = listIds.map(async (id: string) => {
                    const response = await fetch(REQUEST_URL + LIST_GET_SPECIFIC_LIST + `/${id}`, {
                        method: HTTP_METHOD_GET,
                        headers: HTTP_JSON_HEADERS_WITH_AUTH(cookie)
                    });
                    const data = await response.json();
                    return {id, name: data.name};
                });

                const listsData = await Promise.all(promises);

                const listsWithImages = await Promise.all(listsData.map(async (list) => {
                    const imageUrl = await getListImage(list.id);
                    return {...list, imageUrl};
                }));

                setLists(listsWithImages);
                setLoading(false);
            } catch (error) {
                setError('Fehler beim Abrufen der Listen');
                logout()
                setLoading(false);
            }
        };
        fetchLists();
    }, [navigate, getListImage]); // getListImage als Abhängigkeit hinzufügen


    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setListName('');
        setSelectedImage(null);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file',
            file);

        try {
            const response = await
                fetch(REQUEST_URL + IMAGE_UPLOAD_URL_LIST, {
                    method: 'POST',
                    body: formData,
                });

            if (!response.ok) {
                throw new Error("Image upload failed");
            }

            const data = await response.json();
            setSelectedImage(URL.createObjectURL(file)); // Vorschau des Bildes
            setImageID(data.image_id);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const handleCreateList = async () => {
        const data = {
            name: listName,
            profilbild_id: imageID,
        };

        try {
            const response = await fetch(REQUEST_URL + LIST_CREATE_URL, {
                method: 'POST',
                headers: HTTP_JSON_HEADERS_WITH_AUTH(getCredentialCookie()),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("List creation failed");
            }

            handleCloseDialog();
            window.location.reload();
        } catch (error) {
            console.error("Error creating list:", error);
        }
    };

    const handleListClick = (listId: string) => {
        navigate(`/list/${listId}`); // Navigiere zur Detailseite der Liste
    };

    if (loading) {
        return <Box
            sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><CircularProgress/></Box>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Header/>



            <DesignContainer direction="column" justifyContent="space-between">
                <Card variant="outlined">
                    <Button variant="contained" style={{marginTop: '1rem',}} onClick={handleOpenDialog}>
                        Neue Liste erstellen
                    </Button>
                    <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                        <DialogTitle>Neue Liste erstellen</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Listenname"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                            />
                            <input
                                accept="image/*"
                                style={{display: 'none'}}
                                id="upload-button"
                                type="file"
                                onChange={handleImageUpload}
                            />

                            <label htmlFor="upload-button">
                                <Button variant="contained" component="span" startIcon={<UploadIcon/>}>
                                    Bild hochladen
                                </Button>
                            </label>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '1rem'
                            }}>
                                <Avatar src={selectedImage || defaultImage} sx={{width: 56, height: 56}}/>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Abbrechen</Button>
                            <Button onClick={handleCreateList}>Erstellen</Button>
                        </DialogActions>
                    </Dialog>
                    <List>
                        {lists.map((list) => (
                            <ListItemComponent
                                key={list.id}
                                list={list}
                                onClick={() => handleListClick(list.id)}
                            />
                        ))}
                    </List>
                </Card>
            </DesignContainer>
            <Footer/>
        </div>
    );
};

export default WelcomePage;
