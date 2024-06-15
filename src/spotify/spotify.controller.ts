import { Controller, Get, Query, Param, Res, HttpStatus } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { Response } from 'express';

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

  @Get('search/:name/:offset?/:limit?')
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

  @Get('downloadFromSpotify')
  async downloadFromSpotify(
    @Query('spotifyUrl') spotifyUrl: string,
    @Query('name') name: string,
    @Res() res: Response
  ) {
    try {
      if (!spotifyUrl) return res.send("Please provide spotifyUrl of the track")
      if (!name) return res.send("Please provide name of the track")

      const songObj = {
        spotifyUrl,
        name
      }
      const downloadSong = await this.spotifyService.processDownloadForItem(songObj);

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="' + name + '.mp3"',
        'Content-Length': downloadSong.length,
      });

      return res.status(HttpStatus.OK).send(downloadSong);
    } catch (error) {
      console.error('spotifyController; downloadFromSpotify; ', error)
      return { error: error.message };
    }
  }
}
