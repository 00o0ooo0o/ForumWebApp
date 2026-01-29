import React from 'react';
import { useParams } from 'react-router-dom';
import { Comments } from '../components/Comments';

const PaginatedReplyPage = () => {
    const {post_id, comment_id} = useParams();

    return (
        <Comments post_id={post_id} comment_id={comment_id}/>
    );
};


export {PaginatedReplyPage};

