import React from 'react';
import { Box, Typography, Divider, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DoneIcon from '@mui/icons-material/Done';

import { Notification } from '@/types';

export interface NotificationPanelProps {
    notifications: Notification[];
    unreadCount: number;
    handleClose: () => void;
    anchorElNotifications: null | HTMLElement;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
    notifications,
    unreadCount,
    handleClose,
    anchorElNotifications
}) => {
    const handleNotificationClick = async (notificationId: string) => {
        handleClose();
    };

    return (
        <Menu
            id="menu-notifications"
            anchorEl={anchorElNotifications}
            // anchorOrigin={{
            //     vertical: 'top',
            //     horizontal: 'right',
            // }}
            // keepMounted
            // transformOrigin={{
            //     vertical: 'top',
            //     horizontal: 'right',
            // }}
            open={Boolean(anchorElNotifications)}
            onClose={handleClose}
            sx={{
                mt: '45px',
                width: '80vw',  // 80% of the viewport width
                height: '80vh',  // 80% of the viewport height
                '@media (max-width: 960px)': {
                    width: '80vw',
                    height: '80vh',
                },
            }}
        >
            <Box sx={{ padding: '8px 16px', backgroundColor: '#EAEAEA' }}>
                <Typography
                    variant="h6"
                    sx={{ color: '#1C3F60', fontWeight: 'bold', textAlign: 'center' }}
                >
                    Notifications
                </Typography>
            </Box>
            <Divider />

            <Box
                sx={{
                    maxHeight: 'calc(80vh - 60px)', // Allow room for padding and title
                    maxWidth: 'calc(80vw - 32px)', // Adjust to have a little padding
                    overflowX: 'auto',  // Horizontal scroll
                    overflowY: 'auto',  // Vertical scroll
                }}
            >
                {notifications.length ? (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification.id)}
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#ADEFD1',
                                },
                            }}
                        >
                            <ListItemIcon>
                                <NotificationsNoneIcon sx={{ color: '#00A8E8' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={notification.message}
                                primaryTypographyProps={{
                                    color: '#36454F',
                                    fontWeight: 'medium',
                                }}
                            />
                            {notification.isRead && <DoneIcon sx={{ color: '#005E82' }} />}
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>
                        <Typography textAlign="center" sx={{ color: '#36454F' }}>
                            No notifications
                        </Typography>
                    </MenuItem>
                )}
            </Box>
        </Menu>
    );
};

export default NotificationPanel;
