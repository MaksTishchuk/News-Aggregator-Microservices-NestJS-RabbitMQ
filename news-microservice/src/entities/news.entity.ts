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

  @Column({ default: 0 })
  views: number;

  // @OneToMany(() => ImageEntity, (image) => image.news)
  // images: ImageEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.news)
  comments: CommentEntity[];

  // @ManyToMany((type) => UserEntity, (user) => user.likesNews, {
  //   eager: true,
  //   nullable: false,
  //   onDelete: 'CASCADE',
  // })
  // @JoinTable()
  // likedByUsers: UserEntity[];
  //
  // @RelationCount((news: NewsEntity) => news.likedByUsers)
  // likesCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}