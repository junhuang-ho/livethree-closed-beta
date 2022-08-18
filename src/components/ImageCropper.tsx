import { useState, useCallback } from "react"

import Cropper from 'react-easy-crop'

import Box from "@material-ui/core/Box"
import Slider from '@mui/material/Slider';

// ref: https://www.npmjs.com/package/react-easy-crop

export const ImageCropper = ({ srcImage, setCroppedAreaPixels }: any) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])


    return (
        <Box
            sx={ { position: "relative", width: "100%", height: "50vh" } }
        >
            { srcImage === "" ? (
                <Box bgcolor="primary.main" display="flex"
                    alignItems="center"
                    justifyContent="center" sx={ { width: "100%", height: "100%" } }>
                    profile picture
                </Box>
            ) : (
                <Box>
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
                    />
                    <Slider
                        min={ 1 }
                        max={ 3 }
                        step={ 0.1 }
                        value={ zoom }
                        onChange={ (e: any) => {
                            setZoom(e.target.value)
                        } }
                        valueLabelDisplay="auto"
                    />
                </Box>
            ) }
        </Box>

    )
}
