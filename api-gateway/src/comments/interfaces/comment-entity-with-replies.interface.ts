import {ICommentEntity} from "./comment-entity.interface";

export interface ICommentEntityWithReplies extends ICommentEntity {
  replies: ICommentEntity[]
}
