import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Comments } from '../components/Comments';


const PostPage = () => {
    const {username, isAuthenticated} = useContext(AuthContext);
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const {post_id} = useParams();
    const [title, setTitle] = useState('');
    const [isPostEditing, setIsPostEditing] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [liked, setLiked] = useState(false);


    useEffect(() => {
        const getPost = async () => { 
            try {
                const res = await axios.get(`http://localhost:8000/api/posts/${post_id}/`, { withCredentials: true });
                setPost(res.data.post);         
                setLiked(res.data.post.liked);   
            } catch (err) {
                console.error(err.response?.data || err);
            }
        };
        setIsPostEditing(false);
        setTitle('');
        setPostContent('');

        getPost();
    }, [post_id, isAuthenticated]);



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

            console.log("Liked");
        
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };


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



    return (
        <div>
            {!isPostEditing ? (
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
                        <Comments post_id={post_id} />
                    </div>
                ) : (
                    <p>It's empty here...</p>
                )            
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