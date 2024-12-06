import React, {useState} from "react";
import {
    getCredentialCookie,
    HTTP_AUTH_HEADERS,
    IMAGE_UPDATE_URL,
    IMAGE_UPLOAD_URL_USER,
    REQUEST_URL
} from "../../global/constants/constants";
import {Avatar, Box, Button} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";



interface ImageUploadProps {
    image_url: string;
    image_id: string;
}

const ImageUpdate: React.FC<ImageUploadProps> = ({image_url, image_id}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);

            const response = await fetch(REQUEST_URL + IMAGE_UPDATE_URL + `/${image_id}`, {
                method: 'POST',
                headers: HTTP_AUTH_HEADERS(getCredentialCookie()),
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Image upload failed");
            }

            const data = await response.json();
            console.log(data);

            setSelectedImage(URL.createObjectURL(file));

        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '1rem',
                marginBottom: '1rem',
            }}>
                <Avatar
                    src={selectedImage ? selectedImage : image_url}
                    sx={{width: 56, height: 56}}
                />
            </div>

            <input
                accept="image/*"
                style={{display: 'none'}}
                id="upload-button"
                type="file"
                onChange={handleImageUpload}
            />
            <label htmlFor="upload-button">
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <Button variant="contained" component="span" startIcon={<UploadIcon/>} disabled={loading}>
                        {loading ? 'Uploading...' : 'Update Profile Picture'}
                    </Button>
                </div>
            </label>


        </Box>
    );
};

export default ImageUpdate;