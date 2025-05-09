import { Module } from '@nestjs/common';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Tag } from './tag.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([Tag])],
      resolvers: [
        {
          DTOClass: Tag,
          EntityClass: Tag,
          enableTotalCount: true,
        },
      ],
    }),
  ],
})
export class TagModule {}
