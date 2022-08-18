import { useState, useCallback } from 'react';
import { useToggle } from 'react-use';
import { useFormik, Form, FormikProvider } from 'formik'; // TODO: try react-hook-form
import * as Yup from 'yup';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';
import { doc, setDoc } from "@firebase/firestore"

import { auth, COL_REF_USERS, analytics } from "../services/firebase";
import { logEvent } from 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useWeb3Auth } from '../contexts/Web3Auth';
import { uploadImage, getCroppedImg } from "../utils"

import Cropper from 'react-easy-crop'
import imageCompression from 'browser-image-compression';

import { browserSessionPersistence } from 'firebase/auth';

const Input = styled('input')({
    display: 'none',
});

export const SignUpForm = ({ createUserWithEmailAndPassword, isSigningUp, setIsSigningUp, setIsSubmitting }: any) => {

    const [firebaseUser] = useAuthState(auth);
    const { user: web3authUser, address: localAddress } = useWeb3Auth()

    const [showPassword, setShowPassword] = useToggle(false);
    const [image, setImage] = useState("")

    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [croppedImage, setCroppedImage] = useState<any>(null)
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false)

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    // TODO: use-react-form || react-hook-form-mui https://github.com/dohomi/react-hook-form-mui || react-use 's useStateValidator
    const RegisterSchema = Yup.object().shape({
        firstName: Yup.string().min(2, 'Too Short!').max(30, 'Too Long!').required('First name required'),
        lastName: Yup.string().min(2, 'Too Short!').max(30, 'Too Long!').required('Last name required'),
        email: Yup.string().email('Must be a valid email address').required('Email is required'),
        password: Yup.string().required('Password is required').matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
            "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
        ),
        passwordConfirm: Yup.string().required('Confirm password is required').when("password", {
            is: (val: any) => (val && val.length > 0 ? true : false),
            then: Yup.string().oneOf(
                [Yup.ref("password")],
                "Password not match"
            )
        }),
        // displayName: Yup.string().required('Username is required'),
    });

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            passwordConfirm: '',
            displayName: '',
            // profilePictureURL: '',
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true)

            if (!isSigningUp) {
                try {

                    await auth.setPersistence(browserSessionPersistence)
                    await createUserWithEmailAndPassword(values.email, values.password)
                    setIsSigningUp(true)
                    logEvent(analytics, "sign_up_started", { method: "Email/Password" })
                } catch (error) {
                    console.error(error)
                    alert("user registration error!")
                }
            }

            if (isSigningUp) {
                let profilePictureURL_
                try {
                    const croppedImage: any = await getCroppedImg(
                        image,
                        croppedAreaPixels,
                    )
                    setCroppedImage(croppedImage)

                    const { profilePictureURL } = await uploadImage(
                        croppedImage,
                        `images/${ firebaseUser?.uid }`,
                        "profilePicture"
                    )
                    profilePictureURL_ = profilePictureURL
                } catch (error) {
                    console.error(error)
                }

                let theDisplayName = values.displayName
                if (!values.displayName || values.displayName === "") {
                    theDisplayName = localAddress
                    logEvent(analytics, "sign_up_empty_display_name")
                }

                let theProfilePic = profilePictureURL_
                if (!profilePictureURL_) {
                    theProfilePic = ""
                    logEvent(analytics, "sign_up_empty_pic")
                }

                if (firebaseUser && localAddress) {
                    await setDoc(doc(COL_REF_USERS, firebaseUser?.uid), {
                        address: localAddress,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        displayName: theDisplayName,
                        photoURL: theProfilePic,
                        about: "",
                        description: "",
                        headline: "", // note: require to set empty for firestore rules
                        favourites: [],
                        online: false,
                        isActive: false,
                    })
                    logEvent(analytics, "sign_up_complete")
                }

                setIsSigningUp(false)
            }
        },
    });

    const { errors, touched, handleSubmit, isSubmitting: isFormikSumbitting, getFieldProps } = formik;

    return (
        <FormikProvider value={ formik }>
            <Form
                autoComplete="off"
                noValidate
                onSubmit={ (e) => {
                    e.preventDefault()
                    handleSubmit()
                } }
            >
                <Stack spacing={ 3 }>
                    { (!isSigningUp || !web3authUser) && (
                        <Box>
                            <Stack spacing={ 3 }>
                                <Stack direction={ { xs: 'column', sm: 'row' } } spacing={ 2 }>
                                    <TextField
                                        fullWidth
                                        label="First name"
                                        { ...getFieldProps('firstName') }
                                        error={ Boolean(touched.firstName && errors.firstName) }
                                        helperText={ touched.firstName && errors.firstName }
                                        disabled={ (isFormikSumbitting || !!isSigningUp || !!web3authUser) }
                                    />

                                    <TextField
                                        fullWidth
                                        label="Last name"
                                        { ...getFieldProps('lastName') }
                                        error={ Boolean(touched.lastName && errors.lastName) }
                                        helperText={ touched.lastName && errors.lastName }
                                        disabled={ (isFormikSumbitting || !!isSigningUp || !!web3authUser) }
                                    />
                                </Stack>

                                <TextField
                                    fullWidth
                                    autoComplete="username"
                                    type="email"
                                    label="Email address"
                                    { ...getFieldProps('email') }
                                    error={ Boolean(touched.email && errors.email) }
                                    helperText={ touched.email && errors.email }
                                    disabled={ (isFormikSumbitting || !!isSigningUp || !!web3authUser) }
                                />

                                <TextField
                                    fullWidth
                                    type={ showPassword ? 'text' : 'password' }
                                    label="Password"
                                    { ...getFieldProps('password') }
                                    InputProps={ {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" onClick={ setShowPassword }>
                                                    { showPassword ? <VisibilityIcon /> : <VisibilityOffIcon /> }
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    } }
                                    error={ Boolean(touched.password && errors.password) }
                                    helperText={ touched.password && errors.password }
                                    disabled={ (isFormikSumbitting || !!isSigningUp || !!web3authUser) }
                                />

                                <TextField
                                    fullWidth
                                    type={ showPassword ? 'text' : 'password' }
                                    label="Confirm password"
                                    { ...getFieldProps('passwordConfirm') }
                                    InputProps={ {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton edge="end" onClick={ setShowPassword }>
                                                    { showPassword ? <VisibilityIcon /> : <VisibilityOffIcon /> }
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    } }
                                    error={ Boolean(touched.passwordConfirm && errors.passwordConfirm) }
                                    helperText={ touched.passwordConfirm && errors.passwordConfirm }
                                    disabled={ (isFormikSumbitting || !!isSigningUp || !!web3authUser) }
                                />
                                <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={ isFormikSumbitting || !!isSigningUp || !!web3authUser }>
                                    Register
                                </LoadingButton>
                            </Stack>

                        </Box>
                    ) }
                    { isSigningUp && web3authUser && (
                        <Stack spacing={ 3 } justifyContent="center">
                            <TextField
                                fullWidth
                                label="Display name (will be address if left empty)"
                                { ...getFieldProps('displayName') }
                                error={ Boolean(touched.displayName && errors.displayName) }
                                helperText={ touched.displayName && errors.displayName }
                                disabled={ (isFormikSumbitting) }
                            />
                            <Box
                                sx={ { position: "relative", width: "100%", height: "50vh" } }
                            >
                                { image === "" ? (
                                    <Box
                                        // bgcolor="primary.main"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={ { width: "100%", height: "100%", border: 2, borderColor: "primary.main" } }
                                    >
                                        <Stack>
                                            <Typography>Profile picture</Typography>
                                            <Typography variant="caption">(optional)</Typography>
                                        </Stack>
                                    </Box>
                                ) : (
                                    <Box>
                                        { croppedImage ? (
                                            <Box
                                                component="img"
                                                src={ croppedImage }
                                                sx={ { width: "100%", height: "100%" } }
                                            />
                                        ) : (
                                            <Cropper
                                                image={ image }
                                                crop={ crop }
                                                zoom={ zoom }
                                                aspect={ 1 }
                                                cropShape="round"
                                                showGrid={ false }
                                                onCropChange={ setCrop }
                                                onCropComplete={ onCropComplete }
                                                onZoomChange={ setZoom }
                                            />
                                        ) }
                                    </Box>
                                ) }
                            </Box>
                            <Box>
                                <Slider
                                    min={ 1 }
                                    max={ 3 }
                                    step={ 0.1 }
                                    value={ zoom }
                                    onChange={ (e: any) => {
                                        setZoom(e.target.value)
                                    } }
                                    valueLabelDisplay="auto"
                                    disabled={ isFormikSumbitting }
                                />
                            </Box>
                            <Box>
                                <label htmlFor="contained-button-file">
                                    <Input accept="image/*" id="contained-button-file" multiple type="file"
                                        disabled={ isFormikSumbitting }
                                        onChange={ async (e: any) => {
                                            setIsUploadingImage(true)
                                            if (e.target.files instanceof FileList) {
                                                const imageFile = await e.target.files[0]
                                                // const url = URL.createObjectURL(await e.target.files[0]) // a blob type

                                                const options = {
                                                    maxSizeMB: 1,
                                                    // maxWidthOrHeight: 1920,
                                                    useWebWorker: true
                                                }
                                                try {
                                                    const compressedFile = await imageCompression(imageFile, options);
                                                    const url = URL.createObjectURL(compressedFile)
                                                    setImage(url)
                                                } catch (error) {
                                                    console.error(error)
                                                }
                                            }
                                            setIsUploadingImage(false)
                                        } }
                                    />
                                    {/* <Button variant="outlined" component="span" fullWidth size="large" disabled={ isUploadingImage || isFormikSumbitting }>
                                        Upload Photo
                                    </Button> */}
                                    <LoadingButton component="span" fullWidth size="large" variant="outlined" loading={ isUploadingImage } disabled={ isFormikSumbitting }>
                                        Upload Photo
                                    </LoadingButton>
                                </label>
                            </Box>

                            {/* <img src={ image } alt="profile picture" loading="lazy" /> */ }
                            <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={ isFormikSumbitting } >
                                Finish
                            </LoadingButton>
                        </Stack>
                    ) }
                </Stack>
            </Form>
        </FormikProvider>
    )
}
