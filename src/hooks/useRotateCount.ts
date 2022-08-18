import { useState } from 'react'

export const useRotateCount = (totalPositions: number, initialPosition: number = 0) => {
    const [count, setCount] = useState<number>(initialPosition)
    const [position, setPosition] = useState<number>(initialPosition)

    const next = () => {
        const currentCount = count + 1
        setPosition(currentCount % totalPositions)
        setCount(currentCount)
    }


    return { position, next }
}
