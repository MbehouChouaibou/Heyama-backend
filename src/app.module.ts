import 'dotenv/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObjectsModule } from './objects/objects.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI as string,
      {
        connectionFactory: (connection) => {
          console.log('MongoDB connected');
          return connection;
        },
      },
    ),
    ObjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
