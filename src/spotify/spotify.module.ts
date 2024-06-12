import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyController } from './spotify.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SpotifyController],
  providers: [SpotifyService]
})
export class SpotifyModule {}
