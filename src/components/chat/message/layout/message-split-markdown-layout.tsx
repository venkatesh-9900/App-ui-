import React from 'react';
import {stripRenderVizUrls} from "@/utils/utils.ts";
import {RenderMessageSplitLayoutProps} from "@/types";
import { Box, Grid } from "@mui/material";
import {MessageMarkdown} from "@/components/chat/message/message-markdown.tsx";
import MarkdownWrapper from "@/components/chat/message/format/markdown-wrapper.tsx";
import {VisualizationViewer} from "@/components/chat/message/layout/visualization-viewer.tsx";

export const MessageSplitMarkdownLayout: React.FC<RenderMessageSplitLayoutProps> = ({
                                                                                      summary,
                                                                                      displayText,
                                                                                      renderVizUrls,
                                                                                      code,
                                                                                      language,
                                                                                      image,
                                                                                      chartData,
                                                                                      chartType,
                                                                                      tableData,
                                                                                      columns,
                                                                                      fileType,
                                                                                      fileExtension,
                                                                                      showDownload,
                                                                                      isTyping,
                                                                                      showContent,
                                                                                      showAdditionalContent,
                                                                                      onVizSelect,
                                                                                      onCloseSplitView
                                                                                  }) => {

    const strippedSummary = stripRenderVizUrls(summary);
    const hasVisualizations = renderVizUrls.length > 0;

    return (
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ width: '100%' }}>
            {/* Left text content */}
            <Grid size={{ xs: 12 }}>
                <MessageMarkdown content={stripRenderVizUrls(summary ?? '')} />
            </Grid>

            {/* Right visualization content (only if URLs exist) */}
            {hasVisualizations && (
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {renderVizUrls.map((url, idx) => (
                            <VisualizationViewer key={`${url}-${idx}`} htmlUrl={url} />
                        ))}
                    </Box>
                </Grid>
            )}
        </Grid>
    );
};
