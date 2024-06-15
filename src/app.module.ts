import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [SpotifyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
