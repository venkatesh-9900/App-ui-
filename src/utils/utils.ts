import {FileDetails } from "@/types";
import { file_attachments_delimiter } from "@/constants/constants";

/**
 * verify password at least 8 minimum length, Contains at least 1 number and container one special character
 * @param {*} password
 * @returns
 */
export const verifyPassword = (password: string) => {
    // Check minimum length
    if (!password || password.length < 8) {
        return false;
    }

    // Check for at least 1 number
    if (!/\d/.test(password)) {
        return false;
    }

    // Check for at least 1 special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return false;
    }

    // If all checks pass, the password is valid
    return true;
}

export const isValidEmail = (email: string) => {
    if (!email || email.length == 0) {
        return false;
    } else if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(email)) {
        return true;
    } else {
        return false;
    }
};

export const extractRenderVizUrls = (text: string): string[] => {
    const regex = /RENDER-VIZ-ON-UI:(http(s)?:\/\/[^\s]+\.html)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        matches.push(match[1]);
    }
    return matches;
}
export const stripRenderVizUrls = (text: string): string => {
    return text
        .split('\n')
        .filter(line => !line.trim().startsWith('RENDER-VIZ-ON-UI:'))
        .join('\n')
        .trim(); // <— this is important to remove trailing line
};
// export const getResponseType = (message: Message): string => {
//     const content = message.content;
//
//     if (content.chartData) return 'chart';
//     if (content.tableData) return 'table';
//     if (content.code) return 'code';
//     if (content.image) return 'image';
//     if (content.fileType) return 'file';
//
//     return 'text';
// };
export const getTextWithoutReasoning = (text: string): string => {
    const regex = /<think>.*?<\/think>/g;
    const final_text = text.replace(regex, '');
    if (final_text.trim() == "") {
        return "";
    }
    return final_text;
}

export const addAttachedFilesPublicLinks = (text: string, attachedFiles: FileDetails[]) : string => {
    if (attachedFiles.length > 0) {
        const public_url_lists = attachedFiles.map((e) => e.public_link).join(",\n");
        return `${text}${file_attachments_delimiter}${public_url_lists}`
    } else {
        return text;
    }
}

export const extractAttachedFilesPublicLinks = (text: string) : { message: string, attachedFiles: string[] } => {
    const message_body = text.split(file_attachments_delimiter);
    if (message_body.length > 1) {
        return {
            message: message_body[0],
            attachedFiles: message_body[1].split(",\n")
        };
    } else {
        return {
            message: message_body[0],
            attachedFiles: []
        };
    }
}

// export const getChatFragments = (messageText: string): ChatFragment[] => {
//     let fragments: ChatFragment[] = [];
//     // console.log("Message Text:", messageText);
//     let messageTextSubstring = messageText;
//     while (messageTextSubstring.trim().length > 0) {
//         const posReasoning = messageTextSubstring.indexOf('<think>');
//         if (posReasoning >= 0) {
//             if (posReasoning > 0) {
//                 const responseString = removeToolUsageAndResults(messageTextSubstring.substring(0, posReasoning)).trim();
//                 if (responseString.length > 0) {
//                     fragments.push({ text: responseString, type: 'response' });
//                 }
//             }
//             messageTextSubstring = messageTextSubstring.substring(posReasoning + '<think>'.length).trim();
//             const posReasoningEnd = messageTextSubstring.indexOf('</think>');
//             if (posReasoningEnd > 0) {
//                 const reasoningString = messageTextSubstring.substring(0, posReasoningEnd).trim();
//                 if (reasoningString.length > 0) {
//                     fragments.push({ text: reasoningString, type: 'thought' });
//                 }
//                 messageTextSubstring = messageTextSubstring.substring(posReasoningEnd + '</think>'.length).trim();
//             } else if (posReasoningEnd == 0) {
//                 messageTextSubstring = messageTextSubstring.substring('</think>'.length).trim();
//             } else {
//                 if (messageTextSubstring.trim().length > 0) {
//                     fragments.push({ text: messageTextSubstring.trim(), type: 'thought' });
//                 }
//                 messageTextSubstring = '';
//             }
//         } else {
//             const responseString = removeToolUsageAndResults(messageTextSubstring).trim();
//             if (responseString.length > 0) {
//                 fragments.push({ text: removeToolUsageAndResults(messageTextSubstring), type: 'response' });
//             }
//             messageTextSubstring = '';
//         }
//     }
//     console.log("Fragments:", fragments);
//     return fragments;
// }

function removeToolUsageAndResults(text: string) {
    const complexToolUseRegex = /\s*\{"name":\s*"[^"]*",[\s\S]*?"arguments":\s*\{[\s\S]*?\}\}\}\s*,?\s*/g;
    const simpleToolUseRegex = /\s*\{"name":\s*"[^"]*",\s*"arguments":\s*\{[\s\S]*?\}\}\s*/g;
    let cleanText = text;
    
    // First, remove the tool call JSON
    cleanText = cleanText.replace(complexToolUseRegex, '');
    cleanText = cleanText.replace(simpleToolUseRegex, '');

    // Trim any extra whitespace/newlines remaining at the start/end
    return cleanText.trim();
}