import {
  IDField,
  FilterableField,
  FilterableCursorConnection,
} from '@ptc-org/nestjs-query-graphql';
import { ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { SubTask } from '../subtask/subtask.entity';
import { Tag } from '../tag/tag.entity';

@Entity()
@ObjectType()
@FilterableCursorConnection('subTasks', () => SubTask)
@FilterableCursorConnection('tags', () => Tag)
export class TodoItem {
  @IDField(() => ID)
  @PrimaryColumn()
  id!: string;

  @FilterableField()
  @Column()
  title!: string;

  @OneToMany(() => SubTask, (subTask) => subTask.todoItem)
  subTasks!: SubTask[];

  @OneToMany(() => Tag, (tag) => tag.todoItem)
  tags!: Tag[];
}
