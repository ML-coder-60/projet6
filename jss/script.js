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
		if (detail) {
			this.date_published = detail.date_published;
			this.duration = detail.duration;
			this.rated = detail.rated;
			this.countries = detail.countries;
			this.reviews_from_critics = detail.reviews_from_critics;
			this.description = detail.description;
		}
	}
}

class DataFilm {
	constructor(genre,data){
		this.genre = genre;
		this.data = data;
		this.index = 0;
	}
}

class DataApi{
	constructor(){
		this.urlApiOCMovies = 'http://127.0.0.1:8000/';
		this.uriGenres = 'api/v1/genres/';
		this.uriTitles = 'api/v1/titles/';
		this.urlGenres = this.urlApiOCMovies+this.uriGenres;
		this.urlTitles = this.urlApiOCMovies+this.uriTitles;
		this.numberDisplayGenre = 4;
		this.numberMovieByGenre = 7; 
		this.genresDisplay = new Array(); 
		this.defaultGenresNumberMovie = {"Best Movies": this.numberMovieByGenre};
	}

	async getGenre(url=this.urlGenres, numberpage = 1){
		// search for all genres available on API
		// return all genres
		let data = await this.getData(url+"?page="+numberpage);
		for (let genre of data.results){
			// add genre to this.genresDisplay
			this.genresDisplay.push(genre.name);
		}
		// cacul last page 
		const max_page = this.lastPage(data);
		// if not last page => this.getGenre(url,  numberpage+1)
		if (numberpage < max_page){
			numberpage += 1;
			await this.getGenre(url,  numberpage);
		}
		return this.genresDisplay;
	}

	async getGenreDisplay(){
		// select the genres that will be displayed 
		const number_genre = this.genresDisplay.length
		if (Object.keys(this.defaultGenresNumberMovie).length < this.numberDisplayGenre) {
			// get genre randowm from this.genresDisplay
			// add genre to defaultGenresNumberMovie
			let addGenre  = this.genresDisplay[Math.floor((Math.random() * number_genre) + 1)];
			if (addGenre) { 
				// add genre to  defaultGenresNumberMovie
				this.defaultGenresNumberMovie[addGenre] = this.numberMovieByGenre;
			}
			await this.getGenreDisplay();
		}
	}

	lastPage(data){
		// return the number of the last page in API
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
		if (this.genresDisplay.includes(genre)){
			return urlSearch+'&genre='+genre;
		} else {
			return urlSearch;
		}
	}

	async detailFilm(data){
		// get data Film from id film
		return await this.getData(this.urlTitles+data.id);
	}
	
	static async addDetailFilm(data,detail){
		const test  = new Film(data,detail);
	}

