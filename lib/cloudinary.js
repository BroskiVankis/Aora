import axios from 'axios';
import * as FileSystem from 'expo-file-system';

export const uploadVideoToCloudinary = async (videoUri, uploadPreset, cloudName) => {
    try {
        const base64 = await FileSystem.readAsStringAsync(videoUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const formData = new FormData();
        formData.append('file', `data:video/mp4;base64,${base64}`);
        formData.append('upload_preset', uploadPreset);

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.secure_url;
    } catch (error) {
        console.error('Error uploading video to Cloudinary:', error);
        throw error;
    }
};