import { useState } from 'react';
import { db, COL_REF_USERS } from "../../services/firebase";
import { doc, updateDoc } from "firebase/firestore"

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import palette from '../../themes/palette';

import { IconEdit } from '../IconEdit';
import { StandardButton } from '../utils';

const firestoreCharacterLimit = 1000

export const About = ({ uid, dataUser, showcaseMode }: any) => {
    const [editAbout, setEditAbout] = useState<boolean>(false)
    const [newAbout, setNewAbout] = useState<string>("")
    const [saving, setSaving] = useState<boolean>(false)

    return (
        <Card variant="outlined" sx={ { width: "100%" } }>
            <CardContent sx={ { pl: 5, pr: 5 } }>
                <Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h4">About</Typography>
                        { showcaseMode ? (
                            <Box></Box>
                        ) : (
                            <IconButton
                                onClick={ () => {
                                    setNewAbout(dataUser.about)
                                    setEditAbout(true)
                                } }
                            >
                                { editAbout ? (<Box></Box>) : (<IconEdit />) }

                            </IconButton>
                        ) }

                    </Stack>
                    { editAbout ? (
                        <Box>
                            <TextField
                                disabled={ saving }
                                fullWidth
                                multiline
                                placeholder="About you"
                                value={ newAbout }
                                inputProps={ { maxLength: firestoreCharacterLimit /** based on firestore rules */ } }
                                onChange={ (event) => { setNewAbout(event.target.value) } }
                                sx={ { pb: 1 } }
                            />
                            <Stack
                                direction="row-reverse"
                            >
                                { saving ? (
                                    <CircularProgress />
                                ) : (
                                    <Stack direction="row-reverse" >
                                        <StandardButton
                                            variant="contained"
                                            color="primary"
                                            onClick={ async () => {
                                                setSaving(true)
                                                await updateDoc(doc(COL_REF_USERS, uid), {
                                                    about: newAbout
                                                })
                                                setEditAbout(false)
                                                setSaving(false)
                                            } }
                                        >
                                            save
                                        </StandardButton>
                                        <StandardButton
                                            variant="contained"
                                            color="secondary"
                                            onClick={ () => { setEditAbout(false) } }
                                        >
                                            cancel
                                        </StandardButton>
                                        <Box
                                            sx={ { m: 1 } }
                                        >
                                            <Stack
                                                alignItems="center"
                                            >
                                                <Typography>
                                                    { `${ newAbout?.length }/${ firestoreCharacterLimit } characters` }
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                ) }
                            </Stack>
                        </Box>
                    ) : (
                        <Box>
                            { !dataUser.about ? (
                                <Typography align="justify" color={ palette.grey[400] }>
                                    Enter something about you
                                </Typography>
                            ) : (
                                // Typography whiteSpace: https://stackoverflow.com/a/65385925
                                <Typography
                                    align="justify"
                                    sx={ { wordWrap: "break-word", whiteSpace: 'pre-line' } }
                                >
                                    { dataUser.about }
                                </Typography>
                            ) }

                        </Box>
                    ) }

                </Stack>
            </CardContent>
        </Card >
    )
}
