function customHttp() {
  return {
    getRequest(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    postRequest(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    }
  };
}
const http = customHttp();

const newsServices = (function() {
  const apiKey = "9394726d5f134232b470fa4b59acfd91";
  const apiUrl = "http://newsapi.org/v2";

  return {
    topHeadlines(country = "ua", category = "technology", cb) {
      http.getRequest(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.getRequest(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  };
})();

// Элементы UI

const form = document.querySelector(".news_form");
const countrySelect = document.querySelector(".news_form-select");
const categorySelect = document.querySelector(".news_form-select-category");
const searchInput = document.querySelector(".news_form-search");

// Обработка формы

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
  form.reset();
});

// Loader, который запускает функцию после загрузки DOM

document.addEventListener("DOMContentLoaded", function() {
  loadNews();
});

// Формируем возможность выбора

function loadNews() {
  const country = countrySelect.value;
  const category = categorySelect.value;
  const searchField = searchInput.value;

  if (!searchField) {
    newsServices.topHeadlines(country, category, onGetResponse);
  } else {
    newsServices.everything(searchField, onGetResponse);
  }
}

// Callback func которая принимает ответ от сервера и ошибку
function onGetResponse(err, response) {
  if (err) {
    alert(`${err}`);
    return;
  }
  renderNews(response.articles);
}

// 	Перебераем каждый элемент массива и добавляем во фрагмент сформированный элемент

function renderNews(news) {
  const newsContainer = document.querySelector(".container");
  let fragment = "";

  news.forEach((newsItem) => {
    const news = newsTemplate(newsItem);
    fragment += news;
  });
  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

// Формируем каждый элемент в html

function newsTemplate(news) {
  return `
		<div class='card'">
			<img src="${news.urlToImage ||
        "https://s.hi-news.ru/wp-content/uploads/2019/10/14future08-750x509.jpg"}" class="card-img-top" alt="image">
			<div class='card-body'>
				<h5 class='card-title'>${news.title || ""}</h5>
				<p class='card-text'>${news.description || ""}</p>
				<a href='${news.url}' class='btn btn-primary'>Подробнее</a>
			</div>
		</div>
	`;
}
