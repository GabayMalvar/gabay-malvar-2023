import { useState } from "react";
import { getStorage, ref, uploadBytes } from "firebase/storage";

export default function ImageUpload() {
  const [image, setImage] = useState(null);

  const handleChange = e => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!image) {
      alert("Please choose an image first.");
      return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `images/${image.name}`);
    uploadBytes(storageRef, image).then((snapshot) => {
      console.log('Uploaded an image file!');
    });
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={handleChange} 
        accept="image/png, image/jpeg, image/gif" 
        style={{ display: 'none' }} 
        id="fileInput"
      />
      <label 
        htmlFor="fileInput"
        className="h-10 font-bold px-2 border-primary-green text-primary-green border-2 rounded-lg cursor-pointer hover:bg-primary-green hover:text-safe-white inline-block"
      >
        Choose File
      </label>
      <button 
        onClick={handleUpload} 
        className="h-10 font-bold px-2 border-primary-green text-primary-green border-2 rounded-lg ml-2 hover:bg-primary-green hover:text-safe-white"
      >
        Upload
      </button>
    </div>
  );
}

