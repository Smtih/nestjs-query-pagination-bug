import { IDField, FilterableField } from '@ptc-org/nestjs-query-graphql';
import { ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
@ObjectType()
export class TodoItem {
  @IDField(() => ID)
  @PrimaryColumn()
  id!: string;

  @FilterableField()
  @Column()
  title!: string;
}
