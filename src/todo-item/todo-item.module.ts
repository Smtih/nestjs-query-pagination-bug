import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { TodoItem } from './todo-item.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItem])],
      resolvers: [
        {
          EntityClass: TodoItem,
          DTOClass: TodoItem,
          enableTotalCount: true,
        },
      ],
    }),
  ],
})
export class TodoItemModule {}
