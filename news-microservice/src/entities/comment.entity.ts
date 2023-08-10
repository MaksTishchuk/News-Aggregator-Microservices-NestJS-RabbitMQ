import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index, RelationCount,
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

  @OneToMany(() => CommentEntity, comment => comment.replyTo)
  replies: CommentEntity[]

  @RelationCount((comment: CommentEntity) => comment.replies)
  repliesCount: number

  @ManyToOne(type => CommentEntity)
  @JoinColumn({name: 'parentCommentId'})
  replyTo?: CommentEntity | null;

  @Column({nullable: true})
  @Index()
  parentCommentId: number | null;

  @Column({nullable: true})
  replyToUserId: number | null;

  @Column({nullable: true})
  replyToUserUsername: string | null;

  @Column({nullable: true})
  replyToUserFirstName: string | null;

  @Column({default: false})
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}