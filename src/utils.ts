import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from "./services/firebase";
import { doc, updateDoc } from "firebase/firestore"
import { COL_REF_USERS } from './services/firebase';

import { ethers } from 'ethers';

import axios from 'axios';

export const secondsToDHMS = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

// ------------- gas station ------------- //

export const getFeeValuesSafeLow = async () => {
    const info = await axios.get("https://gasstation-mainnet.matic.network/v2") // ref: https://docs.openzeppelin.com/defender/relay#speed

    // console.log(info.data.safeLow)
    // console.log(info.data.standard)
    // console.log(info.data.fast)
    // console.log(info.data.estimatedBaseFee)
    // console.log(info.data.blockTime)
    // console.log(info.data.blockNumber)

    const maxPriorityFeeGWei = info.data.safeLow.maxPriorityFee.toFixed(5).toString()
    const maxPriorityFeeWei = ethers.utils.parseUnits(maxPriorityFeeGWei, "gwei").toString() // gwei == 9 units

    // const maxFeeGWei = info.data.safeLow.maxFee.toFixed(4).toString()
    const maxFeeGWei = (info.data.safeLow.maxFee + 0.0001).toFixed(4).toString()
    // why 4 instead of 5 like maxPriorityFee? cause: maxFeeGWei must be > maxPriorityFeeGWei. Thus more rounding + 0.0001 ensures this
    // why dont just pass the raw values in which guarentees this? because there is a decimal overflow error in ethers
    const maxFeeWei = ethers.utils.parseUnits(maxFeeGWei, "gwei").toString() // gwei == 9 units

    return { maxPriorityFeeWei, maxFeeWei }
}

// ------- address shortener ------- //

export const shortenAddress = (address: string) => {
    return `${ address.substring(0, 6) }...${ address.substring(address.length - 4, address.length) } `
}

// ------------- image ------------- //

const createImage = (url: string) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })

function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180
}

function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation)

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
}

export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: any,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
) {
    const image: any = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return null
    }

    const rotRad = getRadianAngle(rotation)

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    )

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // draw rotated image
    ctx.drawImage(image, 0, 0)

    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    )

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0)

    // As Base64 string
    // return canvas.toDataURL('image/jpeg');

    // As a blob
    return new Promise((resolve, reject) => {
        canvas.toBlob((file: any) => {
            resolve(URL.createObjectURL(file))
        }, 'image/jpeg')
    })
}

export async function uploadImage(uri: string, path: string, fileName: string) {
    // TODO: seet upload image size limit and allow crop, ref: https://www.linkedin.com/help/linkedin/answer/a549049/photo-won-t-upload-to-your-profile?lang=en#:~:text=If%20you're%20unable%20to,x%204320%20(h)%20pixels.

    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662

    const blob: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
    });


    const fileName_ = fileName // || nanoid();
    const imageRef = ref(storage, `${ path }/${ fileName_ }.jpeg`);

    const snapshot = await uploadBytes(imageRef, blob, {
        contentType: "image/jpeg",
    });

    // blob.close();

    const profilePictureURL = await getDownloadURL(snapshot.ref);

    return { profilePictureURL, fileName_ };
}

// ------------- login ------------- //

// export const loginWeb3Auth = async (user: any, web3authLogin: any) => {
//     const jwtToken = await user.getIdToken(true)
//     if (jwtToken) {
//         await web3authLogin(WALLET_ADAPTERS.OPENLOGIN, "jwt", jwtToken)
//     } else {
//         console.error("error retrieving JWT token")
//     }
// }

export const setOnline = async (uid: any, isOnline: boolean) => {
    if (!uid) {
        return
    }
    console.warn("setting online status", isOnline)
    await updateDoc(doc(COL_REF_USERS, uid), {
        online: isOnline
    })
}

export const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ------------- flow rate converter ------------- //


export const FROM_DENOMINATOR =
    [
        'per second',
        'per minute',
        'per hour',
        'per day',
        'per week',
        'per month',
        'per year',
    ]
export const INDEX_MINUTE = 1
export const INDEX_HOUR = 2
export const MINIMUM_STREAM_AMOUNT_PER_SECOND = "0.005"
export const MINIMUM_STREAM_AMOUNT_PER_MINUTE = "0.3"
export const MINIMUM_STREAM_AMOUNT_PER_HOUR = "18"

// export const MINIMUM_STREAM_AMOUNT_PER_SECOND = "0.0005" // for mainnet testing
// export const MINIMUM_STREAM_AMOUNT_PER_MINUTE = "0.03" // for mainnet testing

const TSFSS = 1
const TSFMM = 60
const TSFHH = 60 * 60
const TSFDAY = 60 * 60 * 24
const TSFWEEK = 60 * 60 * 24 * 7
const TSFMON = 60 * 60 * 24 * 30
const TSFYEAR = 60 * 60 * 24 * 365

export const conversion: any = { // https://stackoverflow.com/a/63062830
    second: TSFSS,
    minute: TSFMM,
    hour: TSFHH,
    day: TSFDAY,
    week: TSFWEEK,
    month: TSFMON,
    year: TSFYEAR,
}

const convertToWei = (amountInEther: string) => {
    return ethers.utils.parseEther(amountInEther);
}

const convertToEther = (amountInWei: string) => {
    return ethers.utils.formatEther(amountInWei)
}

export const toPerSecondFromPerXXX = (amountInEther: string, fromPerXXX: string) => {
    const amountWei: any = convertToWei(amountInEther) // returns BigNumber
    return Math.floor(amountWei.div(conversion[fromPerXXX]))
}

export const fromPerSecondToPerXXX = (amountInWei: string, toPerXXX: string) => {
    const amountEther: any = convertToEther(amountInWei) // returns BigNumber
    return Number(amountEther) * conversion[toPerXXX]
}

/******************************************************************
 * Converts e-Notation Numbers to Plain Numbers
 ******************************************************************
 * @function eToNumber(number)
 * @version  1.00
 * @param   {e nottation Number} valid Number in exponent format.
 *          pass number as a string for very large 'e' numbers or with large fractions
 *          (none 'e' number returned as is).
 * @return  {string}  a decimal number string.
 * @author  Mohsen Alyafei
 * @date    17 Jan 2020
 * Note: No check is made for NaN or undefined input numbers.
 *
 *****************************************************************/
export const eToNumber = (num: any) => {
    let sign = "";
    // (num += "").charAt(0) == "-" && (num = num.substring(1), sign = "-");
    let arr = num.split(/[e]/ig);
    if (arr.length < 2) return sign + num;
    let dot = (.1).toLocaleString().substr(1, 1),
        n = arr[0],
        exp = +arr[1],
        w = (n = n.replace(/^0+/, '')).replace(dot, ''),
        pos = n.split(dot)[1] ? n.indexOf(dot) + exp : w.length + exp,
        L: any = pos - w.length, s = "" + BigInt(w);
    w = exp >= 0 ? (L >= 0 ? s + "0".repeat(L) : r()) : (pos <= 0 ? "0" + dot + "0".repeat(Math.abs(pos)) + s : r());
    L = w.split(dot);
    if (L[0] == 0 && L[1] == 0 || (+w == 0 && +s == 0)) w = 0; //** added 9/10/2021
    return sign + w;
    function r() { return w.replace(new RegExp(`^(.{${ pos }})(.)`), `$1${ dot }$2`) }
}

