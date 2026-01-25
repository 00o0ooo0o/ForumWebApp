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
    onAdd,
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
    level = 0
}) => {

    const handleToggleReplies = () => {
        const isOpen = repliesOpen[commentItem.id];
        if (!isOpen) {
            loadMoreReplies(commentItem.id);
        }
        setRepliesOpen(prev => ({ ...prev, [commentItem.id]: !isOpen }));
    };
    

    return (
        <div key={commentItem.id} style={{ paddingLeft: `${level * 20}px` }}>
            <div>
                <strong>{commentItem.author}</strong>: {commentItem.content}
                <button onClick={handleToggleReplies}>
                    {repliesOpen[commentItem.id] ? 'hide' : 'open'}
                </button>
            </div>


            {isAuthenticated && (
                <div style={{display: 'flex'}}>
                    {username === commentItem.author && (
                        <>
                            <button onClick={() => onDelete(commentItem.id, commentItem.parent_id)}>delete</button>
                            <button onClick={() => {
                                setCommentContent(commentItem.content);
                                setIsCommentEditing(true);
                                setEditingItem({
                                    id: commentItem.id,
                                    parent_id: commentItem.parent_id
                                });
                            }}>edit</button>
                        </>
                    )}
                    <button onClick={() => onReply(commentItem.id)}>reply</button>
                </div>
            )}

            {repliesOpen[commentItem.id] && replies[commentItem.id] && (
                <>
                    {replies[commentItem.id].map(reply => (
                        <Comment
                            key={reply.id}
                            commentItem={reply}
                            level={level + 1}
                            replies={replies}
                            repliesOpen={repliesOpen}
                            setReplies={setReplies}
                            setRepliesOpen={setRepliesOpen}
                            onAdd={onAdd}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            onReply={onReply}
                            loadMoreReplies={loadMoreReplies}
                            replyTo={replyTo}
                            setReplyTo={setReplyTo}
                            isAuthenticated={isAuthenticated}
                            username={username}
                            newReply={newReply}
                            setNewReply={setNewReply}
                            commentContent={commentContent}
                            setCommentContent={setCommentContent}
                            isCommentEditing={isCommentEditing}
                            setIsCommentEditing={setIsCommentEditing}
                            editingItem={editingItem}
                            setEditingItem={setEditingItem}
                        />
                    ))}
                </>
            )}

            {/* adding a reply */}
            {replyTo === commentItem.id && isAuthenticated && (
                <form onSubmit={(e) => onAdd(e, commentItem.id)}>
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

export { Comment };