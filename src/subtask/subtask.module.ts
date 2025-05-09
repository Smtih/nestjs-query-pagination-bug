import { Module } from '@nestjs/common';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { SubTask } from './subtask.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([SubTask])],
      resolvers: [
        {
          DTOClass: SubTask,
          EntityClass: SubTask,
        },
      ],
    }),
  ],
})
export class SubTaskModule {}
