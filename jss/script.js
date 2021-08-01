const UrlApiOCMovies = 'http://127.0.0.1:8000/';
const UriGenres = 'api/v1/genres/';
const UriTitles = 'api/v1/titles/';
const UrlGenres = UrlApiOCMovies+UriGenres;
const UrlTitles = UrlApiOCMovies+UriTitles;


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
	let NumberPages = await MaxPage(await GetDataMovie(UrlSearch))
	// While NumberMovie > ArrayDataMovie.length and NumberPages > 0 get data Movie from Api 
	while (NumberMovie > ArrayDataMovie.length && NumberPages >0 ){
		const Urlpages = UrlSearch+'&page='+NumberPages;
		data = await GetDataMovie(Urlpages);
		// Add data Movie from page NumberPages in ArrayDataMovie
		for (let result  of data.results){
			ArrayDataMovie.push( new DataMovie(result))
		}
		// Select Pages next
		NumberPages -= 1;
	}
	// sort Movie by imdb_score
	ArrayDataMovie.sort((a,b) =>  b.imdb_score-a.imdb_score )
	// select NumberMovie Best NumberMovie
	ArrayDataMovie.length = NumberMovie;
	console.log(ArrayDataMovie)
}



//const result = DataMovie(UrlTitles);
//console.log(result);

const pages = BestMovieData(5,'Adult');
const pages2 = BestMovieData(7,'Biography');
const pages3 = BestMovieData(7,'gfggd');


