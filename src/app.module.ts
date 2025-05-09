import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoItemModule } from './todo-item/todo-item.module';
import { SubTaskModule } from './subtask/subtask.module';

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
      // set to true to automatically generate schema
      autoSchemaFile: true,
    }),
    TodoItemModule,
    SubTaskModule,
  ],
})
export class AppModule {}
