var APP_ID = config.APP_ID;
var TMDB_KEY = config.TMDB_KEY;

if (typeof (fbApi) === 'undefined') { fbApi = {}; }
fbApi = (function () {
    var fbApiInit = false;
    var awaitingReady = [];
    var notifyQ = function () {
        var i = 0,
            l = awaitingReady.length;
        for (i = 0; i < l; i++) {
            awaitingReady[i]();
        }
    };
    var ready = function (cb) {
        if (fbApiInit) {
            cb();
        } else {
            awaitingReady.push(cb);
        }
    };

    window.fbAsyncInit = function () {
        FB.init({
            appId: APP_ID,
            status: true,
            cookie: true,
            xfbml: true,
            version: 'v2.0'
        });
        fbApiInit = true;
        notifyQ();
    };
    return {
        /**
        * Fires callback when FB is initialized and ready for api calls.
        */
        'ready': ready
    };
})();


//asyncronous connection
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/all.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

//Connect with facebook
function myFacebookLogin() {

    //fresh login only
    FB.login(function (response) {
        if (response.authResponse) {
            console.log('Welcome!  Fetching your information.... ');
            FB.api('/me', function (response) {
                console.log('Good to see you, ' + response.name + '.');
            });
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, { scope: 'user_likes, user_about_me, email, manage_pages, publish_pages, pages_manage_cta, user_actions.books, user_actions.music, user_actions.video, user_actions.news, user_actions.fitness, public_profile' });

    //returns the login status after clicking on Login button and authentication
    FB.getLoginStatus(function (response) {
        if (response.status === "connected")
            alert("Logged into FB");
        else if (response.status === "not_authorized")
            alert("not connected");
        else
            alert("you are not logged in");
    });

};


//for storing movies
movie = new Array();
movIdL = new Array();
TMDBidR = new Array();
poster = new Array();

var temp, div, mystring, ps, newButton;

function getInfo() {
    FB.api(
        '/me',
        'GET',
        { "fields": "name,movies{name,picture{url}}" },
        function (response) {
            //responce is JSON file
            var name = response.name;

            document.getElementById("userName").innerHTML = "<center> Hello " + name + "!!!Here are the list of movies you have liked on Facebook</center>";
            // document.getElementById("liked").innerHTML = JSON.stringify(response,null,2);

            //for traversing list of movies
            for (var i = 0; i < response.movies.data.length; i++) {

                temp = (JSON.stringify(response.movies.data[i].name, null, 2));
                temp = temp.slice(1, -1);

                ps = (response.movies.data[i].picture.data.url);

                // Add movie name to movie array
                movie.push(temp);

                //Add Poster to poster array for respective movie name
                poster.push(ps);

            }

            div = document.getElementById('liked');

            for (var i = 0; i < movie.length; i++) {

                mystring = '<div class="chip">';

                var myImg = '<img src="' + poster[i] + '" alt="Poster">';

                div.innerHTML = div.innerHTML + mystring + myImg + movie[i] + '</div>';


                //Movie Name to Movie Id
                var arg, name = movie[i];
                // Recommended Movies
                //  function myfun(){
                var xhttp = new XMLHttpRequest();
                var url = "https://api.themoviedb.org/3/search/movie?api_key=" + TMDB_KEY + name;
                xhttp.onreadystatechange = function () {

                    if (this.readyState == 4 && this.status == 200) {
                        arg = Number(JSON.parse(this.responseText).results[0].id);
                        // console.log(arg);
                        RecMov(arg);
                    }
                };
                xhttp.open("GET", url, true);
                xhttp.send(null);
            }

            newButton = '<button class="waves-effect waves-light btn-large z-depth-5" id="button3"><a href="#Page3">Show Recommendations</as></button>';
            document.getElementById("button").innerHTML = newButton;


        });
}


/* For finding the IMDB Id of the liked movie*/
/*function findId(name){

} */


//Recommended Movies
function RecMov(movieid) {

    var Rdiv = document.getElementById('ReCom');

    // For Displaying TMDB IDs of movies liked on Fb
    /*
    var rID = document.getElementById('recId');
    */

    //Add IMDBid to movId Array
    movIdL.push(movieid);

    var xhttp = new XMLHttpRequest();

    var url = "https://api.themoviedb.org/3/movie/" + movieid + "/recommendations?api_key=" + TMDB_KEY;
    //console.log(movieid);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            var res = JSON.parse(this.responseText);
            var total = Number(res.total_results);

            // console.log(res.results.length);

            for (var i = 0; i < res.results.length; i++) {
                //    console.log(res.results[i].original_title);
                //    console.log("Link to poster= https://image.tmdb.org/t/p/original"+res.results[i].poster_path);

                //TMDB id of recommended movies            
                TMDBidR.push(res.results[i].id);
                // console.log(res.results[i].id);
                //Display recommendation in inner html
                mystring = '<div class="chip hoverable z-depth-' + Math.floor((Math.random() * 5) + 1) + ' "> ';

                //For Address of Image
                var ImgAdd = "https://image.tmdb.org/t/p/original";
                var myImg = '<img src="' + ImgAdd + res.results[i].poster_path + '" alt="Poster">';

                var rec = res.results[i].original_title;

                // Rdiv.innerHTML = Rdiv.innerHTML  + mystring + res.results[i].id + '</div>' + ",";

                //rID.innerHTML = rID.innerHTML + res.results[i].id+",";

                Rdiv.innerHTML = Rdiv.innerHTML + mystring + myImg + rec + '</div>';


            }
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send(null);

}   
