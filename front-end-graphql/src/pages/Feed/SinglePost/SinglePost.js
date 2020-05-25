import React, { Component } from 'react';

import Image from '../../../components/Image/Image';

import { apiRoot } from '../../../util/api';

import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  
  componentDidMount() {
    const postId = this.props.match.params.postId;
    const graphQuery = {
      query: `
        query fetchSinglePost($postId: ID!) {
          post(id: $postId) {
            title
            content
            imageUrl,
            creator {
              name
            }
            createdAt
          }
        }
      `,
      variables: {
        postId: postId
      }
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
      }).then(res => {
        if (res.errors) {
          const message = res.errors[0] && res.errors[0].message; 
          throw new Error(message || 'Failed to fetch details of post');
        }
        const resData = res.data && res.data.post;
        this.setState({
          title: resData.title,
          image: apiRoot + resData.imageUrl,
          author: resData.creator.name,
          date: new Date(resData.createdAt).toLocaleDateString('en-US'),
          content: resData.content
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
