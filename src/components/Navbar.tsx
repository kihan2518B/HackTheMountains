"use client";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import Link from 'next/link';
import Badge from '@mui/material/Badge';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

import NotificationPanel from './NotificationPanel';
import {Notification} from "@/types"
import { getUserRoleFromToken,getUserIdFromToken } from '@/utils/utils';
import LogoutButton from './LogoutButton';

import { db } from '@/config/firebase';
import { onSnapshot, collection, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';


const pages = [
    { title: 'Home', link: '/', isCustomer: true, isProvider: true },
    { title: 'Book a appointment', link: '/customerDashboard', isCustomer: true, isProvider: true },
    { title: 'Dashboard', link: '/providerDashboard', isCustomer: false, isProvider: true },
    { title: 'Become A Provider', link: '/registerProvider', isCustomer: true, isProvider: false },
];

const settings = [
    { title: 'Profile', link: 'profile', isCustomer: true, isProvider: true },
];


const Navbar = () => {
    const router = useRouter();
    // const [notifications, unreadCount] = [[{
    //     id: "01",
    //     message: "Nothing vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv",
    //     isRead: false
    // }, {
    //     id: "02",
    //     message: "Nothing vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv",
    //     isRead: false
    // },], 2];

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const [isProvider, setIsProvider] = useState<boolean | null>(null);
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setToken(token)
        }
    }, [])
    useEffect(() => {
        if (token) {
            const UserRole = getUserRoleFromToken(token);
            // console.log(UserRole)
            setIsProvider(UserRole == 'provider' ? true : false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            const userID = getUserIdFromToken(token);
            if (!userID) return;
    
            // Create a Firestore query to fetch notifications for the user in real-time
            const q = query(
                collection(db, 'notifications'),
                where('recipientId', '==', userID),  // Filter by the recipientId
                orderBy('createdAt', 'desc')         // Order notifications by createdAt timestamp
            );
    
            // Listen to Firestore snapshot changes for real-time updates
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedNotifications = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(), // Add all fields from Firestore document
                })) as Notification[];
    
                // Log to check if the fetched notifications are correct
                // console.log("Fetched Notifications:", fetchedNotifications);
    
                // Update notifications state
                setNotifications(fetchedNotifications);
    
                // Update unreadCount state by filtering unread notifications
                setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
            });
    
            // Clean up the subscription when the component is unmounted
            return () => unsubscribe();
        }
    }, [token]);

    const markAsRead = async (notificationId: string) => {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, { isRead: true });
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(unreadCount-1);
    };

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNotifications(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleCloseNotifications = () => {
        setAnchorElNotifications(null);
    };

    const handleLogout = async () => {
        try {
            localStorage.removeItem('token'); // removing token from the localstorage
            router.push("/login");
        } catch (error) {
            toast.error('Logout failed');
            console.error(error);
        }
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        ReserveME
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages.filter(page => page.isCustomer !== isProvider || page.isProvider == isProvider).map((page) => (
                                <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                                    <Link href={page.link}>
                                        <Typography textAlign="center">{page.title}</Typography>
                                    </Link>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        LOGO
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.filter(page => page.isCustomer !== isProvider || page.isProvider === isProvider).map((page) => (
                            <Link key={page.title} href={page.link}>
                                <Button
                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    {page.title}
                                </Button>
                            </Link>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Notifications">
                            <IconButton onClick={handleOpenNotifications} sx={{ p: 2 }}>
                                <Badge badgeContent={unreadCount} color="error">
                                    <NotificationsNoneIcon sx={{ color: 'white' }} />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        <NotificationPanel
                        markAsRead={markAsRead}
                            notifications={notifications}
                            unreadCount={unreadCount}
                            handleClose={handleCloseNotifications}
                            anchorElNotifications={anchorElNotifications}
                        />
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.filter(setting => setting.isCustomer !== isProvider || setting.isProvider === isProvider).map((setting) => (
                                <MenuItem key={setting.title} onClick={handleCloseUserMenu}>
                                    <Link href={setting.link}>
                                        <Typography textAlign="center">{setting.title}</Typography>
                                    </Link>
                                </MenuItem>
                            ))}
                            <LogoutButton />
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;