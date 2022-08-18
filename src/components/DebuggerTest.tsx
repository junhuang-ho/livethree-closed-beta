import { useState } from 'react';

import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Typography from "@mui/material/Typography"
import BugReportIcon from '@mui/icons-material/BugReport';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useHttpsCallable } from 'react-firebase-hooks/functions';
import { useResponsive } from '../hooks/useResponsive';

import { useWeb3Auth } from '../contexts/Web3Auth';

import { functions, db, auth, COL_REF_USERS, COL_REF_HANDLES } from '../services/firebase';
import { CHAIN_CONFIG_TYPE } from '../configs/blockchain/web3auth';
import { query, where, getDocs, getDoc, doc, writeBatch, deleteField, updateDoc } from 'firebase/firestore';

export const DebuggerTest = () => {
    const isMobile = useResponsive('down', 'sm');
    const [firebaseUser] = useAuthState(auth);
    const [updateUserHandle, isUpdating, errorUpdatingUserHandle] = useHttpsCallable(functions, 'updateUserHandle');

    const [openWallet, setOpenWallet] = useState<boolean>(false)
    const [openNetwork, setOpenNetwork] = useState<boolean>(false)
    const [network, setNetwork] = useState<CHAIN_CONFIG_TYPE | "">("")

    const { selectChain } = useWeb3Auth()

    const [handle, setHandle] = useState<string>("")
    const [isMatch, setIsMatch] = useState<boolean>(false)

    return (
        <Box
            sx={ isMobile ? {
                position: "fixed",
                bottom: (theme) => theme.spacing(8),
                right: (theme) => theme.spacing(12)
            } : {
                position: "fixed",
                bottom: (theme) => theme.spacing(3),
                right: (theme) => theme.spacing(58)
            } }
        >
            <Fab
                color="primary"
                onClick={ () => {
                    setOpenWallet(!openWallet)
                } }
            >
                <BugReportIcon />
            </Fab>
            <Modal
                open={ openWallet }
                onClose={ () => {
                    setOpenWallet(false)
                } }
            >
                <Box sx={ {
                    position: 'absolute' as 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 350,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                } }>
                    <Stack spacing={ 3 }>
                        <Typography>Closed Beta Access</Typography>
                        <FormControl fullWidth>
                            <InputLabel id="select-network">Network</InputLabel>
                            <Select
                                open={ openNetwork }
                                onClose={ () => {
                                    setOpenNetwork(false)
                                } }
                                onOpen={ () => {
                                    setOpenNetwork(true)
                                } }
                                value={ network }
                                labelId="select-network"
                                label="Network"
                                onChange={ (event: any) => {
                                    const value = event.target.value
                                    selectChain(value)
                                    setNetwork(value)
                                } }
                            >
                                <MenuItem value={ "polygon" }>Polygon Mainnet</MenuItem>
                                <MenuItem value={ "mumbai" }>Polygon Mumbai</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="@handle"
                            value={ handle }
                            onChange={ (event) => {
                                const value = event.target.value
                                setHandle(value)
                            } }
                        />
                        <Button
                            variant='contained'
                            color={ isMatch ? 'success' : 'error' }
                            onClick={ () => {
                                // TODO: edit pattern based on this: https://stackoverflow.com/questions/51848621/firestore-security-rules-regex
                                const regex1 = new RegExp(/^([a-z0-9_.]){1,15}$/)
                                // cannot have 'admin' inside (TEST)
                                const regex2 = new RegExp(/admin/)
                                // cannot have 'livethree' inside (TEST)
                                const regex3 = new RegExp(/livethree/)

                                // TODO: what's left, it must be unique - firestore search

                                const isMatch = regex1.test(handle)
                                setIsMatch(isMatch)
                                console.log("match:", isMatch)
                            } }
                        >
                            regex
                        </Button>
                        <Button
                            variant='contained'
                            onClick={ async () => {
                                const q = query(COL_REF_USERS, where("address", "==", '0x127eA49Ae9d9faca6C7E045412caFCa0e710236e'));
                                const querySnapshot = await getDocs(q)
                                if (querySnapshot.size === 1) {
                                    querySnapshot.forEach((doc) => {
                                        // setUid(doc.id)
                                        // setData(doc.data())
                                        console.log('FOUND')
                                        console.log(doc.data())
                                    });
                                } else {
                                    console.warn('no address found')
                                }
                            } }
                        >
                            test123
                        </Button>
                        {/* <Button
                            variant='contained'
                            disabled={ !firebaseUser?.uid }
                            onClick={ async () => {
                                const data = {
                                    handle: 'reltest'
                                }
                                await updateUserHandle(data)
                            } }
                        >
                            updateUserHandle
                        </Button> */}
                    </Stack>
                </Box>
            </Modal >
        </Box >
    )
}
/**
 * frontend
 * - do regex handle check
 * - at run fb cloud fn, if error: handle not available, if success, done
 * 
 * firestore new collection (security rules)
 * - only admin can read/write (call from fb cloud fn) 
 * | or only matching userId can read/write? - possible to pass value from fb cloud fn?
 * - only valid regex handle can be written
 * - only if handle available (unique handle)
 * 
 * fb clound function
 * - just to the updating work, let firestore security rules do the checking
 * - update (using batch write):
 * - 1. user details (update - so remove old (if have), add new)
 * - 2. list of handle (add)
 * - MAKE SURE IN NO CASE that list of user have handle but data dont have (and vice versa) - create/update/delete together
 */