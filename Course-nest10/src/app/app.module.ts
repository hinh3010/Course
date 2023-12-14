import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';
// import { CloudinaryModule } from './cloudinary/cloudinary.module';
// import { MailModule } from './mail/mail.module';
import { CoursesModule } from './courses/courses.module';
import { CategoriesModule } from './categories/categories.module';
import { ChaptersModule } from './courses/chapters/chapters.module';
// import { AttachmentsModule } from './attachments/attachments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    // UsersModule,
    // AuthModule,
    // CloudinaryModule,
    // MailModule,
    CoursesModule,
    CategoriesModule,
    ChaptersModule,
    // AttachmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
