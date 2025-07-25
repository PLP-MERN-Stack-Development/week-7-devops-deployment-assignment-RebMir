import React, { useRef, useState } from 'react'
import { LuUser, LuUpload, LuTrash } from 'react-icons/lu';

const ProfilePhotoSelector = ({image, setImage}) => {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
        }
    };
    const handleRemoveImage = () => {
        setImage("");
        setPreview(null);
    };

    const onChooseFile = () => {
        inputRef.current.click();
    };
    return (
        <div className="flex justify-center mb-6">
            <input
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={handleImageChange}
                className="hidden"
            />
            {!image ? (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer" onClick={onChooseFile}>
                    <LuUser className="text-4xl text-primary" />
                    <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center absolute bg-primary text-white rounded-full"
                        onClick={onChooseFile}
                    >
                        <LuUpload className='' />
                    </button>
                </div>
            ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center relative">
                    <img
                        src={preview}
                        alt="Profile Photo"
                        className="w-20 h-20 object-cover rounded-full"
                    />
                    <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1 "
                        onClick={handleRemoveImage}
                    >
                        <LuTrash  />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfilePhotoSelector;