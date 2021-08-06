const UrlApiOCMovies = 'http://127.0.0.1:8000/';
const UriGenres = 'api/v1/genres/';
const UriTitles = 'api/v1/titles/';
const UrlGenres = UrlApiOCMovies+UriGenres;
const UrlTitles = UrlApiOCMovies+UriTitles;
const GenresDisplayNumber = {
	"Meilleur Film":1,
	"Films les mieux notés":7,
	"Meilleurs Films d'Animation":7,
	"Meilleurs Films d'Adventure":7,
	"Meilleurs Films d'Adult":7
};
const DefaultNbrDisplay = 4;


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

const GetDataMovie = async function (url){
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
	let DataGenre = await GetDataMovie(UrlGenres);
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

const BestMovieData= async function (NumberMovie,Genre = false){
	let ArrayDataMovie = []; 
	let UrlSearch = await CreateUrlSearchApi(Genre);
	let NumberPages = await MaxPage(await GetDataMovie(UrlSearch));
	// While NumberMovie > ArrayDataMovie.length and NumberPages > 0 get data Movie from Api 
	while (NumberMovie > ArrayDataMovie.length && NumberPages >0 ){
		const Urlpages = UrlSearch+'&page='+NumberPages;
		data = await GetDataMovie(Urlpages);
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

const DisplayLelftArrow = async function(newSection){
	const lelftArrow = document.createElement("a");
	lelftArrow.classList.add("arrow__btn");
	lelftArrow.classList.add("left-arrow");
	lelftArrow.innerHTML = "<";
	newSection.appendChild(lelftArrow);
}

const DisplayRightArrow = async function(newSection){
	const rightArrow = document.createElement("a");
	rightArrow.classList.add("arrow__btn");
	rightArrow.classList.add("right-arrow");
	rightArrow.innerHTML = ">";
	newSection.appendChild(rightArrow);
}


const DisplayGenre = async function(){

	let elt = document.getElementById("page");
	let footer = document.getElementById("footer");

	for(let key in GenresDisplayNumber) {
		let nbr = 0; 
  		let value = GenresDisplayNumber[key];
  		const genre = key.split('\'')[1];
  		// get data for genre
  		const dataGenre = await BestMovieData(value, genre);
  		// create HTML


		const newP = document.createElement("a");
		newP.classList.add("categorie");
		newP.innerHTML = key;
		elt.insertBefore(newP,footer);
		const newSection = document.createElement("section");
		newSection.classList.add("list");
		if (dataGenre.length > DefaultNbrDisplay) {
			DisplayLelftArrow(newSection);
		}


		for (let data of dataGenre) {
			nbr +=1 ;
			console.log(data);
			console.log(data.title);
			// display number default movie
			if (nbr <= DefaultNbrDisplay){
				const newDiv = document.createElement("div");
				newDiv.classList.add("element");
				const alt = data.title;
				newDiv.innerHTML = "<img alt='"+data.title+"' src="+data.image_url+ ">";
				newSection.appendChild(newDiv);
				elt.insertBefore(newSection,footer);
			}

		}
		if (dataGenre.length > DefaultNbrDisplay) {
			DisplayRightArrow(newSection);
		}

	}
}


//for(var key in GenresDisplayNumber) {
//  var value = GenresDisplayNumber[key];
//  console.log(value+':'+key);
//  const genre = key.split('\'')[1];
//  const dataGenre = await BestMovieData(value, genre);
//  DisplayGenre(dataGenre,key);
//}


DisplayGenre();

