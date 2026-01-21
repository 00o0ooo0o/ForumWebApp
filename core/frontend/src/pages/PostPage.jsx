import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostPage = () => {
    const { username, isAuthenticated } = useContext(AuthContext);
    const [post, setPosts] = useState(null);
    const {id} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getPosts = async () => { 
            try {
                const res = await axios.get(`http://localhost:8000/api/posts/${id}/`, { withCredentials: true });
                setPosts(res.data); 
            } catch (err) {
                console.error(err);
            }
        };

        getPosts();
    }, [id]); 


    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.delete(`http://localhost:8000/api/posts/${id}/delete/`,
                { withCredentials: true }
            );
            navigate('/member/'); 
            setPosts(res.data);
        } catch (err) {
            console.error(err.response?.data || err);
        }
    };


    return(
        <div>
            {post ? (
            <div>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <span>by {post.author}</span>
            </div>
            ) : (
                <p>It's empty here...</p>
            )}


            {post && isAuthenticated && username === post.author && (
                <>
                    <button onClick={handleDelete}>Delete Post</button>
                </>
            )}

        </div>
    );
};

export { PostPage };