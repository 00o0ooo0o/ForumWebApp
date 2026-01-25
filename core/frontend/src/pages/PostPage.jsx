import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostPage = () => {
    const {username, isAuthenticated} = useContext(AuthContext);
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comment, setComment] = useState([]);
    const [newComment, setNewComment] = useState(''); 
    const [newReply, setNewReply] = useState(''); 
    const {post_id} = useParams();
    const [title, setTitle] = useState('');
    const [isPostEditing, setIsPostEditing] = useState(false);
    const [isCommentEditing, setIsCommentEditing] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [postContent, setPostContent] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [liked, setLiked] = useState(false);
    const [replies, setReplies] = useState({})
    const [repliesOpen, setRepliesOpen] = useState({});
    const [replyTo, setReplyTo] = useState(null); 
    const [replyContent, setReplyContent] = useState('');
    const [repliesPagination, setRepliesPagination] = useState({});



    useEffect(() => {
        const getPost = async () => { 
            try {
                const res = await axios.get(`http://localhost:8000/api/posts/${post_id}/`, { withCredentials: true });
                setPost(res.data.post);         
                setComment(res.data.comments);
                setLiked(res.data.post.liked);   
            } catch (err) {
                console.error(err.response?.data || err);
            }
        };
        setIsPostEditing(false);
        setIsCommentEditing(false);
        setTitle('');
        setPostContent('');

        getPost();
    }, [post_id, isAuthenticated, navigate]);



