import axios from 'axios';

const API_KEY = '30777847-7432d4621f99132f16734ec32';
const BASE_URL = 'https://pixabay.com/api/';

export class ServiceApi {
  constructor() {
    this.page = 1;
    this.perPage = 40;
    this.searchQuery = '';
    this.axios = require('axios');
  }

  async fetchPictureGallery() {
    try {
      const response = await axios.get(
        `${BASE_URL}/?key=${API_KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${this.perPage}&page=${this.page}`
      );
      const data = response.data;
      this.incrementPage();
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}