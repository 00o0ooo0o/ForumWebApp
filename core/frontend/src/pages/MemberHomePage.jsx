import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import axios from 'axios';

const MemberHomePage = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [theme, setTheme] = useState('cat_chat'); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                'http://localhost:8000/api/posts/create/',
                { title, content, theme }, 
                { withCredentials: true }
            );

            console.log('Post created:', res.data);

            setPosts([res.data, ...posts]);

            setTitle('');
            setContent('');
            setTheme('cat_chat');

        } catch (err) {
            console.error(err.response?.data || err);
        }
    };

    useEffect(() => {
        const getPosts = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/posts/');
                setPosts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        getPosts();
    }, []);

    return (
        <div>
            <h1>Welcome to Member Home Page</h1>

            {posts.map(post => (
                <div key={post.id}>
                    <Link to={`/posts/${post.id}`}>
                        <h3>{post.title}</h3>
                    </Link>
                    <p>{post.content}</p>
                    <span>by {post.author}</span>
                </div>
            ))}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Enter post title"
                    />
                </div>

                <div>
                    <label>Content:</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter post content"
                    />
                </div>

                <button type="submit">Create Post</button>
            </form>
        </div>
    );
};

export { MemberHomePage };
