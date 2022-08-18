import Avatar from "@mui/material/Avatar";

export const ProfilePicture = ({ image, width = 88, height = 88 }: any) => {
    return (
        <Avatar
            src={ image }
            // alt={data.firstName + " " + data.lastName}
            sx={ {
                mb: 1,
                width: width,
                height: height,
                border: 2,
                borderColor: 'primary.main',
            } }
        />
    )
}
