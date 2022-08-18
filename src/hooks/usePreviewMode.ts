import { useState, useEffect } from 'react'

export const usePreviewMode = (addressLocal: any, addressUser: any) => {
    const [previewMode, setPreviewMode] = useState<boolean>(false)

    useEffect(() => {
        if (addressLocal && addressLocal === addressUser) {
            setPreviewMode(true)
        } else {
            setPreviewMode(false)
        }
    }, [addressLocal, addressUser])

    return [previewMode]
}
