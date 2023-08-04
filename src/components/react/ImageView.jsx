import { useCallback, useState } from "react";
import ImageViewer from "react-simple-image-viewer";
import { projects } from "../../data/projects";
export default function ImageView({ src, alt, index, children }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const images = projects.map((project) => project.image);
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
      >
        <img
          className="w-full h-full object-right-bottom md:object-center object-cover"
          src={src}
          alt={alt}
          key={index}
        />
        {children && (
          <div className="z-[0.5] pointer-events-none group-hover:backdrop-blur-[1px] backdrop-blur-none bg-transparent group-hover:bg-neutral-500/30 absolute inset-0 w-full h-full grid place-items-center transition ease-in-out">
            {" "}
            {children}
          </div>
        )}
      </div>
      {isViewerOpen && (
        <ImageViewer
          src={images}
          currentIndex={currentImage}
          disableScroll={true}
          backgroundStyle={{
            backgroundColor: "rgb(209,209,209)",
          }}
          closeOnClickOutside={true}
          onClose={closeImageViewer}
        />
      )}
    </>
  );
}
