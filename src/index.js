import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { ServiceApi } from './myPixabay-API';
import Notiflix from 'notiflix';

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
console.log(lightbox);

const pixabayServiceApi = new ServiceApi();

const refs = {
  form: document.querySelector('.search-form'),
  buttonSubmit: document.querySelector('[data-type="submit"]'),
  btnLoadMoreImg: document.querySelector('.load-more'),
  galleryList: document.querySelector('.gallery'),
};

refs.form.addEventListener('submit', onSearch);
refs.btnLoadMoreImg.addEventListener('click', onMoreImages);

function onSearch(evt) {
  evt.preventDefault();
  clearGallery();
  refs.btnLoadMoreImg.classList.add('is-hidden');

  pixabayServiceApi.query = evt.currentTarget.elements.searchQuery.value.trim();

  pixabayServiceApi.resetPage();

  if (pixabayServiceApi.query === '') {
    return Notiflix.Notify.failure(
      'You have not entered anything, please enter a valid name.'
    );
  }
  refs.buttonSubmit.disabled = true;
  pixabayServiceApi
    .fetchPictureGallery()
    .then(({ hits, totalHits }) => {
      if (hits.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        const maxPage = totalHits / hits.length;
        const currentPage = pixabayServiceApi.page - 1;
        if (maxPage <= currentPage) {
          Notiflix.Notify.failure(
            "We're sorry, but you've reached the end of search results."
          );
          Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
          return pictureGalleryMarkup(hits);
        }
        Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
        refs.btnLoadMoreImg.classList.remove('is-hidden');

        return pictureGalleryMarkup(hits);
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      refs.btnLoadMoreImg.disabled = false;
      refs.buttonSubmit.disabled = false;
    });
}

function onMoreImages() {
  refs.btnLoadMoreImg.disabled = true;

  pixabayServiceApi
    .fetchPictureGallery()
    .then(({ hits, totalHits }) => {
      const currentPage = pixabayServiceApi.page - 1;
      const maxPage = totalHits / pixabayServiceApi.perPage;

      if (maxPage <= currentPage) {
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        refs.btnLoadMoreImg.classList.add('is-hidden');
      }

      return pictureGalleryMarkup(hits);
    })
    .catch(error => console.log(error))
    .finally(() => {
      refs.btnLoadMoreImg.disabled = false;
      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    });
}

function pictureGalleryMarkup(data) {
  refs.galleryList.insertAdjacentHTML('beforeend', galleryItem(data));
  lightbox.refresh();
}

function galleryItem(data) {
  const galleryMarkup = data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class="gallery-item" href="${largeImageURL}">
		 <div class="photo-card">
		  <img src="${webformatURL}" alt="${tags}" loading="lazy" width="320" height="214"/>
		  <div class="info"><p class="info-item">
		  <b>Likes:</b> ${likes}
		</p>
		<p class="info-item">
		  <b>Views:</b> ${views}
		</p>
		<p class="info-item">
		  <b>Comments:</b> ${comments}
		</p>
		<p class="info-item">
		  <b>Downloads:</b> ${downloads}
		</p>
	 </div></div></a>`;
      }
    )
    .join('');
  return galleryMarkup;
}

function clearGallery() {
  refs.galleryList.innerHTML = '';
}