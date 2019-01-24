

window.addEventListener( 'load' , function() {

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
    }
  } );



  document.getElementById("login").onclick = function(event) {
    // event.preventDefault ? event.preventDefault() : event.returnValue = false;
    var userName = document.getElementsByName("username")[0];
    var password = document.getElementsByName("psw")[0];

    if(userName.value === "Admin" && password.value === "admin")
    {
        userName.parentNode.action = "http://localhost:3000/bibliotecaCarti.html";
    }
    else {
        alert("You shall not pass!");
    }
  }





} );
