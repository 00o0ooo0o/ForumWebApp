import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Comments = ({ post_id, comment_id }) => {
    const { username, isAuthenticated } = useContext(AuthContext);
    const [rootComment, setRootComment] = useState(null);
    const [newCommentContent, setNewCommentСontent] = useState('');
    const [newReplyContent, setNewReplyContent] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [isCommentEditing, setIsCommentEditing] = useState(null);
    const [repliesPagination, setRepliesPagination] = useState({});
    const [editingComment, setEditingComment] = useState(null);
    const [repliesOpen, setRepliesOpen] = useState({});
    const MAX_NESTED_REPLIES = 7;

    useEffect(() => {
        const fetchComments = async () => {
            try {
                if (comment_id) {
                    //request from PaginatedReplyPage -> 
                    const res = await axios.get(`http://localhost:8000/api/posts/${post_id}/comments/${comment_id}/`, { withCredentials: true });

                    const root = res.data.root_comment;
                    root.replies = res.data.replies; 
                    setRootComment(root);
                } else if (post_id) {
                    //request from PostPage -> 
                    const res = await axios.get(`http://localhost:8000/api/posts/${post_id}/`, { withCredentials: true });

                    setRootComment({
                        id: null,
                        replies: Array.isArray(res.data.comments?.replies) ? res.data.comments.replies : res.data.comments || []
                    });
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchComments();
    }, [post_id, comment_id, isAuthenticated]);


    const handleAddComment = async (e, parentId = null) => {
        e.preventDefault();
        const content = parentId ? newReplyContent : newCommentContent;
        if (!content.trim()) return;
        try {
            const res = await axios.post(
                `/dashboard/posts/${post_id}/comments/`,
                { content, parent_id: parentId },
                { withCredentials: true }
            );

            const newComment = res.data;

            setRootComment(prev => {
                const insert = (comment) => {
                    if (parentId === null && comment.id === null) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newComment]
                        };
                    }
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newComment]
                        };
                    }
                    if (!comment.replies) return comment;
                    return {
                        ...comment,
                        replies: comment.replies.map(r => insert(r)) 
                    };
                };
                return insert(prev);
            });

            if (parentId) {
                setNewReplyContent('');
                setReplyTo(null);
                setRepliesOpen(prev => ({ ...prev, [parentId]: true }));
            } else {
                setNewCommentСontent('');
            }
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };



    
    const handleDeleteComment = async (comment_id) => {
        try {
            await axios.delete(`/dashboard/comments/${comment_id}/delete/`, { withCredentials: true });

            const removeFromTree = (comment) => {
                if (!comment.replies) return comment;
                const newReplies = comment.replies
                    .filter(r => r.id !== comment_id)
                    .map(r => removeFromTree(r));
                return { ...comment, replies: newReplies };
            };

            setRootComment(prev => {
                if (!prev) return prev;
                if (prev.id === comment_id) return null;
                return removeFromTree(prev);
            });
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };


    const handleEditComment = async (e) => {
        e.preventDefault();
        if (!editingComment) return;
        try {
            const res = await axios.patch(
                `/dashboard/comments/${editingComment.id}/edit/`,
                { content: newCommentContent },
                { withCredentials: true }
            );

            const updateTree = (comment) => {
                if (comment.id === editingComment.id) {
                    comment.content = res.data.content;
                } else if (comment.replies) {
                    comment.replies.forEach(updateTree);
                }
            };

            setRootComment(prev => {
                if (!prev) return prev;
                updateTree(prev);
                return { ...prev };
            });

            setEditingComment(null);
            setNewCommentСontent('');
            setIsCommentEditing(false);
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };


    const fetchMoreReplies = async (commentId) => {
        try {
            const pagination = repliesPagination[commentId] || { limit: 5, offset: 0, hasMore: true };

            if (!pagination.hasMore) return;

            const res = await axios.get(`/api/posts/${post_id}/comments/${commentId}/?limit=${pagination.limit}&offset=${pagination.offset}`);

            const newReplies = res.data.replies ?? [];

            const insertReplies = (comment) => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: [
                            ...(comment.replies || []),
                            ...newReplies
                        ]
                    };
                }

                if (!comment.replies) return comment;

                return {
                    ...comment,
                    replies: comment.replies.map(r => insertReplies(r))  
                };
            };

            setRootComment(prev => insertReplies(prev));

            setRepliesPagination(prev => ({
                ...prev,
                [commentId]: {
                    ...pagination,
                    offset: pagination.offset + pagination.limit,
                    hasMore: res.data.has_more
                }
            }));

        } catch (err) {
            console.error(err);
        }
    };



    const handleToggleReplies = async (comment) => {
        const isOpen = repliesOpen[comment.id];

        if (!isOpen && comment.descendants_count > 0 && (!comment.replies || comment.replies.length === 0)) {
            await fetchMoreReplies(comment.id);
        }

        setRepliesOpen(prev => ({
            ...prev,
            [comment.id]: !isOpen
        }));
    };



    const renderComment = (comment, level = 0) => {
        const hasReplies = comment.descendants_count > 0;
        const isOpen = repliesOpen[comment.id];

        return (
            <div key={comment.id} style={{ paddingLeft: `${level * 20}px` }}>
                <div>
                    <strong>{comment.author}</strong>: {comment.content}
                    
                    {level < MAX_NESTED_REPLIES && hasReplies && (
                        <button onClick={() => handleToggleReplies(comment)}>
                            {isOpen ? 'Less' : 'More'}
                        </button>
                    )}
                </div>


                {isAuthenticated && (
                    <div style={{display: 'flex'}}>
                        {username === comment.author && (
                            <>
                                <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                                <button onClick={() => {
                                    setNewCommentСontent(comment.content);
                                    setIsCommentEditing(true);
                                    setEditingComment({id: comment.id});
                                }}>Edit</button>
                            </>
                        )}
                        <button onClick={() => setReplyTo(comment.id)}>Reply</button>
                    </div>
                )}

                <div>
                    <span>{comment.descendants_count} repl{comment.descendants_count === 1 ? 'y' : 'ies'}</span>
                </div>

                
                {isOpen && comment.replies?.map(r => renderComment(r, level + 1))}

                {replyTo === comment.id && isAuthenticated && (
                    <form onSubmit={(e) => handleAddComment(e, comment.id)}>
                        <textarea
                            value={newReplyContent}
                            onChange={e => setNewReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                        />
                        <button type="submit">Send</button>
                        <button type="button" onClick={() => setReplyTo(null)}>Cancel</button>
                    </form>
                )}

                {level >= MAX_NESTED_REPLIES && hasReplies && (
                    <Link to={`/posts/${post_id}/comments/${comment.id}`}>
                        View {comment.descendants_count} more repl{comment.descendants_count === 1 ? 'y' : 'ies'}...
                    </Link>
                )}
            </div>
        );
    };



    return (
        <div>
            {!isCommentEditing ? (
                post_id ? (
                    <div>
                        {rootComment?.replies?.map(c => renderComment(c))}

        
                        {isAuthenticated? (
                            <form onSubmit={handleAddComment}>
                                <div>
                                    <label>Content:</label>
                                    <textarea
                                        value={newCommentContent}
                                        onChange={(e) => setNewCommentСontent(e.target.value)}
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
                        value={newCommentContent}
                        onChange={(e) => setNewCommentСontent(e.target.value)}
                        placeholder="Edit comment content"/>
                    </div>

                    <button type="submit">Submit</button>
                    <button type="button" onClick={() => setIsCommentEditing(false)}>Cancel</button>
                </form>
            )}
        </div>
    );
};

export { Comments };