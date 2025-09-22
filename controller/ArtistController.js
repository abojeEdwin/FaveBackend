import {verifyJWT,generateSessionToken} from "../utils/helper.js"
import Artist from "../data/models/Artist.js";
import {Ed25519Keypair} from "@mysten/sui.js/keypairs/ed25519";
// import { genAddressSeed, getZkLoginSignature } from '@mysten/sui/zklogin';
// import { SuiClient, Transaction } from '@mysten/sui.js';
// import { TransactionBlock } from '@mysten/sui.js';
import  Role from "../enum/Role.js";
import Status from "../enum/Status.js";
import SongStatus from "../enum/SongStatus.js";
import Song from "../data/models/Song.js";


export const login = async (req, res) => {
    try {
        const {idToken} = req.params;
        if (!idToken) {
            return res.status(400).json({error: "Missing idToken"});}
        const decodedToken = await verifyJWT(idToken);
        const {sub: authProviderId, email, name, picture} = decodedToken;

        let foundArtist = await Artist.findOne({ authProviderId });
        if (!foundArtist) {
            const keypair = new Ed25519Keypair();
            const suiAddress = keypair.getPublicKey().toSuiAddress();

            foundArtist = new Artist({
                authProviderId,
                providerId: authProviderId,
                provider: decodedToken.iss,
                profile: { name, email, picture },
                role: Role.ARTIST,
                distributorLink: "",
                nin: "",
                isVerified: false,
                verificationStatus: Status.PENDING,
                suiAddress,
                suiPrivateKey: keypair.getSecretKey().toString("base64"),
                createdAt: new Date(),
            });
            await foundArtist.save();
        } else {
            foundArtist.lastLogin = new Date();
            await foundArtist.save();}
        const sessionToken = generateSessionToken(foundArtist._id);
        res.json({
            success: true,
            sessionToken,
            artist: {
                id: foundArtist._id,
                suiAddress: foundArtist.suiAddress,
                profile: foundArtist.profile,
            },
        });
    }catch(error){
        console.error("zkLogin authentication error:", error);
        res.status(401).json({success: false, error: error.message});
    }
};

export const verifyArtist = async (req, res) => {
    try {
        const {artistId} = req.params;
        const {nin, distributorLink} = req.body;

        if (!nin || !distributorLink) {
            return res.status(400).json({error: "NIN and distributor link are required"});
        }
        const artist = await Artist.findById(artistId);
        if (!artist) {
            return res.status(404).json({error: "Artist not found"});}
        if (artist.verificationStatus === Status.APPROVED) {
            return res.status(400).json({error: "Artist is already verified"});}
        if (artist.verificationStatus === Status.PENDING) {
            artist.nin = nin;
            artist.distributorLink = distributorLink;
            artist.verificationStatus = Status.PENDING;
            await artist.save();

            res.json({success: true, message: "Verification submitted successfully"});
        }else{
            return res.status(400).json({error: "Artist is already verified"});}
    } catch (error) {
        console.error("Error verifying artist:", error);
        res.status(500).json({success: false, error: "Internal server error"});
    }
};


export const listSong = async (req, res) =>{
    try{
        const{artistId} = req.params;
        const{song}= req.body;

        const artist = await Artist.findById(artistId);
        if (!artist) {
            return res.status(404).json({error: "Artist not found"});
        }
        if(artist.isVerified === false){
            return res.status(400).json({error: "Artist is not verified"});
        }

        const foundSong  = await Song.findOne({title: song.songName});
        if (!foundSong) {
            const newSong = new Song({
                title: song.songName,
                releaseDate: song.releaseDate,
                royaltyPercentage: song.royaltyPercentage,
                status: SongStatus.STATUS_LOCKED,
                artist: artistId,
                description: song.description,
                genre: song.genre,
                image: song.coverArtUrl,
                audio: song.audioFileUrl,
            })
            if(newSong.royaltyPercentage < 1 || newSong.royaltyPercentage > 100){
                return res.status(400).json({error: "Percentage should not exceed 100 or less than 1 "});
            }

            await newSong.save();
            res.json({success: true, message: "Song listed successfully", songId: newSong._id});


            // const txb = new TransactionBlock();
            // txb.moveCall({
            //     target: '0xYourPackage::your_module::mint',
            //     arguments: [
            //         txb.pure(songId),
            //         txb.pure(escrowAddress),
            //         // ...other arguments as required by your Move function
            //     ],
            // });
            //
            // // 3. Set the sender (the zkLogin user address)
            // txb.setSender(zkLoginUserAddress);
            //
            //  //1. Generate ephemeral keypair (should be cached per session)
            // const ephemeralKeyPair = new Ed25519Keypair();
            //
            // // 2. Create a transaction and set the sender
            // const client = new SuiClient({ url: '<YOUR_RPC_URL>' });
            // txb.setSender(zkLoginUserAddress); // This is the address derived from zkLogin
            //
            // // 3. Sign the transaction bytes with the ephemeral keypair
            // const { bytes, signature: userSignature } = await txb.sign({
            //     client,
            //     signer: ephemeralKeyPair,
            // });
            //
            // // 4. Generate the address seed
            // const addressSeed = genAddressSeed(
            //     BigInt(userSalt), // userSalt should be a BigInt
            //     'sub',            // claimName, usually 'sub'
            //     decodedJwt.sub,   // subject from the decoded JWT
            //     decodedJwt.aud    // audience from the decoded JWT
            // ).toString();
            //
            // // 5. Generate the zkLogin signature
            // const zkLoginSignature = getZkLoginSignature({
            //     inputs: {
            //         ...partialZkLoginSignature, // This comes from your ZK proof response
            //         addressSeed,
            //     },
            //     maxEpoch,
            //     userSignature,
            // });
            //
            // // 6. Execute the transaction
            // await client.executeTransactionBlock({
            //     transactionBlock: bytes,
            //     signature: zkLoginSignature,
            // });
        }
        else{
            return res.status(400).json({error: "Song already exists, Try listing another song"});
        }
    }catch (err){
        console.error("Error listing song:", err);
        res.status(500).json({success: false, error: "Internal server error"});
    }
};

const addLiquidity = async (req, res) => {
    //This function is supposed to intreact with the smart contract to fund the wallet in the escrow
    return null;
}

export default {login, verifyArtist, listSong, addLiquidity};

