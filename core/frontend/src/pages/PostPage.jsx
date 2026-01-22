import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostPage = () => {
    const { username, isAuthenticated } = useContext(AuthContext);
    const [post, setPost] = useState(null);
    const {id} = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);


    useEffect(() => {
        const getPost = async () => { 
            try {
                const res = await axios.get(`http://localhost:8000/api/posts/${id}/`, { withCredentials: true });
                setPost(res.data); 
            } catch (err) {
                console.error(err.response?.data || err);
            }
        };

        setIsEditing(false);
        setTitle('');
        setContent('');

        getPost();
    }, [id, isAuthenticated, navigate]);


    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            await axios.delete(`http://localhost:8000/api/posts/${id}/delete/`,
                { withCredentials: true });
            navigate('/member/'); 
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };


    const handleEdit = async (e) => {
        e.preventDefault();
        try{
            const res = await axios.patch(`http://localhost:8000/api/posts/${id}/edit/`,
            {title, content}, { withCredentials: true});

            setPost(res.data);         
            setIsEditing(false);

        } catch (err) {
            console.error(err.response?.data || err);
        }
    };

    return (
        <div>
        {!isEditing ? (
            post ? (
            <div>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <span>by {post.author}</span>

                {isAuthenticated && username === post.author && (
                <div>
                    <button onClick={handleDelete}>Delete</button>
                    <button onClick={() => {
                        setTitle(post.title);
                        setContent(post.content);
                        setIsEditing(true);
                    }}>Edit</button>
                </div>
                )}
            </div>
            ) : (
            <p>It's empty here...</p>
            )
        ) : (
            <form onSubmit={handleEdit}>
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
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Edit post content"/>
                </div>

                <button type="submit">Submit changes</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            </form>
        )}
        </div>
    );
};

export { PostPage };
