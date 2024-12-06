import React, { useState } from 'react';
import { Button, Avatar, Box } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import {IMAGE_UPLOAD_URL_USER, REQUEST_URL} from "../../../global/constants/constants";

// Typ für die Props, die von anderen Komponenten verwendet werden
interface ImageUploadProps {
    onImageUpload: (imageId: string) => void;
}



const defaultImage = '../../../global/image/blank-profile-picture.png';

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);

            const response = await fetch(REQUEST_URL + IMAGE_UPLOAD_URL_USER, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Image upload failed");
            }

            const data = await response.json();
            const imageId = data.image_id;

            setSelectedImage(URL.createObjectURL(file));
            onImageUpload(imageId);

        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id="upload-button"
                type="file"
                onChange={handleImageUpload}
            />
            <label htmlFor="upload-button">
                <Button variant="contained" component="span" startIcon={<UploadIcon />} disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload Profile Picture'}
                </Button>
            </label>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '1rem',
                marginBottom: '1rem',
            }}>
                <Avatar
                    src={selectedImage ? selectedImage : defaultImage}
                    sx={{width: 56, height: 56}}
                />
            </div>

        </Box>
    );
};




export default ImageUpload;
