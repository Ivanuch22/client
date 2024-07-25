export interface IComentReaction {
    comment: any;
    commentData: IComentData;
    reactions: IReaction[];
    globalUserIp: string | null;
}

export interface IComentData {
    comentID: number;
    userIp: string;
    pageUrl: string
}
export interface IReaction {
    action: string;
    comment_id: number;
    ip_address: string;
    real_user_name: string|null;
    user_image: string|null;
    user_email?: string|null;
    page_id?: number|null;
    id?: number;
    page_url?: string|null;
    updatedAt?: string|null;
    createdAt?: string;
}