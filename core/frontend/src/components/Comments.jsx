import React, { useEffect, useState, useContext } from 'react';;
import { AuthContext } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Comments = ({ post_id, comment_id}) => {
    const {username, isAuthenticated} = useContext(AuthContext);
    const navigate = useNavigate();
    const [comment, setComment] = useState([]);
    const [newComment, setNewComment] = useState(''); 
    const [newReply, setNewReply] = useState(''); 
    const [isCommentEditing, setIsCommentEditing] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [replies, setReplies] = useState({}); //  1: [reply1, reply2],   2: [reply1], ...
    const [repliesOpen, setRepliesOpen] = useState({});
    const [replyTo, setReplyTo] = useState(null); 
    const [repliesPagination, setRepliesPagination] = useState({});
    const [editingComment, setEditingComment] = useState(null);

    const MAX_NESTED_REPLIES = 7;

    useEffect(() => {
        const fetchComments = async () => {
            try {
                if (comment_id) {
                    const res = await axios.get(`http://localhost:8000/api/posts/${post_id}/comments/${comment_id}/`, { withCredentials: true });
                    const rootComment = res.data;
                    setComment([rootComment]);

                    if (rootComment.replies_count > 0) {
                        fetchMoreReplies(rootComment.id);
                        setRepliesOpen(prev => ({ ...prev, [rootComment.id]: true }));
                    }
                } else if (post_id) {
                    const res = await axios.get(`http://localhost:8000/api/posts/${post_id}/`, { withCredentials: true });
                    setComment(res.data.comments);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchComments();
     }, [post_id, comment_id, isAuthenticated]);



    const handleAddComment = async (e, parent_id = null) => {
        const contentToSend = parent_id ? newReply : newComment;
        e.preventDefault();
        try{
            const res = await axios.post(
                `/dashboard/posts/${post_id}/comments/`, 
                { content: contentToSend, parent_id: parent_id }, 
                { withCredentials: true }
            );
            const newCommentObj = res.data;

            if (parent_id != null){
                setRepliesOpen(prev => ({ ...prev, [parent_id]: true }));

                setReplies(prev => ({
                    ...prev,
                    [parent_id]: [...(prev[parent_id] || []), newCommentObj]
                }));
            } else {
                setComment(prev => [...prev, newCommentObj]);
            } 

            setNewReply('');
            setReplyTo(null);
            setNewComment('');

        } catch (err) { 
            console.error(err.response?.data || err);
        }
    };


    const handleDeleteComment = async (comment_id, parent_id) => {        
        try{
           await axios.delete(`/dashboard/comments/${comment_id}/delete/`, { withCredentials: true });       
            if (parent_id != null){
                const removedComment = replies[parent_id].find(r => r.id === comment_id);
                setReplies(prev => ({...prev, [parent_id]: prev[parent_id].filter(r => r.id !== comment_id)}));
                const decrement = (removedComment?.replies_count || 0) + 1;

                setComment(prev => prev.map(c => c.id === parent_id ? { ...c, replies_count: c.replies_count - decrement } : c));
            } else {
                setComment(prev => prev.filter(c => c.id !== comment_id)); 
            }                 
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };


    const handleEditComment = async (e) => {
        e.preventDefault();
        if (!editingComment) return;
        const { id, parent_id } = editingComment;
        try{
            const res = await axios.patch(`/dashboard/comments/${id}/edit/`,
            {content: commentContent }, { withCredentials: true});

            if (parent_id === null) {
                setComment(prev => prev.map(c => c.id === id ? res.data : c));
            } else {
                setReplies(prev => ({...prev, [parent_id]: (prev[parent_id] || []).map(r => r.id === id ? { ...r, content: res.data.content } : r)}));
            }
            setEditingComment(null);
            setCommentContent('');
            setIsCommentEditing(false);
        } catch (err) { 
            console.error(err.response?.data || err);
        }
    };



    const handleToggleReplies = (comment) => {
        const isOpen = repliesOpen[comment.id];
        if (!isOpen && comment.replies_count > 0 && (replies[comment.id]?.length || 0) < comment.replies_count){
            fetchMoreReplies(comment.id);
        }
        setRepliesOpen(prev => ({ ...prev, [comment.id]: !isOpen }));
    };



    const fetchMoreReplies = async (comment_id) => { 
        const pagination = repliesPagination[comment_id] || { limit: 5, offset: 0, hasMore: true };
        if (!pagination.hasMore) return;
        try {
            const res = await axios.get(
                `/api/comments/${comment_id}/replies/?limit=${pagination.limit}&offset=${pagination.offset}`
            );

            const results = res.data.results ?? [];

            setReplies(prev => {
                const existingIds = new Set(
                (prev[comment_id] || []).map(r => r.id)
                );

                const newReplies = results.filter(
                r => !existingIds.has(r.id)
                );

                return {
                ...prev,
                [comment_id]: [...(prev[comment_id] || []), ...newReplies]
                };
            });

            setRepliesPagination(prev => ({
                ...prev,
                [comment_id]: {
                ...pagination,
                offset: pagination.offset + pagination.limit,
                hasMore: res.data.has_more
                }
            }));

        } catch (err) {
            console.error(err);
        }
    };


    const renderComment = (comment, level = 0) => {
        return (
            <div key={comment.id} style={{ paddingLeft: `${level * 20}px` }}>
                <div>
                    <strong>{comment.author}</strong>: {comment.content}
                    {level < MAX_NESTED_REPLIES && (
                        <button onClick={() => handleToggleReplies(comment)}>
                            {repliesOpen[comment.id] ? 'hide' : 'open'}
                        </button>
                    )}
                </div>

                {isAuthenticated && (
                    <div style={{display: 'flex'}}>
                        {username === comment.author && (
                            <>
                                <button onClick={() => handleDeleteComment(comment.id, comment.parent_id)}>delete</button>
                                <button onClick={() => {
                                    setCommentContent(comment.content);
                                    setIsCommentEditing(true);
                                    setEditingComment({
                                        id: comment.id,
                                        parent_id: comment.parent_id
                                    });
                                }}>edit</button>
                            </>
                        )}
                        <button onClick={() => setReplyTo(comment.id)}>reply</button>
                    </div>
                )}

                <div>
                    {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
                </div>

                {level < MAX_NESTED_REPLIES && repliesOpen[comment.id] && replies[comment.id] && (
                    <>
                        {replies[comment.id].map(reply => (
                            <React.Fragment key={reply.id}>
                                {renderComment(reply, level + 1)}
                            </React.Fragment>
                        ))}

                        {repliesPagination[comment.id]?.hasMore && (
                            <button onClick={() => fetchMoreReplies(comment.id)}>more</button>
                        )}
                    </>
                )}

                {level >= MAX_NESTED_REPLIES && (comment.replies_count || 0) > 0 && (
                    <Link to={`/posts/${post_id}/comments/${comment.id}`}>
                        View {comment.replies_count} more repl{comment.replies_count === 1 ? 'y' : 'ies'}...
                    </Link>
                )}

                {replyTo === comment.id && isAuthenticated && (
                    <form onSubmit={(e) => handleAddComment(e, comment.id)}>
                        <textarea
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder="Write a reply..."
                        />
                        <button type="submit">Send</button>
                        <button type="button" onClick={() => setReplyTo(null)}>Cancel</button>
                    </form>
                )}
            </div>
        );
    };



    return (
        <div>
            {!isCommentEditing ? (
                post_id ? (
                    <div>
                        {comment.length > 0 ? (
                            comment.map(c => (
                                renderComment(c)
                            ))
                        ) : (
                            <p>No comments yet...</p>
                        )}
        
                        {isAuthenticated? (
                            <form onSubmit={handleAddComment}>
                                <div>
                                <label>Content:</label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Enter comment content"/>
                                </div>
        
                                <button type="submit">Post</button>
                            </form>
                        ) : (
                            <p>Become a member to leave a comment!</p>
                        )}

                    </div>
                ) : (
                    <p>It's empty here...</p>
                )            
            ) : (
                <form onSubmit={(e) => handleEditComment(e)}>
                    <div>
                        <label>Your comment:</label>
                        <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Edit comment content"/>
                    </div>

                    <button type="submit">Submit changes</button>
                    <button type="button" onClick={() => setIsCommentEditing(false)}>Cancel</button>
                </form>
            )}

        </div>
    );
};

export { Comments };