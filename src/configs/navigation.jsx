import StarIcon from '@mui/icons-material/Star';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

import { COL_REF_USERS } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore"

export const getNavConfig = async (uid) =>
{
    const docSnap = await getDoc(doc(COL_REF_USERS, uid))
    const data = docSnap.data()

    const navConfig = [
        {
            title: 'me',
            path: '/my-profile',
            icon: data?.photoURL || "", //<Avatar src={ data.photoURL } alt="profile" />
        },
        {
            title: 'favourites',
            path: '/favourites',
            icon: <StarIcon />,
        },
        {
            title: 'calls',
            path: '/calls',
            icon: <HistoryIcon />,
        },
        {
            title: 'settings',
            path: '/settings',
            icon: <SettingsIcon />,
        },
    ];

    return navConfig;
}

