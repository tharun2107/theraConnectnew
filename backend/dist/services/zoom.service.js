"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSdkKey = void 0;
exports.createRealMeeting = createRealMeeting;
exports.generateMeetingSdkSignature = generateMeetingSdkSignature;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_API_KEY = process.env.ZOOM_API_KEY;
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET;
const ZOOM_SDK_KEY = process.env.ZOOM_SDK_KEY;
const ZOOM_SDK_SECRET = process.env.ZOOM_SDK_SECRET;
function assertEnv() {
    if (!ZOOM_ACCOUNT_ID || !ZOOM_API_KEY || !ZOOM_API_SECRET || !ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) {
        throw new Error('Missing Zoom credentials in environment');
    }
}
function createRealMeeting(params) {
    return __awaiter(this, void 0, void 0, function* () {
        assertEnv();
        // Server-to-Server OAuth access token
        const tokenResp = yield axios_1.default.post('https://zoom.us/oauth/token', new URLSearchParams({ grant_type: 'account_credentials', account_id: ZOOM_ACCOUNT_ID }).toString(), {
            headers: {
                Authorization: 'Basic ' + Buffer.from(`${ZOOM_API_KEY}:${ZOOM_API_SECRET}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const accessToken = tokenResp.data.access_token;
        // Create a meeting for the account owner (me)
        const meetingResp = yield axios_1.default.post('https://api.zoom.us/v2/users/me/meetings', {
            topic: params.topic,
            type: 2, // scheduled
            start_time: params.startTimeIso,
            duration: params.durationMinutes,
            settings: {
                host_video: true,
                participant_video: true,
                waiting_room: true,
                join_before_host: false,
                approval_type: 2,
            },
        }, { headers: { Authorization: `Bearer ${accessToken}` } });
        const { id, password, join_url, start_url } = meetingResp.data;
        return { meetingId: String(id), password, joinUrl: join_url, startUrl: start_url };
    });
}
function generateMeetingSdkSignature(meetingNumber, role) {
    assertEnv();
    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 60 * 2;
    const payload = {
        appKey: ZOOM_SDK_KEY,
        sdkKey: ZOOM_SDK_KEY,
        mn: meetingNumber,
        role,
        iat,
        exp,
        tokenExp: exp,
    };
    const signature = jsonwebtoken_1.default.sign(payload, ZOOM_SDK_SECRET, { algorithm: 'HS256' });
    return signature;
}
const getSdkKey = () => {
    assertEnv();
    return ZOOM_SDK_KEY;
};
exports.getSdkKey = getSdkKey;
