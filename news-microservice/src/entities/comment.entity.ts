import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import {NewsEntity} from "./news.entity";

@Entity('comments')
export class CommentEntity {

  @PrimaryGeneratedColumn({ comment: 'The comment unique identifier' })
  id: number;

  @Column({ type: 'text', nullable: false })
  text: string;

  @Column()
  authorId: number;

  @ManyToOne(() => NewsEntity, (news) => news.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  news: NewsEntity;

  @Column()
  newsId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}