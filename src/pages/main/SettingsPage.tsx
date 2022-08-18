import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack"

import { FlowRate } from "../../components/FlowRate";
import { WrapToken } from "../../components/WrapToken";
import { Permissions } from "../../components/Permissions";
import { BuyToken } from "../../components/BuyToken";
import { SendToken } from "../../components/SendToken";
import { DeleteFlow } from "../../components/DeleteFlow";
import { Support } from "../../components/Support";
import { Ringtone } from "../../components/Ringtone";
import { ChangeHandle } from "../../components/ChangeHandle";
import { ChangePassword } from "../../components/ChangePassword";
import { Logout } from "../../components/Logout";

const SettingsPage = () => {
    // useEffect(() => {  // doesn't really work as WalletDisplay component not in focus?
    //     refreshNativeBalance()
    //     refreshSFStates()
    //     console.log("refresh states")
    // }, [])

    return (
        <Stack alignItems="center">
            <Box sx={ { p: 2, width: "98%", maxWidth: 1000 } }>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    spacing={ 1 }
                >
                    <FlowRate />
                    <WrapToken />
                    <Permissions />
                    <BuyToken />
                    <SendToken />
                    <DeleteFlow />
                    <Support />
                    <Ringtone />
                    <ChangeHandle />
                    <ChangePassword />
                    <Logout />
                    {/* <Feedback /> */ }
                    <Box sx={ { p: 5 } }></Box>
                </Stack>
            </Box>
        </Stack>
    )
}

export default SettingsPage