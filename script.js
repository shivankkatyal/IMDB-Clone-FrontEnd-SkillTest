let currentMovieStack = [];

const homeButton = document.getElementById("home-button");
const searchBox = document.getElementById("search-box");
const goToFavouriteButton = document.getElementById("goto-favourites-button");
const movieCardContainer = document.getElementById("movie-card-container")

// function to show an alert when needed
function showAlert(message){
	alert(message);
}


// create movie cards using elements of currentMovieStack array 
function renderList(actionForButton){
	movieCardContainer.innerHTML = '';

	for(let i = 0; i<currentMovieStack.length; i++){

		// creating div element for movie card and setting class and id to it
		let movieCard = document.createElement('div');
		movieCard.classList.add("movie-card");

		// template for interHtml of movie card which sets image, title and rating of particular movie
		movieCard.innerHTML = `
		<img src="${'https://image.tmdb.org/t/p/w500' + currentMovieStack[i].poster_path}" alt="${currentMovieStack[i].title}" class="movie-poster">
		<div class="movie-title-container">
			<span>${currentMovieStack[i].title}</span>
			<div class="rating-container">
                <i class="fa-solid fa-star" style="color: #ffbb00;"></i>
                <span>${currentMovieStack[i].vote_average.toFixed(1)}</span>
            </div>
		</div>

		<button id="${currentMovieStack[i].id}" onclick="getMovieInDetail(this)" style="height:40px;"><i class="fa-solid fa-circle-info"></i> Movie Details </button>

        <button onclick="${actionForButton}(this)" class="add-to-favourite-button text-icon-button" data-id="${currentMovieStack[i].id}" >            <i class="fa-solid fa-heart" style="color: #891515;"></i>
			<span>${actionForButton}</span>
		</button>
		`;
		movieCardContainer.append(movieCard); //appending card to the movie container view
		
	}
}


// if any thing wrong by using this function we print message to the main screen
function printError(message){
	const errorDiv = document.createElement("div");
	errorDiv.innerHTML = message;
	errorDiv.style.height = "100%";
	errorDiv.style.fontSize = "5rem";
	errorDiv.style.margin = "auto";
	movieCardContainer.innerHTML = "";
	movieCardContainer.append(errorDiv);
}

// gets trending movies from the server and displays as movie cards
function getTrendingMovies(){
	const tmdb = fetch("https://api.themoviedb.org/3/trending/movie/day?api_key=cb213741fa9662c69add38c5a59c0110")
	.then((response) => response.json())
	.then((data) => {
		currentMovieStack = data.results;
		renderList("favourite");
	})
	.catch((err) => printError(err));
}
getTrendingMovies();

// As we click on home button it fetches trending movies and shows on web-page
homeButton.addEventListener('click', getTrendingMovies);


// search box event listner check for any key press and search the movie according and show on web-page
searchBox.addEventListener('keyup' , ()=>{
	let searchString = searchBox.value;
	if(searchString.length > 0){
		let searchStringURI = encodeURI(searchString);
		const searchResult = fetch(`https://api.themoviedb.org/3/search/movie?api_key=cb213741fa9662c69add38c5a59c0110&language=en-US&page=1&include_adult=false&query=${searchStringURI}`)
			.then((response) => response.json())
			.then((data) =>{
				currentMovieStack = data.results;
				renderList("favourite");
			})
			.catch((err) => printError(err));
	}
})


// function to add movie into favourite section
function favourite(element) {
    let id = element.dataset.id;
    let favouriteMoviesShivank = JSON.parse(localStorage.getItem("favouriteMoviesShivank"));
  
    if (!favouriteMoviesShivank) {
      favouriteMoviesShivank = [];
    }
  
    // Check if the movie is already in favorites
    const isAlreadyFavourite = favouriteMoviesShivank.some((movie) => movie.id == id);
  
    if (!isAlreadyFavourite) {
      for (let i = 0; i < currentMovieStack.length; i++) {
        if (currentMovieStack[i].id == id) {
          favouriteMoviesShivank.unshift(currentMovieStack[i]);
          localStorage.setItem("favouriteMoviesShivank", JSON.stringify(favouriteMoviesShivank));
  
          showAlert(currentMovieStack[i].title + " added to favorites");
          return;
        }
      }
    } else {
      showAlert("Movie is already in favorites");
    }
}

// when Favourites movie button click it shows the favourite moves 
goToFavouriteButton.addEventListener('click', ()=>{
	let favouriteMoviesShivank = JSON.parse(localStorage.getItem("favouriteMoviesShivank"));
	if(favouriteMoviesShivank == null || favouriteMoviesShivank.length < 1){
		showAlert("You have not added any movie to favourite");
		return;
	}

	currentMovieStack = favouriteMoviesShivank;
	renderList("remove");
})


// remove movies from favourite section
function remove(element) {
    let id = element.dataset.id;
    let favouriteMoviesShivank = JSON.parse(localStorage.getItem("favouriteMoviesShivank"));
  
    if (!favouriteMoviesShivank) {
      showAlert("Favorites is empty");
      return;
    }
  
    // Find the index of the movie to remove
    const indexToRemove = favouriteMoviesShivank.findIndex((movie) => movie.id == id);
  
    if (indexToRemove !== -1) {
      // Remove the movie from the favorites array
      favouriteMoviesShivank.splice(indexToRemove, 1);
  
      // Update localStorage and currentMovieStack
      localStorage.setItem("favouriteMoviesShivank", JSON.stringify(favouriteMoviesShivank));
      currentMovieStack = favouriteMoviesShivank;
  
      showAlert("Movie removed from favorites");
      renderList("remove");
    }
}




// renders movie details on web-page
function renderMovieInDetail(movie){
	console.log(movie);
	movieCardContainer.innerHTML = '';
	
	let movieDetailCard = document.createElement('div');
	movieDetailCard.classList.add('detail-movie-card');

	movieDetailCard.innerHTML = `
		<img src="${'https://image.tmdb.org/t/p/w500' + movie.backdrop_path}" class="detail-movie-background">
		<img src="${'https://image.tmdb.org/t/p/w500' + movie.poster_path}" class="detail-movie-poster">
		<div class="detail-movie-title">
			<span>${movie.title}</span>
			<div class="detail-movie-rating">
                <i class="fa-solid fa-star" style="color: #ffbb00;"></i>
				<span>${movie.vote_average.toFixed(1)}</span>
			</div>
		</div>
		<div class="detail-movie-plot">
			<p>${movie.overview}</p>
			<p>Release date : ${movie.release_date}</p>
			<p>Runtime : ${movie.runtime} minutes</p>
			<p>Tagline : ${movie.tagline}</p>
		</div>
	`;

	movieCardContainer.append(movieDetailCard);
}


// fetch the details of of move and send it to renderMovieDetails to display
function getMovieInDetail(element){
	fetch(`https://api.themoviedb.org/3/movie/${element.getAttribute('id')}?api_key=cb213741fa9662c69add38c5a59c0110&language=en-US`)
		.then((response) => response.json())
		.then((data) => renderMovieInDetail(data))
		.catch((err) => printError(err));

}
