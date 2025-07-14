import React, { memo, useState, useEffect } from 'react';
import type { ImageContentData } from '@onlook/models';
import { ImageItem } from './image-item';
import { Button } from '@onlook/ui/button';
import { Icons } from '@onlook/ui/icons';
import { useImagesContext } from './providers/images-provider';
import DeleteImageModal from './delete-modal';
import RenameImageModal from './rename-modal';
import MoveImageModal from './move-modal';
import { useImageDragDrop } from './hooks/use-image-drag-drop';
import { cn } from '@onlook/ui/utils';

interface ImageListProps {
    images: ImageContentData[];
    currentFolder: string;
}

export const ImageList = memo(({ images, currentFolder }: ImageListProps) => {
    const { uploadOperations, deleteOperations, renameOperations, moveOperations } =
        useImagesContext();
    const { handleClickAddButton, handleUploadFile, uploadState } = uploadOperations;
    const { deleteState, onDeleteImage, handleDeleteModalToggle } = deleteOperations;
    const { renameState, onRenameImage, handleRenameModalToggle } = renameOperations;
    const { moveState, moveImageToFolder, handleMoveModalToggle } = moveOperations;
    const { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, isDragging } =
        useImageDragDrop(currentFolder);
    
    const [loadingImages, setLoadingImages] = useState<Map<string, { url: string; file: File }>>(new Map());

    const handleSeamlessUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));

        for (const imageFile of imageFiles) {
            // Create a unique ID for this loading image
            const loadingId = `loading-${Date.now()}-${Math.random()}`;
            
            // Create object URL for immediate preview
            const objectUrl = URL.createObjectURL(imageFile);
            
            // Add to loading state immediately
            setLoadingImages(prev => new Map(prev).set(loadingId, { url: objectUrl, file: imageFile }));
            
            try {
                // Upload the image
                await uploadOperations.uploadImage(imageFile, currentFolder);
                
                // Remove from loading state when done
                setLoadingImages(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(loadingId);
                    return newMap;
                });
                
                // Clean up object URL
                URL.revokeObjectURL(objectUrl);
            } catch (error) {
                console.error('Upload failed:', error);
                // Remove from loading state on error
                setLoadingImages(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(loadingId);
                    return newMap;
                });
                URL.revokeObjectURL(objectUrl);
            }
        }
        
        // Clear the input
        e.target.value = '';
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            loadingImages.forEach(({ url }) => {
                URL.revokeObjectURL(url);
            });
        };
    }, [loadingImages]);

    return (
        <div
            className="flex flex-col gap-2 h-full"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <p className="text-sm text-gray-200 font-medium">Images</p>
            <div className={cn(isDragging && 'cursor-copy bg-teal-500/40', 'h-full')}>

                <div className="w-full grid grid-cols-2 gap-3 p-0 overflow-y-auto">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="images-upload"
                        onChange={handleSeamlessUpload}
                        multiple
                    />
                    
                    {/* Actual Images */}
                    {images.map((image) => (
                        <ImageItem key={image.originPath} image={image} />
                    ))}
                    
                    {/* Add Image Button - Right after the last image */}
                    <div 
                        className="aspect-square rounded-lg bg-foreground-onlook/50 opacity-20 hover:opacity-100 hover:bg-background-primary hover:border-[0.5px] hover:border-foreground-onlook/50 cursor-pointer flex flex-col items-center justify-center transition-all duration-200 group"
                        onClick={(e) => handleClickAddButton(e as any)}
                    >
                        <div className="opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 cursor-pointer">
                            <Icons.ImageAdd className="w-5 h-5 text-foreground-onlook" />
                            <span className="text-sm text-foreground-onlook">Add an Image</span>
                        </div>
                    </div>
                    
                    {/* Loading Images */}
                    {Array.from(loadingImages.entries()).map(([loadingId, { url }]) => (
                        <div key={loadingId} className="aspect-square rounded-lg overflow-hidden opacity-50 transition-opacity duration-300">
                            <img 
                                src={url} 
                                alt="Loading..." 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                    
                    {/* Placeholder blocks - Always show remaining slots */}
                    {Array.from({ length: Math.max(0, 7 - images.length - loadingImages.size - 1) }).map((_, index) => (
                        <div key={`placeholder-${index}`} className="aspect-square rounded-lg bg-foreground-onlook/50 opacity-20"></div>
                    ))}
                </div>
            </div>
            <DeleteImageModal
                onDelete={onDeleteImage}
                isOpen={!!deleteState.imageToDelete}
                toggleOpen={handleDeleteModalToggle}
                isLoading={deleteState.isLoading}
            />
            <RenameImageModal
                onRename={onRenameImage}
                isOpen={
                    !!renameState.imageToRename &&
                    !!renameState.newImageName &&
                    renameState.newImageName !== renameState.imageToRename
                }
                toggleOpen={handleRenameModalToggle}
                newName={renameState.newImageName}
                isLoading={renameState.isLoading}
            />
            <MoveImageModal
                onMove={moveImageToFolder}
                isOpen={!!moveState.imageToMove && !!moveState.targetFolder}
                toggleOpen={handleMoveModalToggle}
                isLoading={moveState.isLoading}
                image={moveState.imageToMove}
                targetFolder={moveState.targetFolder}
            />
        </div>
    );
});