	async getDataBestMovieByGenre(numberMovie, genre){
		let arrayDataMovie = new Array();
		let urlgenre = await this.createUrlSearchApi(genre);
		let data = await this.getData(urlgenre);
		let max_page = this.lastPage(data);
		// While NumberMovie > ArrayDataMovie.length and NumberPages > 0 get data Movie from Api 
		while (numberMovie > arrayDataMovie.length && max_page > 0 ){
			const urlpages = urlgenre+'&page='+max_page;
			data = await this.getData(urlpages);
			for (let result  of data.results){
				// push data film  to arrayDataMovie
				arrayDataMovie.push( new Film(result,false));
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

class Display{
	constructor(data){
		this.defaultNbrMoviesDisplay = 4;
		this.footer = document.getElementById("footer");
		this.page = document.getElementById("page");
		this.modal = document.getElementById("modal");
		this.data = data;
	}

	DataMovieByTitle(title){
		for (let datagenre of this.data) {
			for (let data_movie of datagenre.data){
				if (data_movie.title === title){
					return data_movie;
				} 
			}
		}
	}

	UpdateIndexDataGenreByGenre(genre, index ){
		for (let datagenre of this.data) {
			if (datagenre.genre == genre) {
				datagenre.index = datagenre.index + index
				return datagenre;
			}
		}

	}

	displayArrow(newSection,dataGenre){
		// if nbr Movies  > 	defaultNbrMoviesDisplay	
		if (dataGenre.data.length > this.defaultNbrMoviesDisplay){
		// Add Left Arrow
			const lelftArrow = document.createElement("div");
			lelftArrow.classList.add("arrow__btn");
			lelftArrow.classList.add("left-arrow");
			lelftArrow.innerHTML = "<";
			newSection.appendChild(lelftArrow);
		// Add Right Arrow
			const rightArrow = document.createElement("div");
			rightArrow.classList.add("arrow__btn");
			rightArrow.classList.add("right-arrow");
			rightArrow.innerHTML = ">";
			newSection.appendChild(rightArrow);
		}
	}

	displayFilm(datafilm,section){
		const newFilm = this.addClassDiv("film");
		const img = document.createElement("img");
		const rightrow = section.getElementsByClassName("right-arrow")[0];
		img.src = datafilm.image_url;
		img.alt = datafilm.title;
		newFilm.appendChild(img);
		section.insertBefore(newFilm,rightrow);
	}	

	displayBestMovie (){
		const newSection = document.createElement("section");
		newSection.id = "BestFilm";
		let newDiv =  this.addClassDiv("information");
		this.addTitre(this.data[0].data[0].title,newDiv);
		const play = document.createElement("button");
		play.classList.add("button");
		play.classList.add("play");
		play.innerHTML = "Play";
		newDiv.appendChild(play);
		newSection.appendChild(newDiv);
		this.displayFilm(this.data[0].data[0],newSection);
		page.insertBefore(newSection,this.footer);
	}

	displayGenre(){
		// list Film by genre
		for (let dataGenre of this.data) {
			let nbr = 0; 
			// create section
			const newSection = document.createElement("section");
			// create Titre section
			this.displayTitre(dataGenre.genre,newSection);
			// create List Film
			const newList = this.addClassDiv("list");
			newList.id = dataGenre.genre;
			// Create Arrow
			this.displayArrow(newList,dataGenre);
			// insert film in lest 
			for (let dataFilm of dataGenre.data) {
				nbr +=1 ;
				// display default number movie by genre
				if (nbr <= this.defaultNbrMoviesDisplay){ 
					this.displayFilm(dataFilm,newList);
				} else{
					break;
				}
			}
			// add List to section
			newSection.appendChild(newList);
			// add List before footer
			this.page.insertBefore(newSection,this.footer);
		}
	}
	
	arrayRotate(arr, index) {
		while(index != 0) {
			if (index > 0) {
				arr.unshift(arr.pop());
				index -= 1;
			}else {
				arr.unshift(arr.pop());
				index +=  1;
			}
		}
		return arr;
	}
	  
	updateDisplayGenre(e,index){
		let nbr = 0;
		const sectiongenre = e.target.parentNode;
		const genre = sectiongenre.id;
		let datagenre = this.UpdateIndexDataGenreByGenre(genre,index);
		const remove_films = sectiongenre.querySelectorAll('.film');
		for (let remove_film of remove_films){
			sectiongenre.removeChild(remove_film);
		}
		let datamovies = [].concat(datagenre.data)
		datamovies = this.arrayRotate(datamovies, datagenre.index)

		for (let dataFilm of datamovies) {
		 	nbr +=1 ;
		 	// display number default movie
		 	if (nbr <= this.defaultNbrMoviesDisplay){
		 		this.displayFilm(dataFilm,sectiongenre);
		 	} else{
		 		break;
		 	}
		}
	}

	displayTitre(title,section){
		const newDiv =  this.addClassDiv("titre");
		this.addTitre(title,newDiv);
		section.appendChild(newDiv);
	}

	addTitre(text,element){
		const para = document.createElement("h1");
		para.innerHTML = text;
		element.appendChild(para);
	}

	addParagraph(text,element){
		const para = document.createElement("p");
		para.innerHTML = text;
		element.appendChild(para);
	}

	addClassDiv(nameClass){
		const newDiv =  document.createElement("div");
		newDiv.classList.add(nameClass);
		return newDiv;
	}

	displayTextDetailFilm(titre,text,element){
		var old_text = element.innerHTML;
		element.innerHTML = old_text+(titre+": ").bold()+text;
		const br = document.createElement("br");
		element.appendChild(br);
	}

	closeFilmDetail(){
		const Describemovie = document.getElementById("Describemovie");
		// remove elements in modal
		Describemovie.remove();
		// set display off
		this.modal.style.display = "none";
	}

	displayFilmDetail(e){
		// get name film
		let target = e.srcElement.alt;
		// get data film
		let dataMovie = this.DataMovieByTitle(target);
		// get all data film end display
	    new DataApi().detailFilm(dataMovie).then( e => { 
			const allDataMovie = new Film(dataMovie,e);
			if (allDataMovie) {
				// Set title for  display
				const displayDetail = {
					"Titre": allDataMovie.title,
					"Score Imdb": allDataMovie.imdb_score,
					"Genres": allDataMovie.genres,
					"Actors": allDataMovie.actors,
					"Directors": allDataMovie.directors,
					"Date Publiched": allDataMovie.date_published,
					"Rated": allDataMovie.rated,
					"Duration": allDataMovie.duration,
					"Countries": allDataMovie.countries,
					"Reviews from critics": allDataMovie.reviews_from_critics,
					"Descripion": allDataMovie.description
				}
				// display modal
				this.modal.style.display = "flex"
				const div = this.addClassDiv("Describemovie");
				div.setAttribute("id", "Describemovie");
				this.displayFilm(allDataMovie,div);
				let detail = this.addClassDiv("detail");
				for(let title in displayDetail){
					this.displayTextDetailFilm(title, displayDetail[title],detail);
				}
				div.appendChild(detail);
				modal.appendChild(div);
				page.insertBefore(modal,this.footer);
			}
		});
	}
}

function clicfilm(display){
	// events windows clic open film
	document.querySelectorAll(".film").forEach( a => { 
		a.addEventListener('click', function(e){
			display.displayFilmDetail(e)
			}	
		);
	});
}

function clicclose(display){
	// event windows clic close
	document.querySelectorAll(".close").forEach(
		a => { a.addEventListener('click', function() {display.closeFilmDetail()});
	});
}

function clicarrow(display){
	// event windwos clic right-arrow
	document.querySelectorAll(".right-arrow").forEach( 
		a => { a.addEventListener('click', function(e) { 
			display.updateDisplayGenre(e,1);
			clicfilm(display);
		});
	});
		
	// event windwos clic left-arrow
	document.querySelectorAll(".left-arrow").forEach( 
		a => { a.addEventListener('click', function(e) {
			display.updateDisplayGenre(e,-1);
			clicfilm(display);		
		});
	});

}

async function main(){
	// init load
	const dataMovies = await new DataApi().getDataMovies();
	const display = new Display(dataMovies);
	// display Best Movie
	display.displayBestMovie();
	// Display list Film by genre
	display.displayGenre();
	// check evenement clic on film
	clicfilm(display);
	// check evenement clic on close
	clicclose(display);
	// check evenement clic on arrow
	clicarrow(display);
}

main();
