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
		this.genres = new Array(); 
		this.defaultGenresNumberMovie = {"Best Movies": this.numberMovieByGenre};
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
				this.defaultGenresNumberMovie[addGenre] = this.numberMovieByGenre;
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

	async getdatafilmsynchro(data){
		let numberMovie = data.length
		let datamovies = new Array(numberMovie);
		switch(numberMovie)
		{
			case 1:
				datamovies = [ await this.addDetailFilm(data[numberMovie-1])];
				break;
			case 2:
				datamovies = [await this.addDetailFilm(data[numberMovie-2]),await this.addDetailFilm(data[numberMovie-1])];
				break;
			case 3:
				datamovies = [
					await this.addDetailFilm(data[numberMovie-3]),
					await this.addDetailFilm(data[numberMovie-2]),
					await this.addDetailFilm(data[numberMovie-1])
				];
				break;
			case 4:
				datamovies = [
					await this.addDetailFilm(data[numberMovie-4]),
					await this.addDetailFilm(data[numberMovie-3]),
					await this.addDetailFilm(data[numberMovie-2]),
					await this.addDetailFilm(data[numberMovie-1])
				];
				break;
			default:
				datamovies = [
					await this.addDetailFilm(data[numberMovie-5]),
					await this.addDetailFilm(data[numberMovie-4]),
					await this.addDetailFilm(data[numberMovie-3]),
					await this.addDetailFilm(data[numberMovie-2]),
					await this.addDetailFilm(data[numberMovie-1])
				];
				break;

		}
		return datamovies;
	}

	async addDetailFilm(data){
		let detail = await this.getData(this.urlTitles+data.id);
		return new Film(data,detail);
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
			const clone_array = [].concat(arrayDataMovie);
			arrayDataMovie = clone_array.concat( await this.getdatafilmsynchro(data.results));
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
		let GenresNumberMovie = this.defaultGenresNumberMovie;
		let keys = Object.keys(GenresNumberMovie);
		data = [ 
			await this.getDataBestMovieByGenre(GenresNumberMovie[keys[0]],keys[0]),
			await this.getDataBestMovieByGenre(GenresNumberMovie[keys[1]],keys[1]),
			await this.getDataBestMovieByGenre(GenresNumberMovie[keys[2]],keys[2]),
			await this.getDataBestMovieByGenre(GenresNumberMovie[keys[3]],keys[3]),

		]
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
		this.defaultNbrDisplay = 4;
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

	displayLelftArrow(newSection,dataGenre){
		if (dataGenre.data.length > this.defaultNbrDisplay){
			const lelftArrow = document.createElement("div");
			lelftArrow.classList.add("arrow__btn");
			lelftArrow.classList.add("left-arrow");
			lelftArrow.innerHTML = "<";
			newSection.appendChild(lelftArrow);
		}
	}
	
	displayRightArrow(newSection,dataGenre){
		if (dataGenre.data.length > this.defaultNbrDisplay){
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

	displayGenre(dataGenre){
		let nbr = 0; 
		const newSection = document.createElement("section");
		this.displayTitre(dataGenre.genre,newSection);
		const newDiv = this.addClassDiv("list");
		newDiv.id = dataGenre.genre;
		// display arrow
		this.displayLelftArrow(newDiv,dataGenre);
		this.displayRightArrow(newDiv,dataGenre);
		// insert film 
		for (let dataFilm of dataGenre.data) {
			nbr +=1 ;
			// display number default movie
	
			if (nbr <= this.defaultNbrDisplay){
				this.displayFilm(dataFilm,newDiv);
			} else{
				break;
			}
		}
		newSection.appendChild(newDiv);
		this.page.insertBefore(newSection,this.footer);
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
		 	if (nbr <= this.defaultNbrDisplay){
		 		this.displayFilm(dataFilm,sectiongenre);
		 	} else{
		 		break;
		 	}
		}
		//sectiongenre.appendChild(newDiv);
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
		Describemovie.remove();
		this.modal.style.display = "none";
	}

	displayFilmDetail(e){
		let target = e.srcElement.alt;
		let data = this.DataMovieByTitle(target);
		const displayDetail = {
			"Titre": data.title,
			"Score Imdb": data.imdb_score,
			"Genres": data.genres,
			"Actors": data.actors,
			"Directors": data.directors,
			"Date Publiched": data.date_published,
			"Rated": data.rated,
			"Duration": data.duration,
			"Countries": data.countries,
			"Reviews from critics": data.reviews_from_critics,
			"Descripion": data.description
		}
		if (data) {
			this.modal.style.display = "flex"
			const div = this.addClassDiv("Describemovie");
			div.setAttribute("id", "Describemovie");
			this.displayFilm(data,div);
			let detail = this.addClassDiv("detail");
			for(let title in displayDetail){
				this.displayTextDetailFilm(title, displayDetail[title],detail);
			}
			div.appendChild(detail);
			modal.appendChild(div);
			page.insertBefore(modal,this.footer);
		}
	}

}

function clicfilm(display){
	// events windows clic open film
	document.querySelectorAll(".film").forEach( a => { 
		a.addEventListener('click', function(e) {
							display.displayFilmDetail(e);
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

	
	// display
	display.displayBestMovie();
	for (let datagenre of dataMovies) {
		// Display list Film by genre
		display.displayGenre(datagenre);
    }

	clicfilm(display);
	clicclose(display);
	clicarrow(display);
}

main();
