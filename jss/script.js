const UrlApiOCMovies = 'http://127.0.0.1:8000/';
const UriGenres = 'api/v1/genres/';
const UriTitles = 'api/v1/titles/';
const UrlGenres = UrlApiOCMovies+UriGenres;
const UrlTitles = UrlApiOCMovies+UriTitles;
const GenresDisplayNumber = {
	"Films les mieux notés":7,
	"Meilleurs Films d'Animation":7,
	"Meilleurs Films d'Adventure":7,
	"Meilleurs Films d'Adult":7
};
const DefaultNbrDisplay = 4;
const DataBestMovieByGenre = []; 

const footer = document.getElementById("footer");

class DataMovie {
	constructor(data){
		this.actors = data.actors;
		this.directors =data.directors;
		this.genres = data.genres;
		this.id = data.id;
		this.image_url = data.image_url;
		this.imdb_score = data.imdb_score;
		this.imdb_url = data.imdb_url;
		this.title = data.title;
		this.url = data.url;
		this.votes = data.votes;
		this.writers = data.writers;
		this.year = data.year;
	}
}

class DataGenre {
	constructor(genre,data){
		this.genre = genre;
		this.datamovie = data;
	}
}



const MaxPage = async function(data){
	let NumberPages = 1;
	if (data.next = null ) {
		return NumberPages;
	} 
	NumberPages = Math.floor(data.count/5);
	if (NumberPages == (data.count/5)){
		return NumberPages;
	} else {
		return NumberPages+1;
	}
}

const GetDataApi = async function (url){
	try {
		let response = await fetch(url);
		if (response.ok) {
			let data = await response.json();
			return data;
		} else {
			console.error('Retour du serveur : ', response.status);
		}

	} catch (e) {
		console.log(e);
	}
}

const CreateUrlSearchApi  = async function(genre) {
	let UrlSearch = UrlTitles+'?sort_by=imdb_score';
	let DataGenre = await GetDataApi(UrlGenres);
	// if genre not present/define return UrlSearch
	if (genre == false) {
		return  UrlSearch;
	} 
	// if genre present check genre is prent on api
	// if present return 'UrlSearch+'&genre='+genre'
	// else return UrlSearch
	for ( let GenreApi of  DataGenre.results) {
		if (GenreApi.name == genre){
			return UrlSearch+'&genre='+genre;
		}
	}
	return UrlSearch;
}

const GetDataBestMovieByGenre = async function (NumberMovie,Genre = false){
	let ArrayDataMovie = []; 
	let UrlSearch = await CreateUrlSearchApi(Genre);
	let NumberPages = await MaxPage(await GetDataApi(UrlSearch));
	// While NumberMovie > ArrayDataMovie.length and NumberPages > 0 get data Movie from Api 
	while (NumberMovie > ArrayDataMovie.length && NumberPages > 0 ){
		const Urlpages = UrlSearch+'&page='+NumberPages;
		data = await GetDataApi(Urlpages);
		// Add data Movie from page NumberPages in ArrayDataMovie
		for (let result  of data.results){
			ArrayDataMovie.push( new DataMovie(result));
		}
		// Select Pages next
		NumberPages -= 1;
	}
	// sort Movie by imdb_score
	ArrayDataMovie.sort((a,b) =>  b.imdb_score-a.imdb_score );
	// Cut ArrayDataMovie if  number >  NumberMovie
	if (ArrayDataMovie.length > NumberMovie){
		ArrayDataMovie.length = NumberMovie;
	}
	return ArrayDataMovie;
}

const DisplayLelftArrow = function(newSection,data){
	if (data.length > DefaultNbrDisplay){
		const lelftArrow = document.createElement("div");
		lelftArrow.classList.add("arrow__btn");
		lelftArrow.classList.add("left-arrow");
		lelftArrow.innerHTML = "<";
		newSection.appendChild(lelftArrow);
	}
}

