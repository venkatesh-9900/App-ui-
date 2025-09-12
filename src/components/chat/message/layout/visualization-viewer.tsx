import React, { useState, useEffect } from 'react';
import axios from 'axios';
import beautify from 'js-beautify';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { xcodeLight } from '@uiw/codemirror-theme-xcode';
import { Loader2 } from "lucide-react";
import { Box, CircularProgress, Typography, Paper, Tabs, Tab, Alert } from '@mui/material';
import { EditorView } from "@codemirror/view";


interface VisualizationViewerProps {
    htmlUrl: string;
    codeMode?: boolean;
}

export const VisualizationViewer: React.FC<VisualizationViewerProps> = ({ htmlUrl, codeMode = false }) => {
    const [activeTab, setActiveTab] = useState<'view' | 'code'>('view');
    const [htmlContent, setHtmlContent] = useState('');
    const [formattedHtml, setFormattedHtml] = useState('');
    const [editorHeight, setEditorHeight] = useState(600);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    // console.log("---url:------", htmlUrl)
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 15;
        const interval = 2000; // 2 seconds

        const fetchUntilAvailable = async () => {
            try {
                const res = await axios.get(htmlUrl);
                const raw = res.data;
                setHtmlContent(raw);
                setFormattedHtml(beautify.html(raw, { indent_size: 2, wrap_line_length: 80 }));
                setIsLoading(false);
            } catch (err) {
                attempts++;
                if (attempts >= maxAttempts) {
                    setLoadError(true);
                    setIsLoading(false);
                } else {
                    setTimeout(fetchUntilAvailable, interval);
                }
            }
        };

        setIsLoading(true);
        setLoadError(false);
        fetchUntilAvailable();
    }, [htmlUrl]);

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper variant="outlined" sx={{ width: '100%', maxHeight: '90vh', overflow: 'hidden', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="visualization tabs">
                        <Tab label="View" value="view" />
                        <Tab label="Code" value="code" />
                    </Tabs>
                </Box>
                {isLoading ? (
                    <Box sx={{ height: { xs: 400, sm: 500, md: 600 }, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, color: 'text.secondary' }}>
                        <CircularProgress size={24} />
                        <Typography>Loading visualization...</Typography>
                    </Box>
                ) : loadError ? (
                    <Alert severity="error" sx={{ m: 2 }}>
                        Failed to load visualization. Please try again later.
                    </Alert>
                ) : (
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        {activeTab === 'view' && (
                            <Box
                                component="iframe"
                                src={htmlUrl}
                                sandbox="allow-scripts allow-same-origin"
                                sx={{
                                    width: '100%',
                                    height: { xs: 400, sm: 500, md: 600 }, // Responsive height
                                    border: 'none',
                                    display: 'block',
                                }}
                            />
                        )}
                        {activeTab === 'code' && (
                            <Box sx={{ height: { xs: 400, sm: 500, md: 600 }, overflow: 'auto' }}>
                                <CodeMirror
                                    value={formattedHtml}
                                    readOnly
                                    height="100%"
                                    basicSetup={{
                                        lineNumbers: true,
                                        highlightActiveLine: false,
                                        foldGutter: true,
                                        syntaxHighlighting: true,
                                    }}
                                    extensions={[html(), xcodeLight, EditorView.lineWrapping]}
                                    theme="light"
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};
