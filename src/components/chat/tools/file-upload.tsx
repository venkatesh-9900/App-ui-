/**
 * @file FileUpload.tsx
 * @description Component for handling file uploads with a button interface.
 */

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from "@/components/ui/button";
import { Image } from 'lucide-react';

export interface FileUploadHandle {
    triggerFileDialog: () => void;
}


/**
 * Props for the FileUpload component
 */
interface FileUploadProps {
    /** Callback function triggered when an image is selected */
    onFileUpload: (files: File[]) => void;
    /** Whether the upload functionality is disabled */
    disabled?: boolean;
    showButton?: boolean;
}

/**
 * FileUpload component that renders a hidden file input and (optionally) a visible upload button.
 * Supports uploading images via manual trigger using a forwarded ref.
 *
 * @component
 * @param {Object} props - Component props
 * @param {(files: File[]) => void} props.onFileUpload - Callback triggered when an file is selected
 * @param {boolean} [props.disabled=false] - Whether the upload functionality is disabled
 * @param {boolean} [props.showButton=true] - Whether to display the default upload button
 * @param {React.Ref<FileUploadHandle>} ref - Forwarded ref that exposes `triggerFileDialog()` method
 *
 * @example
 * // With visible button
 * <FileUploadHandle onFileUpload={(file) => console.log(file)} />
 *
 * @example
 * // Trigger manually via ref
 * const FileUploadRef = useRef<FileUploadHandle>(null);
 *
 * <FileUpload ref={fileUploadRef} onFileUpload={handleFile} showButton={false} />
 * <button onClick={() => fileUploadRef.current?.triggerFileDialog()}>Upload File</button>
 */
export const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(
    ({ onFileUpload, disabled = false, showButton = true }, ref) => {
        const fileInputRef = useRef<HTMLInputElement>(null);

        useImperativeHandle(ref, () => ({
            triggerFileDialog: () => {
                if (!disabled) {
                    fileInputRef.current?.click();
                }
            },
        }));

        const handleClick = () => {
            if (!disabled) {
                fileInputRef.current?.click();
            }
        };

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files) {
                onFileUpload(Array.from(files));
                console.log("Selected files:", files);
            }
            event.target.value = "";
        };

        return (
            <>
                {showButton && (
                    <Button
                        onClick={handleClick}
                        variant="outline"
                        size="icon"
                        disabled={disabled}
                    >
                        <Image className="h-4 w-4" />
                    </Button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg,.gif"
                    style={{ display: 'none' }}
                    disabled={disabled}
                    multiple={true}
                />
            </>
        );
    }
);