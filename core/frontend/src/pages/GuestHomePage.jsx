import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const GuestHomePage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const getPosts = async () => { 
            try {
                const res = await axios.get(`http://localhost:8000/api/posts/`);
                setPosts(res.data); 
            } catch (err) {
                console.error(err);
            }
        };

        getPosts();
    }, []);

    return (
        <div>
            <h1>Welcome to Guest Home Page</h1>

            {posts.map(post => (
                <div key={post.id}>
                    <Link to={`/posts/${post.id}`}>
                        <h3>{post.title}</h3>
                    </Link>
                    <span>by {post.author}</span>
                </div>
            ))}

        </div>
    );
};

export { GuestHomePage };
