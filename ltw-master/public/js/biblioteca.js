window.addEventListener( 'load' , function() {

  // When the user scrolls the page, execute myFunction
//  window.onscroll = function() {myFunction()};

  // Get the navbar
//  var navbar = document.getElementById("navbar");

  // Get the offset position of the navbar
//  var sticky = navbar.offsetTop;

  // Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
  // function myFunction() {
  //   if (window.pageYOffset >= sticky) {
  //     navbar.classList.add("sticky")
  //   } else {
  //     navbar.classList.remove("sticky");
  //   }
  // }


  Vue.prototype.axios = axios;
  let app = new Vue( {
    el: '#app',
    data: {
      books: [], //O BAZA DE DATE
      authors: [],
      inpBooks: { //ce vreau sa adaug | campurile pe care le retine o carte
        Source:"unknown.jpg",
        Name:null,
        Author:null,
        Summary:null,
        Genre:null,
        FavoriteQuotes: null
      },
      inpAuthors: {
        Name:null,
        Biography:null,
        Boooks:null
      },
      editIdAuthors:null,
      editIdBooks: null //a cata carte din baza de date vreau sa dau edit se lucreaza
    },
    created: function() {
      this.axios.get( '/api/books' ).then((_response) => {
          this.books = _response.data.data;
        } );
      this.axios.get( '/api/authors' ).then((_response) => {
          this.authors = _response.data.data;
        } );
    },

    methods:{
      commitBook: function() {
        if ( this.editIdBooks === null ) {
          // add


          if(this.inpBooks.Genre !== null) {
            this.inpBooks.Genre = this.inpBooks.Genre.split(",");
          }
          // console.log("INAINTE DE EROARE");
          let oo = Object.assign( {} , this.inpBooks );
          axios.post( '/api/books' , oo ) //mergea si http: local host 3000 bla bla
            .then( _response => {
              if ( _response.data.ret === "OK" ) {
                Vue.set( this.books , _response.data.it , oo );
                this.$forceUpdate();
              }
            } );

          this.newAuthorsToAdd(this.inpBooks, this.authors);

        } else {
          // edit
          for ( let k in this.inpBooks ) {
            this.books[this.editIdBooks][k] = this.inpBooks[k];
          }
          axios.put( `/api/books/${this.editIdBooks}` , this.books[this.editIdBooks] );
          this.editIdBooks = null;
          this.$forceUpdate();
        }

        this.inpBooks = {
          Name:null,
          Author:null,
          Summary:null,
          Genre:null,
          FavoriteQuotes: null,
          Source:null
        }
      },

      commitAuthor: function() {
        if ( this.editIdAuthors === null ) {
          // add

          // if (!(this.inpAuthors.Boooks instanceof Array)) {
          //   this.inpAuthors.Boooks = this.inpAuthors.Boooks.split(","); //separ cartile dupa virgula => transf in vector
          //   console.log(this.inpAuthors.Boooks[0]);
          //
          // }

          if(this.inpAuthors.Boooks !== null) {
            this.inpAuthors.Boooks = this.inpAuthors.Boooks.split(","); //separ cartile dupa virgula => transf in vector
            console.log(this.inpAuthors.Boooks[0]);
          }
          let oo = Object.assign( {} , this.inpAuthors );
          axios.post( '/api/authors' , oo ) //mergea si http: local host 3000 bla bla
            .then( _response => {
              if ( _response.data.ret === "OK" ) {
                Vue.set( this.authors, _response.data.it , oo );
                this.$forceUpdate();
              }
            } );

          this.newBooksToAdd(this.inpAuthors, this.books);

        } else {
          // edit
          var temp = this.inpAuthors.Boooks + '';
          temp = temp.split(",");
          if(temp.length < this.authors[this.editIdAuthors].Boooks.length) {
            //inseamna ca in noul input am mai putine carti decat inainte si noi nu vrem asta
            alert("YoU mAy NoT dElEtE mY bOoK!");
            return ;
          }

          //nu adauga si sterge simultan cartile unui autor

          if(temp.length > this.authors[this.editIdAuthors].Boooks.length) {
              for(i in temp) {
                var found = false;
                for(j in this.books) { //ma uit prin carti si vad daca exista deja cartea respectiva
                    if(temp[i] == this.books[j].Name) {
                      found = true;
                      break;
                    }
                }
                if(!found){ //inseamna ca nu exista deci adaug cartea in baza de date corespunzatoare
                    //treb implementat ADD
                    this.addBook(temp[i], this.books, this.inpAuthors.Name); //ca parametrii dau numele carti, baza de date corespunzatoare si numele autorului ca sa pot asocia

                    //acum adaug in sfarsit autorul
                    this.authors[this.editIdAuthors].Boooks = temp;
                    axios.put( `/api/authors/${this.editIdAuthors}` , this.authors[this.editIdAuthors] );
                    this.$forceUpdate();
                  }
              }
          }

          //in cazul in care nu s a umblat la carti => editez casual
          for ( let k in this.inpAuthors ) {
            this.authors[this.editIdAuthors][k] = this.inpAuthors[k];
          }

          if (!(this.authors[this.editIdAuthors].Boooks instanceof Array)) {
              this.authors[this.editIdAuthors].Boooks = this.authors[this.editIdAuthors].Boooks.split(",");
          }

          axios.put( `/api/authors/${this.editIdAuthors}` , this.authors[this.editIdAuthors] );
          this.editIdAuthors = null;
        }

        this.inpAuthors = {
          Name: null,
          Biography: null,
          Boooks: null
        }
      },

      removeBook:function(_id){
        //verif daca exista autor pt ea si dupa sterge
        var hasAuthor = false;

        for (i in this.authors) {
            for (j in this.authors[i].Boooks) {
                if (this.authors[i].Boooks[j] === this.books[_id].Name) {
                    hasAuthor = true;
                    break;
                }
            }
        }

        if(hasAuthor) {
          alert("You may not lay your hand on my legacy, you uneducated human! If you want to mess with my books, you must kill me first!!!");
        }
        else {
          this.axios.delete( `/api/books/${_id}` )
            .then( () => {
              Vue.delete( this.books , _id );
              this.$forceUpdate();
            } );
        }
      },

      removAuthor:function(_id){
        for(let i in this.books) {
          if(this.authors[_id].Name === this.books[i].Author) { //delete all of his books first
              this.axios.delete( `/api/books/${i}` )
                .then( () => {
                  Vue.delete( this.books , i );
                  this.$forceUpdate();
                } );
          }
        }


        this.axios.delete( `/api/authors/${_id}` )
          .then( () => {
            Vue.delete( this.authors , _id );
          } );
      },

      editBook:function(_id){
        let io = Object.assign( {} , this.books[_id] );
        this.inpBooks = io;
        this.editIdBooks = _id;
      },

      editAuthor:function(_id){
        let io = Object.assign( {} , this.authors[_id] );
        this.inpAuthors = io;
        this.editIdAuthors = _id;
      },

      bookImageUpload: function(event) {
          // takes the image name for the movie input when uploaded
          let image = event.target.files[0]["name"];
          this.inpBooks.Source = image;
          console.log(this.inpBooks.Source);
      },

      addBook: function(_bookName, _books, _authorName) {
          let tempBook = {
            Source:"unknown.jpg",
            Name:_bookName,
            Author:_authorName,
            Summary:null,
            Genre:null,
            FavoriteQuotes: null
        };

        let oo = Object.assign({}, tempBook);
        axios.post('api/books', oo).then((_response) => {
            if (_response.data.ret == "OK") {
                Vue.set(_books, _response.data.it, oo);
                this.$forceUpdate();
            }
        });

      },

      //this.addAuthor((_inpBooks.Author, _authors,  _books[foundIndex].Name);
      addAuthor: function(_authorName, _authors, _bookName){
          let tempAuthor = {
            Name:_authorName,
            Biography:null,
            Boooks:_bookName.split(",")
          };

          let oo = Object.assign({}, tempAuthor);
          axios.post('api/authors', oo).then((_response) => {
              if (_response.data.ret == "OK") {
                  Vue.set(_authors, _response.data.it, oo);
                  this.$forceUpdate();
              }
          });
      },

      //apel:   this.newBooksToAdd(this.inpAuthors, this.books);
      newBooksToAdd: function(_inpAuthors, _books) {
          for(i in _inpAuthors.Boooks) {
            var found = false;
            var foundIndex = -1;
            for(j in _books) {
              if(_inpAuthors.Boooks[i] === _books[j].Name) {
                  found = true;
                  foundIndex = j;
                  break;
              }
            }
            if(found == false) {
              this.addBook(_inpAuthors.Boooks[i], _books, _inpAuthors.Name );
            }

          }
      },

      //apel: this.newAuthorsToAdd(this.inpBooks, this.authors);
       newAuthorsToAdd:function(_inpBooks, _authors) {
         var found = false;
         for(i in _authors) {
           if(_inpBooks.Author === _authors[i].Name) {
               found = true;
               break;
           }
         }

         if(found == false) {
           this.addAuthor(_inpBooks.Author, _authors,  _inpBooks.Name);
         }
       }

    }
  } );
} );
