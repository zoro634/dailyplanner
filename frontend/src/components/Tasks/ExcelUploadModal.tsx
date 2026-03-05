import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet } from 'lucide-react';
import api from '../../lib/api';

interface ExcelUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importErrors, setImportErrors] = useState<string[]>([]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
            setImportErrors([]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            setError(null);
            setImportErrors([]);

            await api.post('/tasks/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            onUploadSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Upload failed');
            if (err.response?.data?.errors) {
                setImportErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-bold flex items-center">
                        <FileSpreadsheet className="mr-2 h-5 w-5 text-[var(--color-primary-600)]" />
                        Import Tasks Schedule
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--border)] transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <p className="text-sm opacity-80 mb-6">
                        Upload an Excel file containing your CAT preparation schedule.
                        <br /><br />
                        <strong>Required Columns:</strong> Date (YYYY-MM-DD), Section (QA, VARC, DILR, Revision, Mock), Topic, Task, Estimated Time (mins)
                    </p>

                    <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center hover:border-[var(--color-primary-400)] transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <Upload className="mx-auto h-8 w-8 text-[var(--color-primary-500)] mb-3" />
                        <p className="text-sm font-medium">
                            {file ? file.name : "Click or drag Excel file to upload"}
                        </p>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {error}
                            {importErrors.length > 0 && (
                                <ul className="mt-2 list-disc list-inside max-h-32 overflow-y-auto">
                                    {importErrors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[var(--border)] flex justify-end gap-3 bg-[var(--background)]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-[var(--border)] rounded-md hover:bg-[var(--border)] transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-md hover:bg-[var(--color-primary-700)] transition-colors text-sm font-medium disabled:opacity-50 flex items-center"
                    >
                        {loading ? 'Importing...' : 'Start Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};
