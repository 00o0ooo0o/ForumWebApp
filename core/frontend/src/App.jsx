import React from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import { NotFoundPage } from './pages/NotFoundPage';
import { MemberHomePage } from './pages/MemberHomePage';
import { GuestHomePage } from './pages/GuestHomePage';
import { Layout } from './components/Layout';
import { ProtectedRoutes } from './components/ProtectedRoutes';
import { AuthProvider } from './AuthContext';
import { PostPage } from './pages/PostPage';
import { PaginatedReplyPage } from './pages/PaginatedReplyPage';
import './css/App.css'
import { SearchResultsPage } from './pages/SearchResultsPage';

function App() {

  return (
    <AuthProvider>
      <Routes>

        <Route path="/" element={<Layout />}>
          <Route index element={<GuestHomePage />} />
          <Route path="posts/:post_id" element={<PostPage />} />
          <Route path="posts/:post_id/comments/:comment_id" element={<PaginatedReplyPage />} />
          <Route path="search" element={<SearchResultsPage/>}/>

          <Route element={<ProtectedRoutes />}>
            <Route path="member" element={<MemberHomePage />} />
          </Route>
        </Route>

        <Route path='*' element={<NotFoundPage />} />
        
      </Routes>
    </AuthProvider>
  );
}

export default App;