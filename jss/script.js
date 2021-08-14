class Film {
	constructor(data,detail){
		this.actors = data.actors;
		this.directors =data.directors;
		this.genres = data.genres;
		this.id = data.id;
		this.image_url = data.image_url;
		this.imdb_score = data.imdb_score;
		this.title = data.title;
		this.writers = data.writers;
		this.date_published = detail.date_published;
		this.duration = detail.duration;
		this.rated = detail.rated;
		this.countries = detail.countries;
		this.reviews_from_critics = detail.reviews_from_critics;
		this.description = detail.description;
	}
}

class DataFilm {
	constructor(genre,data){
		this.genre = genre;
		this.data = data;
	}
}

class DataApi{
	constructor(){
		this.urlApiOCMovies = 'http://127.0.0.1:8000/';
		this.uriGenres = 'api/v1/genres/';
		this.uriTitles = 'api/v1/titles/';
		this.urlGenres = this.urlApiOCMovies+this.uriGenres;
		this.urlTitles = this.urlApiOCMovies+this.uriTitles;
		this.numberDisplayGenre = 5;
		this.genres = new Array(); 
		this.defaultGenresNumberMovie = {"Best Movies":7};
	}

	async getGenre(url=this.urlGenres, numberpage = 1){
		// search for all genres available on API
		let data = await this.getData(url+"?page="+numberpage);
		for (let genre of data.results){
			this.genres.push(genre.name);
		}
		const max_page = this.maxPage(data);
		if (numberpage < max_page){
			numberpage += 1;
			await this.getGenre(url,  numberpage);
		}
		return this.genres;
	}

	async getGenreDisplay(){
		const number_genre = this.genres.length
		if (Object.keys(this.defaultGenresNumberMovie).length < this.numberDisplayGenre) {
			let addGenre  = this.genres[Math.floor((Math.random() * number_genre) + 1)];
			if (addGenre) { 
				this.defaultGenresNumberMovie[addGenre]=7;
			}
			await this.getGenreDisplay();
		}
	}

	maxPage(data){
		// return the number of the last page 
		const numberResultByPage = 5;
		let numberPages = 1;
		if (data.next = null ) {
			return numberPages;
		} 
		numberPages = data.count/numberResultByPage
		if (Number.isInteger(numberPages)){
			return numberPages;
		} else{
			return Math.floor(numberPages)+1
		}
	}

	async createUrlSearchApi(genre = false) {
		let urlSearch = this.urlTitles+'?sort_by=imdb_score';
		// if genre not present/define return UrlSearch
		if (genre == false) {
			return  urlSearch;
		} 
		// if genre present in this.genres  return 'UrlSearch+'&genre='+genre'
		// else return UrlSearch
		if (this.genres.includes(genre)){
			return urlSearch+'&genre='+genre;
		} else {
			return urlSearch;
		}
	}

	async getDataBestMovieByGenre(numberMovie, genre){
		let arrayDataMovie = new Array();
		let urlgenre = await this.createUrlSearchApi(genre);
		let data = await this.getData(urlgenre);
		let max_page = this.maxPage(data);
		// While NumberMovie > ArrayDataMovie.length and NumberPages > 0 get data Movie from Api 
		while (numberMovie > arrayDataMovie.length && max_page > 0 ){
			const urlpages = urlgenre+'&page='+max_page;
			data = await this.getData(urlpages);
			// Add data Movie from page NumberPages in ArrayDataMovie
			console.log(data.results)
			for (let result  of data.results){
				// get datail Film
				let detail = await this.getData(this.urlTitles+result.id);
				arrayDataMovie.push( new Film(result,detail));
			}
			// Select Pages next
			max_page -= 1;
		}
		// sort Movie by imdb_score
		arrayDataMovie.sort((a,b) =>  b.imdb_score-a.imdb_score );
		// Cut ArrayDataMovie if  number >  NumberMovie
		if (arrayDataMovie.length > numberMovie){
			arrayDataMovie.length = numberMovie;
		}
		return new DataFilm(genre, arrayDataMovie);
	}

	async getDataMovies(){
		let data = [];
		/// load genre off Api
		await this.getGenre();
		// add genreDisplay if nbr is < numberDisplayGenre
		await this.getGenreDisplay();
		// load best movie by genre
		for (let genre in this.defaultGenresNumberMovie){
			data.push(await this.getDataBestMovieByGenre(this.defaultGenresNumberMovie[genre],genre));
		} 
		return data;
	}

	async getData(url){
		try {
			let response = await fetch(url);
			if (response.ok) {
				return await response.json();
			} else {
				console.error('Retour du serveur : ', response.status);
			}
		} catch (e) {
			console.log(e);
		}
	}
} 

// const testdisplay = function(data) {
// 	const information = document.getElementById("footer");
// 	console.log(information);
// 	information.innerHTML = data;
// }

