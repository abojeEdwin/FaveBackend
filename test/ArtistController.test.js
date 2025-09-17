import {afterAll, beforeAll, beforeEach, expect, jest, test} from "@jest/globals";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import artistModel from "../data/models/Artist.js";
import Status from "../enum/Status.js";

jest.unstable_mockModule("../utils/helper.js", () => ({
    verifyJWT: jest.fn(),
    generateSessionToken: jest.fn(),
}));

const helper = await import("../utils/helper.js");
const { login } = await import("../controller/ArtistController.js");

const app = express();
app.use(express.json());
app.post("/login", login);

let mongo;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri, { dbName: "jest" });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
    await mongoose.connection.close();
});

beforeEach(async () => {
    for (let collection of Object.values(mongoose.connection.collections)) {
        await collection.deleteMany({});
    }
    jest.clearAllMocks();
    helper.verifyJWT.mockResolvedValue({
        sub: "provider-id-123",
        iss: "google",
        email: "abojeeomachoko@gmail.com",
        name: "Omachoko Abojee",
        picture: "https://example.com/pic.jpg",
    });
    helper.generateSessionToken.mockReturnValue("sess-123");
});

test("returns 400 when idToken missing", async () => {
    const res = await request(app).post("/login").send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing idToken" });
});

test("creates new artist when not exists", async () => {
    const artistId = new mongoose.Types.ObjectId();
    const artistDoc1 = {
        _id: artistId,
        authProviderId: "provider-id-123",
        profile: {
            email: "abojeedwin@gmail.com",
            name: "Edwin Aboje",
            picture: "https://example.com/pic.jpg",
        },
        role: "ARTIST",
        providerId: "provider-id-123",
        provider: "google",
        suiPrivateKey: "priv-key",
        suiAddress: "sui-addr",
        verificationStatus: Status.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await artistModel.collection.insertOne(artistDoc1);

    const res = await request(app).post("/login").send({ idToken: "valid-token" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sessionToken).toBe("sess-123");
    expect(res.body.artist).toHaveProperty("id");

    const artist = await artistModel.findOne({ authProviderId: "provider-id-123" });
    expect(artist).toBeTruthy();
    expect(artist.profile.email).toBe("abojeedwin@gmail.com");
});

test("logs in existing artist and updates lastLogin", async () => {
    const artistId = new mongoose.Types.ObjectId();
    const artistDoc = {
        _id: artistId,
        authProviderId: "provider-id-123",
        profile: {
            email: "abojeeomachoko@gmail.com",
            name: "Omachoko Abojee",
            picture: "https://example.com/pic.jpg",
        },
        role: "ARTIST",
        providerId: "provider-id-123",
        provider: "google",
        suiPrivateKey: "priv-key",
        suiAddress: "sui-addr",
        verificationStatus: Status.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await artistModel.collection.insertOne(artistDoc);

    const res = await request(app).post("/login").send({ idToken: "valid-token" });
    expect(res.status).toBe(200);
    expect(res.body.artist.id).toEqual(artistId.toString());

    const updated = await artistModel.findById(artistId);
    expect(updated.lastLogin).toBeTruthy();
});
