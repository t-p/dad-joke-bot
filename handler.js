'use strict';

const Twitter = require('twitter');
const fetch = require('node-fetch');
const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');

const twitter = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://icanhazdadjoke.com/graphql',
    fetch: fetch
  }),
  cache: new InMemoryCache()
});
const gql = require('graphql-tag');

module.exports.joke = async (_event, _context) => {
  const result = await client.query({
    query: gql`
      query {
        joke {
          joke
        }
      }
    `
  });

  if (result.data.networkStatus == 8) return null;

  try {
    await twitter.post('statuses/update', {
      status: result.data.joke.joke
    });
  } catch (err) {
    console.error(`Error: ${JSON.stringify(err)}`);
  }
};
