import React, { Component, Fragment } from 'react';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';

import { apiRoot } from '../../util/api';

import './Feed.css';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    const graphQuery = {
      query: `
        {
          user {
            status
          }
        }
      `
    };
    fetch(`${apiRoot}/graphql`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.props.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        if (res.errors) {
          const message = res.errors[0] && res.errors[0].message; 
          throw new Error(message || 'Failed to fetch user details.');
        }
        const resData = res.data && res.data.user;
        this.setState({ status: resData.status });
      })
      .catch(this.catchError);

    this.loadPosts();
  }

  loadPosts = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }
    const graphQuery = {
      query: `
        {
          posts(page: ${page}) {
            posts {
              _id
              title
              content,
              creator {
                name
              }
              createdAt
            }
            totalPosts
          }
        }
      `
    };
    fetch(`${apiRoot}/graphql`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.props.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        if (res.errors) {
          const message = res.errors[0] && res.errors[0].message; 
          throw new Error(message || 'Failed to fetch posts.');
        }
        const resData = res.data && res.data.posts;
        this.setState({
          posts: resData.posts.map(post => {
            return {
              ...post,
              imagePath: post.imageUrl
            }
          }),
          totalPosts: resData.totalPosts,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();
    const graphQuery = {
      query: `
        mutation {
          updateUserStatus(status: "${this.state.status}") {
            status
          }
        }
      `
    };
    fetch(`${apiRoot}/graphql`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.props.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        if (res.errors) {
          const message = res.errors[0] && res.errors[0].message; 
          throw new Error(message || 'Could not update status');
        }
        const resData = res.data && res.data.updateUserStatus;
        this.setState({
          status: resData.status
        });
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = postData => {
    this.setState({
      editLoading: true
    });
    // create form data
    const formData = new FormData();
    formData.append('image', postData.image);
    if (this.state.editPost) {
      formData.append('oldPath', this.state.editPost.imagePath);
    }

    // save image
    fetch(`${apiRoot}/post-image`, {
      method: 'PUT',
      headers: {
        Authorization: `Token ${this.props.token}`
      },
      body: formData
    }).then(res => {
      return res.json();
    }).then(res => {
      const imageUrl = res.filePath
      let graphQuery = {
        query: `
          mutation {
            createPost(postInput: { title: "${postData.title}", content: "${postData.content}", imageUrl: "${imageUrl}" }) {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
            }
          }
        `
      };
      if (this.state.editPost) {
        const postId = this.state.editPost._id;
        graphQuery = {
          query: `
            mutation {
              updatePost(id: "${postId}", postInput: { title: "${postData.title}", content: "${postData.content}", imageUrl: "${imageUrl}" }) {
                _id
                title
                content
                imageUrl
                creator {
                  name
                }
                createdAt
              }
            }
          `
        };
      }
  
      return fetch(`${apiRoot}/graphql`, {
        method: 'POST',
        body: JSON.stringify(graphQuery),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${this.props.token}`
        }
      });
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        if (res.errors) {
          const message = res.errors[0] && res.errors[0].message;
          throw new Error(message || 'Saving post failed');
        }
        const resData = res.data && (res.data.createPost || res.data.updatePost);
        const post = {
          _id: resData._id,
          title: resData.title,
          content: resData.content,
          creator: resData.creator,
          createdAt: resData.createdAt,
          imagePath: resData.imageUrl
        };
        // add/edit posts to state
        this.setState(prevState => {
          let updatedPosts = [...prevState.posts];
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              p => p.id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else {
            updatedPosts.pop();
            updatedPosts.unshift(post);
          }
          return {
            posts: updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = postId => {
    this.setState({ postsLoading: true });
    const graphQuery = {
      query: `
        mutation {
          deletePost(id: "${postId}")
        }
      `
    };
    fetch(`${apiRoot}/graphql`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.props.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        if (res.errors) {
          const message = res.errors[0] && res.errors[0].message;
          throw new Error(message || 'Deleting a post failed!');
        }
      const resData = res.data && res.data.deletePost;
        console.log(resData);
        this.loadPosts();
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-IN')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
