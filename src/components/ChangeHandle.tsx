import { useState } from "react";

import Stack from "@mui/material/Stack"
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';

import { StandardButton } from "./utils";

import { db, auth, COL_REF_USERS, COL_REF_HANDLES } from '../services/firebase';
import { getDoc, doc, writeBatch } from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useSnackbar } from 'notistack';

export const ChangeHandle = () => {
    const [firebaseUser] = useAuthState(auth);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [isValidRegex, setIsValidRegex] = useState<boolean>(false)
    const [isWordAdmin, setIsWordAdmin] = useState<boolean>(false)
    const [isWordLivethree, setIsWordLivethree] = useState<boolean>(false)
    const [isWordLive3, setIsWordLive3] = useState<boolean>(false)

    const [handle, setHandle] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const action = (snackbarId: any) => (
        <>
            <Button onClick={ () => { closeSnackbar(snackbarId) } } sx={ { color: "black" } }>
                Dismiss
            </Button>
        </>
    );

    return (
        <Card
            variant="outlined"
            sx={ { width: "100%" } }
        >
            <CardHeader
                title="Change handle"
                sx={ {
                    "&:last-child": {
                        paddingLeft: 24
                    }
                } }
            />
            <CardContent>
                <Stack
                    spacing={ 1 }
                >
                    <TextField
                        fullWidth
                        type='text'
                        label="Your LiveThree handle"
                        value={ handle }
                        InputProps={ {
                            startAdornment: <InputAdornment position="start">@</InputAdornment>,
                        } }
                        onChange={ (event) => {
                            const regex1 = new RegExp(/^([a-z0-9_]){2,15}$/)
                            const regex2 = new RegExp(/admin/)
                            const regex3 = new RegExp(/livethree/)
                            const regex4 = new RegExp(/live3/)

                            // const regex4 = new RegExp(/live_three/)
                            // const regex5 = new RegExp(/live__three/)
                            // const regex6 = new RegExp(/live___three/)
                            // const regex7 = new RegExp(/live____three/)
                            // const regex8 = new RegExp(/live_____three/)
                            // const regex9 = new RegExp(/live______three/)

                            // const regex3 = new RegExp(/live_threeweb/)
                            // const regex3 = new RegExp(/live__threeweb/)
                            // const regex3 = new RegExp(/live___threeweb/)
                            // const regex3 = new RegExp(/livethree_web/)
                            // const regex3 = new RegExp(/livethree__web/)
                            // const regex3 = new RegExp(/livethree___web/)
                            // const regex3 = new RegExp(/live_three_web/)
                            // const regex3 = new RegExp(/live3/)

                            const value = event.target.value
                            setIsValidRegex(regex1.test(value))
                            setIsWordAdmin(regex2.test(value))
                            setIsWordLivethree(regex3.test(value))
                            setIsWordLive3(regex4.test(value))

                            setHandle(value)
                        } }
                        error={ (handle !== "" && !isValidRegex) || isWordAdmin || isWordLivethree || isWordLive3 }
                        helperText={
                            (handle !== "" && !isValidRegex) && "Must be between 2 to 15 characters and only lowercase, numbers and underscore"
                            || isWordAdmin && `Handle cannot contain "admin"`
                            || isWordLivethree && `Handle cannot contain "livethree"`
                            || isWordLive3 && `Handle cannot contain "live3"`
                        }
                        disabled={ isSubmitting }
                    />

                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                    >
                        <StandardButton
                            variant="contained"
                            disabled={ isSubmitting || !isValidRegex || isWordAdmin || isWordLivethree || isWordLive3 || !firebaseUser?.uid || !db || !handle || handle === "" }
                            onClick={ async () => {
                                setIsSubmitting(true)

                                const batch = writeBatch(db)
                                const docRef = doc(COL_REF_USERS, firebaseUser?.uid);
                                const docSnap = await getDoc(docRef);

                                let handleOld
                                if (docSnap.exists()) {
                                    if (docSnap.data().handle) {
                                        handleOld = docSnap.data().handle
                                    }
                                } else {
                                    console.error(`Internal error (handle): no such document: ${ handleOld }`);
                                    setHandle("")
                                    setIsSubmitting(false)
                                    return
                                }

                                batch.update(docRef, {
                                    handle: handle
                                })

                                if (handleOld) {
                                    batch.delete(doc(COL_REF_HANDLES, handleOld))
                                } else {
                                    console.log('is account new handle')
                                }

                                batch.set(doc(COL_REF_HANDLES, handle), {
                                    value: firebaseUser?.uid
                                })

                                try {
                                    await batch.commit()
                                    enqueueSnackbar("Handle set", { variant: 'info', autoHideDuration: 3000, action })
                                } catch (error: any) {
                                    const ERROR_MSG = "Missing or insufficient permissions."
                                    if (error.message === ERROR_MSG) {
                                        enqueueSnackbar("LiveThree handle already exists", { variant: 'error', autoHideDuration: 3000, action })
                                    } else {
                                        console.error(error.message)
                                    }

                                } finally {
                                    setHandle("")
                                    setIsSubmitting(false)
                                }
                            } }
                        >
                            set
                        </StandardButton >
                    </Stack>
                </Stack>
            </CardContent>
        </Card >
    )
}
/**
 * TODO: to delete handle:
 * 
 * const batch = writeBatch(db)

    const docRef = doc(COL_REF_USERS, firebaseUser?.uid);
    const docSnap = await getDoc(docRef);
    let oldHandle
    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        if (docSnap.data().handle) {
            oldHandle = docSnap.data().handle
        }
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        return
    }

    console.log("OLD HANDLE:", oldHandle)
    if (oldHandle) {

        batch.update(docRef, { handle: deleteField() })

        const oldHandleRef = doc(COL_REF_HANDLES, oldHandle)
        batch.delete(oldHandleRef)

        await batch.commit()
        console.warn('DELETE RAN 1')
    } else {
        console.warn('delete not ran 1')
    }
 */