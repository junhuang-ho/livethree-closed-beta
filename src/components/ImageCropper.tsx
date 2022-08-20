import { useState, useCallback } from "react"

import Cropper from 'react-easy-crop'

import Box from "@material-ui/core/Box"
import Stack from '@mui/material/Stack';

// ref: https://www.npmjs.com/package/react-easy-crop

export const ImageCropper = ({ srcImage, setCroppedAreaPixels, zoom, setZoom }: any) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])


    return (
        <Box>
            { srcImage === "" ? (
                <Box bgcolor="primary.main" display="flex"
                    alignItems="center"
                    justifyContent="center" sx={ { width: "100%", height: "100%" } }>
                    profile picture
                </Box>
            ) : (
                <Stack alignItems='center' sx={ { height: '80vh', position: "relative" } }>
                    <Cropper
                        image={ srcImage }
                        crop={ crop }
                        zoom={ zoom }
                        aspect={ 1 }
                        cropShape="round"
                        showGrid={ false }
                        onCropChange={ setCrop }
                        onCropComplete={ onCropComplete }
                        onZoomChange={ setZoom }
                        objectFit="auto-cover"
                    />
                </Stack>
            )
            }
        </Box>

    )
}
