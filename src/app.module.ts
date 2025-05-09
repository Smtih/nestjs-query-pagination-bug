import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoItemModule } from './todo-item/todo-item.module';
import { SubTaskModule } from './subtask/subtask.module';
import { TagModule } from './tag/tag.module';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: 'postgres',
      username: 'postgres',
      password: 'postgres',
      port: 5433,
      host: 'localhost',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.join(process.cwd(), 'schema.temp.graphql'),
    }),
    TodoItemModule,
    SubTaskModule,
    TagModule,
  ],
})
export class AppModule {}
