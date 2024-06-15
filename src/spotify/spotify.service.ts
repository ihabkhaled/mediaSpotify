// src/spotify/spotify.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import Spotify from 'spotifydl-core'
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
    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'streaming',
      'app-remote-control',
      'user-read-currently-playing',
    ];
    return `https://accounts.spotify.com/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&state=${state}`;
  }

  async generateAuthTokenCallback(code: string, state: string) {
    if (!this.verifyState(state)) {
      throw new Error('Invalid state');
    }

    const url = 'https://accounts.spotify.com/api/token';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
    };
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', this.redirectUri);

    const response = await firstValueFrom(
      this.httpService.post(url, params.toString(), { headers }),
    );

    return response.data;
  }

  async generateGenericAuthWithSpotify() {
    try {
      const url = 'https://accounts.spotify.com/api/token';
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
            'base64',
          ),
      };

      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            grant_type: 'client_credentials',
          },
          { headers },
        ),
      );

      if (response.data && response.data.access_token)
        return response.data.access_token;
      return false;
    } catch (error) {
      console.error('spotifyService; generateGenericAuthWithSpotify; ', error)
      return false;
    }
  }

  async processDownloadForItem(item) {
    const spotify = new Spotify({
      clientId: this.clientId,
      clientSecret: this.clientSecret
    })

    try {
      const downloadSong = await spotify.downloadTrack(item.spotifyUrl)
      return downloadSong;
    } catch (error) {
      console.error('spotifyService; processDownloadForItem; ', error)
    }
  }

  async searchForSong(songName: string, offset: number = 0, limit: number = 10) {
    try {
      const accessToken = await this.generateGenericAuthWithSpotify();

      if (accessToken) {
        const searchUrlSpotify = `https://api.spotify.com/v1/search?q=${songName}&type=track&include_external=audio&offset=${offset}&limit=${limit}`;
        const headers = {
          Authorization: `Bearer ${accessToken}`,
        };
        const searchResponse = await firstValueFrom(
          this.httpService.get(searchUrlSpotify, {
            headers,
          }),
        );

        if (
          searchResponse.data &&
          searchResponse.data.tracks &&
          searchResponse.data.tracks.items.length > 0
        ) {
          searchResponse.data.tracks.items.map((track) => {
            delete track.album.available_markets;
            delete track.available_markets;
          });
          delete searchResponse.data.tracks.items.available_markets;
          const items = searchResponse.data.tracks.items;
          return items;
        } else {
          return 'No data found';
        }
      } else {
        return 'No access token';
      }
    } catch (error) {
      console.error('spotifyService; searchForSong; ', error)
     }
  }
}
