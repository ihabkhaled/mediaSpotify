import { Controller, Get, Query, Param } from '@nestjs/common';
import { SpotifyService } from './spotify.service';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('authenticate')
  authenticateSpotify() {
    const state = this.spotifyService.generateState();
    const authorizeURL = this.spotifyService.renderAuthorizeUrl(state);
    return authorizeURL;
  }

  @Get('callback')
  async fetchSpotifyToken(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    try {
      const tokens = await this.spotifyService.generateAuthTokenCallback(
        code,
        state,
      );
      return tokens;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('search/:name/:offset/:limit')
  async searchForSong(
    @Param('name') songName: string,
    @Param('offset') offset: number,
    @Param('limit') limit: number,
  ) {
    try {
      return await this.spotifyService.searchForSong(songName, offset, limit);
    } catch (error) {
      return { error: error.message };
    }
  }
}
