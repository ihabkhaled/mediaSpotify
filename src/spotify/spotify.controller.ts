import { Controller, Get, Query } from '@nestjs/common';
import { SpotifyService } from './spotify.service';

@Controller('spotify')
export class SpotifyController {
    constructor(private readonly spotifyService: SpotifyService) { }

    @Get('authenticate')
    authenticateSpotify() {
        const state = this.spotifyService.generateState();
        const authorizeURL = this.spotifyService.renderAuthorizeUrl(state);
        return authorizeURL;
    }

    @Get('callback')
    async fetchSpotifyToken(@Query('code') code: string, @Query('state') state: string) {
        try {
            const tokens = await this.spotifyService.generateAuthTokenCallback(code, state);
            return tokens;
        } catch (error) {
            return { error: error.message };
        }
    }
}