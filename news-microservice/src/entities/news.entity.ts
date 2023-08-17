import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  RelationCount,
} from 'typeorm';
import {CommentEntity} from "./comment.entity";


@Entity('news')
export class NewsEntity {

  @PrimaryGeneratedColumn({ comment: 'The news unique identifier' })
  id: number;

  @Column()
  authorId: number;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @Column({ default: false })
  isImages: boolean;

  @Column({ default: false })
  isVideos: boolean;

  @Column({ default: 0 })
  views: number;

  @OneToMany(() => CommentEntity, (comment) => comment.news)
  comments: CommentEntity[];

  @RelationCount((news: NewsEntity) => news.comments)
  commentsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}