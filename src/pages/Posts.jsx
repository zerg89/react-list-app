import React, {useEffect, useRef, useState} from 'react';
import {usePosts} from '../hooks/usePosts';
import {useFetching} from '../hooks/useFetching';
import PostService from '../API/PostService';
import {getPageCount} from '../utils/pages';
import PostForm from '../components/PostForm';
import MyModal from '../components/UI/MyModal/MyModal';
import PostFilter from '../components/PostFilter';
import PostList from '../components/PostList';
import Pagination from '../components/UI/pagination/Pagination';
import Loader from '../components/UI/Loader/Loader';
import {useObserver} from '../hooks/useObserver';
import MySelect from '../components/UI/select/MySelect';

function Posts() {
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState({sort: '', query: ''})
  const [modal, setModal] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const sortedAndSearchedPosts = usePosts(posts, filter.sort, filter.query);
  const lastElement = useRef()

  const [fetchPosts, isPostsLoading, postError] = useFetching(async (limit, page) => {
    const response = await PostService.getAll(limit, page)
    setPosts([...posts, ...response.data])
    const totalCount = response.headers['x-total-count']
    setTotalPages(getPageCount(totalCount, limit))
  })

  useObserver(lastElement, page < totalPages, isPostsLoading, () => {
    setPage(page + 1)
  })

  useEffect(() => {
    fetchPosts(limit, page)
  }, [page, limit])

  const createPost = (newPost) => {
    if (newPost.title !== '' && newPost.body !== '') {
      setPosts([...posts, newPost])
      setModal(false)
    }
  }

  const removePost = (post) => {
    setPosts(posts.filter(p => p.id !== post.id))
  }

  const changePage = (page) => {
    setPage(page)
  }

  return (
    <div className="App">
      {/*<button className="btn btn-danger mt-4 mx-2" onClick={fetchPosts}>GET POSTS</button>*/}
      <button className="btn btn-primary mt-4" onClick={() => setModal(true)}>Создать пост</button>
      <MyModal visible={modal} setVisible={setModal}>
        <PostForm create={createPost} />
      </MyModal>

      <hr className="my-3" />
      <PostFilter filter={filter} setFilter={setFilter} />
      <MySelect
        value={limit}
        onChange={value => setLimit(value)}
        defaultValue="Кол-во элементов на странице"
        options={[
          {value: 5, name: '5'},
          {value: 10, name: '10'},
          {value: 25, name: '25'},
          {value: -1, name: 'Показать все посты'},
        ]}
      />
      {postError &&
      <h3>Произошла ошибка ${postError}</h3>}
      <PostList remove={removePost} posts={sortedAndSearchedPosts} title="Список постов JavaScript" />
      <div ref={lastElement} style={{height: 20, background: "red"}} />
      {isPostsLoading &&
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 50}}><Loader /></div>
      }
      <Pagination page={page} changePage={changePage} totalPages={totalPages} />

    </div>
  );
}

export default Posts;
