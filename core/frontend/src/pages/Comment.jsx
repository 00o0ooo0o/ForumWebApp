import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Comment = ({
    commentItem,       // comment itself
    replies,           // { parentId: [reply1, reply2] }
    repliesOpen,       
    setReplies,
    setRepliesOpen,
    onDelete,
    onEdit,
    onReply,
    loadMoreReplies,
    replyTo,
    setReplyTo,
    isAuthenticated,
    username,
    newReply,
    setNewReply,
    commentContent,
    setCommentContent,
    isCommentEditing,
    setIsCommentEditing,
    editingItem,
    setEditingItem,
}) => {

    const handleToggleReplies = () => {
        const isOpen = repliesOpen[commentItem.id];
        if (!isOpen) {
            loadMoreReplies(commentItem.id);
        }
        setRepliesOpen(prev => ({ ...prev, [commentItem.id]: !isOpen }));
    };
    
    return (
        <div>
            <h1>Comment rendered from Comment.jsx</h1>
        </div>
    );
};

export { Comment };