const DisplayRightArrow = function(newSection,data){
	if (data.length > DefaultNbrDisplay){
		const rightArrow = document.createElement("div");
		rightArrow.classList.add("arrow__btn");
		rightArrow.classList.add("right-arrow");
		rightArrow.innerHTML = ">";
		newSection.appendChild(rightArrow);
	}
}

const DisplayFilm = function(data,section){
	const newFilm = document.createElement("div");
	newFilm.classList.add("film");
	const img = document.createElement("img");
	img.src = data.image_url;
	img.alt = data.title;
	newFilm.appendChild(img);
	section.appendChild(newFilm);
}

const DisplayTitre = function(title,section){
	const newDiv =  document.createElement("div");
	newDiv.classList.add("titre");
	const newTitle = document.createElement("h1");
	newTitle.innerHTML = title;
	newDiv.appendChild(newTitle);
	section.appendChild(newDiv);
}


const DisplayGenre = function(title,dataGenre,page){
	let nbr = 0; 

	const newSection = document.createElement("section");
	newSection.id = title;
    DisplayTitre(title,newSection);
    const newDiv = document.createElement("div");
    newDiv.classList.add("list");
    DisplayLelftArrow(newDiv,dataGenre);
	for (let data of dataGenre) {
		nbr +=1 ;
		// display number default movie

		if (nbr <= DefaultNbrDisplay){
			DisplayFilm(data,newDiv);
		}
	}
	DisplayRightArrow(newDiv,dataGenre);
	newSection.appendChild(newDiv);
	page.insertBefore(newSection,footer);
}

const DisplayBestMovie = function(data,page){
	const newSection = document.createElement("section");
	newSection.id = "BestMovie";
	let data_movie = data[0].datamovie[0];
	let newDiv =  document.createElement("div");
	newDiv.classList.add("information");
	const information = document.createElement("h1");
	information.innerHTML = data_movie.title;
	newDiv.appendChild(information);
	const play = document.createElement("button");
	play.classList.add("button");
	play.classList.add("play");
	play.innerHTML = "Lecture";
	newDiv.appendChild(play);
	newSection.appendChild(newDiv);
    DisplayFilm(data_movie,newSection);
	page.insertBefore(newSection,footer);
}


const GetDataMovie = async function(){
	for(let title in GenresDisplayNumber) {
  		let nbr = GenresDisplayNumber[title];
  		const genre = title.split('\'')[1];
  		// get data Film by genre
		let data = new DataGenre(title, await GetDataBestMovieByGenre(nbr, genre));
		DataBestMovieByGenre.push(data);
	}
}

const FindDataMovieByTitle = function(title){
	for (let genre of DataBestMovieByGenre) {
		for (let data_movie of genre.datamovie){
			if (data_movie.title === title){
				return data_movie;
			} 
		}
	}
}

const DisplayFilmDetail = function(e){
	let target = e.srcElement.alt;
	let data = FindDataMovieByTitle(target);
	if (data) {
		const aside = document.createElement("asside");
		aside.classList.add("describemovie");
		aside.setAttribute("role","dialog");
		aside.setAttribute("aria-hidden","true");
		console.log(data);
		const para = document.createElement("h1");
		para.innerHTML =  "Titre: "+data.title;
		aside.appendChild(para);
		para.innerHTML = "Score: "+data.imdb_score;
		aside.appendChild(para);
		page.insertBefore(aside,footer);

	
	}
	console.log(target);

	//document.getElementById("Films les mieux notés").innerHTML = Date();
	//tell the browser not to respond to the link click
	//e.preventDefault();
}

const Display = async function(){
	await GetDataMovie();
	let page = document.getElementById("page");
	DisplayBestMovie(DataBestMovieByGenre,page);
	for (let data of DataBestMovieByGenre) {
  		// Display list Film
  		DisplayGenre(data.genre,data.datamovie,page);
	}

	document.querySelectorAll(".film").forEach( a => { 
		a.addEventListener('click', DisplayFilmDetail);
	})
	
}

Display();
