import { useState, useEffect } from "react"
import { query, where, getDocs } from "firebase/firestore";
import { COL_REF_USERS } from "../services/firebase";

export const useSearchByAddressOrHandle = (value: string, isSearch: boolean, isSearchedClicked: boolean, setIsSearchedClicked: any) => {
    const [uid, setUid] = useState<string | null>(null)
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [toggled, toggle] = useState<boolean>(false)

    useEffect(() => {
        const getUserDetails = async () => {
            // TODO: is there a better way to do this than query?
            setIsLoading(true)


            let q
            if (value.charAt(0) === '@') {
                q = query(COL_REF_USERS, where("handle", "==", value.substring(1)));
            } else {
                q = query(COL_REF_USERS, where("address", "==", value));
            }

            const querySnapshot = await getDocs(q)
            console.warn('LiveThree: DB queried - search')
            if (querySnapshot.size === 1) {
                querySnapshot.forEach((doc) => {
                    setUid(doc.id)
                    setData(doc.data())
                });
            } else {
                setUid(null)
                setData(null)
            }

            setIsSearchedClicked(false)
            setIsLoading(false)
        }

        if (value && isSearch && (isSearchedClicked || toggled)) {
            getUserDetails()
        }
    }, [value, isSearch, isSearchedClicked, toggled])

    const reloadUser = () => {
        console.log("reloading user")
        toggle(state => !state)
    }

    return { uid, setUid, data, setData, isLoading, reloadUser }
}