class Display{
	constructor(data){
		this.defaultNbrDisplay = 4;
		this.footer = document.getElementById("footer");
		this.page = document.getElementById("page");
		this.data = data;
		this.indexDisplay = 0;
	}

	findDataMovieByTitle(title){
		for (let genre of this.data) {
			for (let data_movie of genre.data){
				if (data_movie.title === title){
					return data_movie;
				} 
			}
		}
	}

	displayLelftArrow(newSection,data){
		if (data.length > this.defaultNbrDisplay){
			const lelftArrow = document.createElement("div");
			lelftArrow.classList.add("arrow__btn");
			lelftArrow.classList.add("left-arrow");
			lelftArrow.innerHTML = "<";
			newSection.appendChild(lelftArrow);
		}
	}
	
	displayRightArrow(newSection,data){
		if (data.length > this.defaultNbrDisplay){
			const rightArrow = document.createElement("div");
			rightArrow.classList.add("arrow__btn");
			rightArrow.classList.add("right-arrow");
			rightArrow.innerHTML = ">";
			newSection.appendChild(rightArrow);
		}
	}

	displayFilm(data,section){
		const newFilm = this.addClassDiv("film");
		const img = document.createElement("img");
		img.src = data.image_url;
		img.alt = data.title;
		newFilm.appendChild(img);
		section.appendChild(newFilm);
	}	


	displayBestMovie (){
		const newSection = document.createElement("section");
		newSection.id = "BestFilm";
		let newDiv =  this.addClassDiv("information");
		const information = document.createElement("h1");
		information.innerHTML = this.data[0].data[0].title;
		newDiv.appendChild(information);
		const play = document.createElement("button");
		play.classList.add("button");
		play.classList.add("play");
		play.innerHTML = "Lecture";
		newDiv.appendChild(play);
		newSection.appendChild(newDiv);
		this.displayFilm(this.data[0].data[0],newSection);
		page.insertBefore(newSection,footer);
	}

	displayGenre(dataGenre,page){
		let nbr = 0; 
		const newSection = document.createElement("section");
		newSection.id = dataGenre.genre;
		this.displayTitre(dataGenre.genre,newSection);
		const newDiv = this.addClassDiv("list");
		this.displayLelftArrow(newDiv,dataGenre.data);
		for (let data of dataGenre.data) {
			nbr +=1 ;
			// display number default movie
	
			if (nbr <= this.defaultNbrDisplay){
				this.displayFilm(data,newDiv);
			}
		}
		this.displayRightArrow(newDiv,dataGenre.data);
		newSection.appendChild(newDiv);
		page.insertBefore(newSection,footer);
	}

	displayTitre(title,section){
		const newDiv =  this.addClassDiv("titre");
		const newTitle = document.createElement("h1");
		newTitle.innerHTML = title;
		newDiv.appendChild(newTitle);
		section.appendChild(newDiv);
	}

	addParagraph(test,element){
		const para = document.createElement("p");
		para.innerHTML = test;
		element.appendChild(para);

	}
	addClassDiv(nameClass){
		const newDiv =  document.createElement("div");
		newDiv.classList.add(nameClass);
		return newDiv;
	}

	displayFilmDetail(e){
		let target = e.srcElement.alt;
		let data = this.findDataMovieByTitle(target);
		if (data) {
			const aside = document.createElement("asside");
			aside.classList.add("describemovie");
			aside.setAttribute("role","dialog");
			aside.setAttribute("aria-hidden","true");
			const detail = this.addClassDiv("detail");
			console.log(data);
			this.addParagraph("Titre: "+data.title,detail);
			this.addParagraph("Score Imdb: "+data.imdb_score,detail);
			this.addParagraph("Genres: "+data.genres,detail);
			this.addParagraph("Actors: "+data.actors,detail);
			this.addParagraph("Directors: "+data.directors,detail);
			this.addParagraph("Date Publiched: "+data.date_published,detail);
			this.addParagraph("Rated: "+data.rated,detail);
			this.addParagraph("Duration: "+data.duration,detail);
			this.addParagraph("Countries: "+data.countries,detail);
			this.addParagraph("Duration: "+data.duration,detail);
			this.addParagraph("Reviews from critics: "+data.reviews_from_critics,detail);
			this.addParagraph("Descripion: "+data.description,detail);
			aside.appendChild(detail);
			page.insertBefore(aside,footer);
		
		}
		//document.getElementById("Films les mieux notés").innerHTML = Date();
		//tell the browser not to respond to the link click
		//e.preventDefault();
	}

}

async function main(){

	// init load
	const data = new DataApi();
	dataMovies = await data.getDataMovies();
	const display = new Display(dataMovies)

	// display
	display.displayBestMovie();
	for (let data of dataMovies) {
		// Display list Film
		display.displayGenre(data,page);
    }

	// events 
	document.querySelectorAll(".film").forEach( a => { 
		//a.addEventListener('click', display.displayFilmDetail(a));
		a.addEventListener('click', function(e) {display.displayFilmDetail(e)});
	}) 
}

main();
