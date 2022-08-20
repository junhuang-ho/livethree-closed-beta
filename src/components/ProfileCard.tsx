import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';

import { useState, useEffect } from "react";
import { query, where, getDocs } from "firebase/firestore"
import { useNavigate, useLocation } from 'react-router-dom';
import { COL_REF_USERS } from '../services/firebase'

import placeholder_image from '../assets/placeholder_image.jpg'

type LocationProps = {
    state: {
        from: Location;
    };
};

export const ProfileCard = ({ address, isMobile }: { address: string, isMobile: boolean | null }) => {
    const navigate = useNavigate();
    const location = useLocation() as unknown as LocationProps; // https://github.com/reach/router/issues/414#issuecomment-1056839570

    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const getDetails = async () => {
            // TODO: is there a better way to do this than query?
            const q = query(COL_REF_USERS, where("address", "==", address));
            const querySnapshot = await getDocs(q)
            if (querySnapshot.size === 1) {
                querySnapshot.forEach((doc) => {
                    setData(doc.data())
                });
            } else {
                console.error("should not return more than 1")
            }
        }
        if (address) {
            getDetails()
        }

    }, [address])

    return (
        <Box sx={ { width: "100%" } }>
            { isMobile && (data ? (
                <ListItemButton
                    onClick={ () => {
                        navigate(`/user/${ data?.address }`, {
                            state: {
                                from: location,
                                // address: data?.address,
                                previewMode: false,
                                favourited: true
                            }
                        })
                    } }
                >
                    <ListItemIcon>
                        <Avatar
                            src={ data?.photoURL }
                        />
                    </ListItemIcon>
                    <ListItemText primary={ data?.handle || data?.address } />
                </ListItemButton>
            ) : (
                <div>loading</div>
            )) }
            { !isMobile && (data ? (
                <Card
                    variant="outlined"
                >
                    <CardActionArea
                        onClick={ () => {
                            navigate(`/user/${ data?.address }`, {
                                state: {
                                    from: location,
                                    // address: data?.address,
                                    previewMode: false,
                                    favourited: true
                                }
                            })
                        } }
                    >
                        <CardMedia
                            component="img"
                            height="160"
                            image={ data.photoURL ? data.photoURL : placeholder_image }
                        />
                        <CardContent sx={ { height: 130 } }>
                            <Stack>
                                <Typography variant="subtitle2" sx={ { pb: 2 } }>
                                    { data?.handle || data?.address }
                                </Typography>
                                {/* Typography's sx prop ref: https://stackoverflow.com/a/32585024  |  https://stackoverflow.com/a/71324014 */ }
                                <Typography variant="body2" sx={ {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '2',
                                    WebkitBoxOrient: 'vertical',
                                } }>
                                    { data.headline }
                                </Typography>
                            </Stack>
                        </CardContent>
                    </CardActionArea>
                </Card>
            ) : (
                <div>loading</div>
            ))
            }
        </Box >
    );
}
