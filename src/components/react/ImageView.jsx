import { useCallback, useState } from "react";
import ImageViewer from "react-simple-image-viewer";
export default function ImageView({ index, importedImages, children }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const images = importedImages.map((image) => image.src);
  const openImageViewer = useCallback((index) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  return (
    <>
      <div
        className="w-full h-full relative group cursor-pointer"
        onClick={() => openImageViewer(index)}
        onKeyUp={() => openImageViewer(index)}
      >
        {children}
      </div>
      {isViewerOpen && (
        <ImageViewer
          src={images}
          currentIndex={currentImage}
          disableScroll={true}
          backgroundStyle={{
            backgroundColor: "rgb(209,209,209)",
            zIndex: 50,
          }}
          closeOnClickOutside={true}
          onClose={closeImageViewer}
        />
      )}
    </>
  );
}
