// src/spotify/spotify.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config();

@Injectable()
export class SpotifyService {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;
    private stateStore: Map<string, string>;

    constructor(private readonly httpService: HttpService) {
        this.clientId = process.env.SPOTIFY_CLIENT_ID;
        this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        this.redirectUri = process.env.SPOTIFY_REDIRECT_URI;
        this.stateStore = new Map();
    }

    generateState(): string {
        const state = crypto.randomBytes(16).toString('hex');
        this.stateStore.set(state, state);
        return state;
    }

    verifyState(state: string): boolean {
        if (this.stateStore.has(state)) {
            this.stateStore.delete(state);
            return true;
        }
        return false;
    }

    renderAuthorizeUrl(state: string): string {
        const scopes = ['user-read-playback-state', 'user-modify-playback-state', 'streaming', 'app-remote-control', 'user-read-currently-playing'];
        return `https://accounts.spotify.com/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&state=${state}`;
    }

    async generateAuthTokenCallback(code: string, state: string) {
        if (!this.verifyState(state)) {
            throw new Error('Invalid state');
        }

        const url = 'https://accounts.spotify.com/api/token';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
        };
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', this.redirectUri);

        const response = await firstValueFrom(
            this.httpService.post(url, params.toString(), { headers })
        );

        return response.data;
    }
}
