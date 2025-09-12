import { Box, Typography } from "@mui/material";
import { Building, Mail } from "lucide-react";

const ProfileFieldsLayout = ({ item }: { item: any; }) => {
    const Icon = item.icon;
    return (   
        <Box sx={{ display: 'flex', alignItems: 'center',  gap: 1, mb: 1 }}>
            <Icon size={14} color="grey" />
            <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{
                width: 200,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>{item.value}</Typography>
        </Box>
    );
}
const ProfileDetailsLayout = ({ item }: { item: any; }) => {
    return (
        <Box component={"div"} sx={{"display": "block", "alignItems": "center", ml: 3.5, py: 1 }}>
            <ProfileFieldsLayout item={{
                icon: Mail,
                value: item.email
            }} />
            <ProfileFieldsLayout item={{
                icon: Building,
                value: item.organization
            }} />
        </Box>
    );
};

export default ProfileDetailsLayout;