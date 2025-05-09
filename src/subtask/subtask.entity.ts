import { IDField, FilterableField } from '@ptc-org/nestjs-query-graphql';
import { ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
@ObjectType()
export class SubTask {
  @IDField(() => ID)
  @PrimaryColumn()
  id!: string;

  @FilterableField()
  @Column()
  name!: string;
}
