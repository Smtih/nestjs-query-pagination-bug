import {
  IDField,
  FilterableField,
  FilterableRelation,
  QueryOptions,
} from '@ptc-org/nestjs-query-graphql';
import { ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TodoItem } from '../todo-item/todo-item.entity';

@Entity()
@ObjectType()
@FilterableRelation('todoItem', () => TodoItem)
@QueryOptions({ filterDepth: Number.POSITIVE_INFINITY })
export class SubTask {
  @IDField(() => ID)
  @PrimaryColumn()
  id!: string;

  @FilterableField()
  @Column()
  title!: string;

  @FilterableField()
  @Column()
  todoItemId!: string;

  @ManyToOne(() => TodoItem, (todoItem) => todoItem.subTasks)
  @JoinColumn({ name: 'todoItemId' })
  todoItem!: TodoItem;
}