//POST FUNCTIONS

    const handleDeletePost = async (e) => {
        e.preventDefault();
        try {
            await axios.delete(`http://localhost:8000/api/posts/${post_id}/delete/`,
                { withCredentials: true });
            navigate('/member/'); 
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };


    const handleEditPost = async (e) => {
        e.preventDefault();
        try{
            const res = await axios.patch(`http://localhost:8000/api/posts/${post_id}/edit/`,
            {title, content: postContent}, { withCredentials: true});

            setPost(res.data.post);         
            setIsPostEditing(false);

            navigate(`/posts/${post_id}/`); 

        } catch (err) {
            console.error(err.response?.data || err);
        }
    };


    const handleLikePost = async(e) => {
        e.preventDefault();
        try{
            const res = await axios.patch(`http://localhost:8000/api/posts/${post_id}/edit/`,
            {like: true}, { withCredentials: true});

            setLiked(res.data.liked);
            setPost(prev => ({ ...prev, likes_n: res.data.likes_count }));
            //new post object with previous field values besides line_n

            console.log("Liked");
        
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };



//COMMENT FUNCTIONS

    const handleAddComment = async (e) => {
        e.preventDefault();
        try{
            const res = await axios.post(
                `/dashboard/posts/${post_id}/comments/`, 
                { content: newComment }, 
                { withCredentials: true }
            );

            console.log('Comment created:', res.data);
            setComment(prev => [...prev, res.data]);
            setNewComment('');
        } catch (err) { 
            console.error(err.response?.data || err);
        }
    };


    const handleDeleteComment = async (comment_id) => {        
        try{
           await axios.delete(`/dashboard/comments/${comment_id}/delete/`, { withCredentials: true });       
            console.log('Comment deleted');
            setComment(prev => prev.filter(c => c.id !== comment_id));         
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };


    const handleEditComment = async (e, comment_id) => {
        e.preventDefault();
        try{
            const res = await axios.patch(`/dashboard/comments/${comment_id}/edit/`,
            {content: commentContent }, { withCredentials: true});

            setComment(prev => prev.map(c => c.id === comment_id ? res.data : c)); 
            setEditingCommentId(null);
            setCommentContent('');
            setIsCommentEditing(false);

        } catch (err) { 
            console.error(err.response?.data || err);
        }
    };



//REPLY FUNCTIONS
        

    const toggleReplies = (commentId) => {
        const isCurrentlyOpen = repliesOpen[commentId];
        if (isCurrentlyOpen) {
            setReplies(prev => ({ ...prev, [commentId]: [] }));
            setRepliesPagination(prev => ({
                ...prev,
                [commentId]: { limit: 5, offset: 0, hasMore: true }
            }));
        } else {
            if (!replies[commentId] || replies[commentId].length === 0) {
                loadMoreReplies(commentId);
            }
        }

        setRepliesOpen(prev => ({ ...prev, [commentId]: !isCurrentlyOpen }));
    };
    

    const loadMoreReplies = async (commentId) => {
        const pagination = repliesPagination[commentId] || { limit: 5, offset: 0, hasMore: true };
        if (!pagination.hasMore) return;

        try {
            const res = await axios.get(
                `/api/comments/${commentId}/replies/?limit=${pagination.limit}&offset=${pagination.offset}`
            );

            setReplies(prev => ({
                ...prev,
                [commentId]: [...(prev[commentId] || []), ...res.data.results]
                    .sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
            }));

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



    const handleAddReply = async (e, parentId) => {
        e.preventDefault();
        try{
            const res = await axios.post(
                `/dashboard/posts/${post_id}/comments/`, 
                { content: newReply, parent_id: parentId }, 
                { withCredentials: true }
            );

            setReplies(prev => ({
                ...prev,
                [parentId]: prev[parentId]
                    ? [...prev[parentId], res.data]
                    : [res.data]
            }));

            setNewReply('');
            setReplyTo(null);
            setRepliesOpen(prev => ({ ...prev, [parentId]: true }));

        } catch (err) {
            console.error(err.response?.data || err);
        }
    }; 



//RENDER FUNCTIONS

    const renderPostButtons = () => {
        if (!isAuthenticated || username !== post.author) return null;
        return (
            <div>
                <button onClick={handleDeletePost}>Delete</button>
                <button onClick={() => {
                    setTitle(post.title);
                    setPostContent(post.content);
                    setIsPostEditing(true);
                }}>Edit</button>
            </div>
        );
    };

    const renderComments = () => {
        return (
            <div>
                {comment.length > 0 ? (
                    comment.map(c => (
                        <div key={c.id}>
                            <div>
                                <strong>{c.author}</strong>: {c.content}
                                <button onClick={() => toggleReplies(c.id)}>
                                    {repliesOpen[c.id] ? 'hide r' : 'open r'}
                                </button>

                            </div>


                            {isAuthenticated && (
                                <div>
                                    {username === c.author && (
                                        <>
                                            <button onClick={() => handleDeleteComment(c.id)}>delete</button>
                                            <button onClick={() => {
                                                setCommentContent(c.content);
                                                setIsCommentEditing(true);
                                                setEditingCommentId(c.id);
                                            }}>edit</button>
                                        </>
                                    )}
                                    <button onClick={() => setReplyTo(c.id)}>reply</button>
                                </div>
                            )}

                            {repliesOpen[c.id] && replies[c.id] && (
                                <>
                                    {replies[c.id].map(r => (
                                        <div key={r.id}>
                                            <strong>{r.author}</strong>: {r.content}
                                        </div>
                                    ))}

                                    {repliesPagination[c.id]?.hasMore && (
                                        <button onClick={() => loadMoreReplies(c.id)}>more</button>
                                    )}
                                </>
                            )}


                            {replyTo === c.id && isAuthenticated && (
                                <form onSubmit={(e) => handleAddReply(e, c.id)}>
                                    <textarea
                                        value={newReply}
                                        onChange={(e) => setNewReply(e.target.value)}
                                        placeholder="Write a reply..."
                                    />
                                    <button type="submit">Send</button>
                                    <button type="button" onClick={() => setReplyTo(null)}>
                                        Cancel
                                    </button>
                                </form>
                            )}

                        </div>
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
        );
    };


    return (
        <div>
            {!isPostEditing && !isCommentEditing ?(
                post ? (
                    <div>
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                        <span>by {post.author}</span>

                        <button type="button" onClick={handleLikePost}> 
                            {liked ? '❤️' : '🤍'} {post.likes_n}
                        </button>
                        {renderPostButtons()}

                        <h4>Comments</h4>
                        {renderComments()}
                    </div>
                ) : (
                    <p>It's empty here...</p>
                )            
            ) : !isPostEditing && isCommentEditing ? (
                <form onSubmit={(e) => handleEditComment(e, editingCommentId)}>
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
            ) : (
                <form onSubmit={handleEditPost}>
                    <div>
                        <label>Title:</label>
                        <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Edit post title"/>
                    </div>

                    <div>
                        <label>Content:</label>
                        <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Edit post content"/>
                    </div>

                    <button type="submit">Submit changes</button>
                    <button type="button" onClick={() => setIsPostEditing(false)}>Cancel</button>
                </form>
            )}
        </div>
    );
};

export { PostPage };