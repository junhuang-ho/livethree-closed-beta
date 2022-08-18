import { useState } from 'react';
import { COL_REF_USERS } from "../../services/firebase";
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

export const Description = ({ uid, dataUser, showcaseMode }: any) => {
    const [editDescription, setEditDescription] = useState<boolean>(false)
    const [newDescription, setNewDescription] = useState<string>("")
    const [saving, setSaving] = useState<boolean>(false)

    return (
        <Card variant="outlined" sx={ { width: "100%" } }>
            <CardContent sx={ { pl: 5, pr: 5 } }>
                <Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h4">What to expect</Typography>
                        { showcaseMode ? (
                            <Box></Box>
                        ) : (
                            <IconButton
                                onClick={ () => {
                                    setNewDescription(dataUser.description)
                                    setEditDescription(true)
                                } }
                            >
                                { editDescription ? (<Box></Box>) : (<IconEdit />) }

                            </IconButton>
                        ) }

                    </Stack>
                    { editDescription ? (
                        <Box>
                            <TextField
                                disabled={ saving }
                                fullWidth
                                multiline
                                placeholder="Description you"
                                value={ newDescription }
                                inputProps={ { maxLength: firestoreCharacterLimit /** based on firestore rules */ } }
                                onChange={ (event) => { setNewDescription(event.target.value) } }
                                sx={ { pb: 1 } }
                            />
                            <Stack
                                direction="row-reverse"
                            >
                                { saving ? (
                                    <CircularProgress />
                                ) : (
                                    <Stack direction="row-reverse">
                                        <StandardButton
                                            variant="contained"
                                            color="primary"
                                            onClick={ async () => {
                                                setSaving(true)
                                                await updateDoc(doc(COL_REF_USERS, uid), {
                                                    description: newDescription
                                                })
                                                setEditDescription(false)
                                                setSaving(false)
                                            } }
                                        >
                                            save
                                        </StandardButton>
                                        <StandardButton
                                            variant="contained"
                                            color="secondary"
                                            onClick={ () => { setEditDescription(false) } }
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
                                                    { `${ newDescription?.length }/${ firestoreCharacterLimit } characters` }
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                ) }
                            </Stack>
                        </Box>
                    ) : (
                        <Box>
                            { !dataUser.description ? (
                                <Typography align="justify" color={ palette.grey[400] }>
                                    Enter something about you
                                </Typography>
                            ) : (
                                // Typography whiteSpace: https://stackoverflow.com/a/65385925
                                <Typography
                                    align="justify"
                                    sx={ { wordWrap: "break-word", whiteSpace: 'pre-line' } }
                                >
                                    { dataUser.description }
                                </Typography>
                            ) }

                        </Box>
                    ) }

                </Stack>
            </CardContent>
        </Card>
    )
}
