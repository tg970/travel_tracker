const app = angular.module('traveler_tracker_App', ['ngRoute']);

let user = {};
const updateUser = (data) => {
  user = data;
  user.logged = true;
  return
}

app.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
   }
   return fallbackSrc;
});
// Thanks to StackOverflow: Rubens Mariuzzo, https://stackoverflow.com/questions/16349578/angular-directive-for-a-fallback-image

app.controller('MainController', ['$http', '$route', '$scope', '$location', function($http, $route, $scope, $location) {
  //console.log('MainController');
  this.test = 'What!';
  this.showModal = false;
  this.place = {};
  this.wantTo = null;
  this.beenTo = null;
  this.user = user
  this.newForm = {};
  this.newUserForm = {};
  this.edit = false;
  this.currentEdit = {};
  this.addShow = false;

  // Add a place
  this.addPlace = () => {
    this.newForm.user = user._id;
    console.log('newForm:', this.newForm);
    $http({
      method: 'POST',
      url: '/places',
      data: this.newForm
    }).then(response => {
      console.log(response.data);
      this.places.push(response.data);
      let temp = { _id: response.data._id }
      if (this.newForm.beenOrWant == 'beenTo') {
        //console.log('beenTo True');
        this.addBeen(temp)
        this.beenToArr.unshift(response.data)
      } else {
        //console.log('beenTo false');
        this.addWant(temp)
        this.wantToArr.unshift(response.data)
      }
      //this.getMyPlaces();
      this.newForm = {};
      this.addShow = false;
    }, error => {
      console.log(error);
    }).catch(err => console.error('Catch', err))
  }

  // Get all places
  this.getPlaces = () => {
    let url = $location.url();
    console.log(url);
    //if (url === '/') {
      //console.log("======== url home ========");
      $http({
          method: 'GET',
          url: '/places'
        }).then(response => {
          console.log('allPlaces',response.data);
          this.places = response.data;
        }, error => {
          console.error(error.message);
        }).catch(err => console.error('Catch', err));
    //}
    if (url == '/viewAll/beenTo') {
      console.log("======== beenTo ========");
      this.viewAll = true
      $http({
        method: 'GET',
        url: `/places/beenTo/${user._id}`
        }).then(response => {
          console.log('beenToPlaces:',response.data);
          this.viewPlaces = response.data.arr;
          this.viewMes = `You've Been`
          this.viewBeenWant = true;
        }, error => {
          console.error(error.message);
        }).catch(err => console.error('Catch', err));
    }
    if (url == '/viewAll/wantTo') {
      console.log("======== want To ========");
      this.viewAll = true
      $http({
          method: 'GET',
          url: `/places/wantTo/${user._id}`
        }).then(response => {
          console.log('beenToPlaces:',response.data);
          this.viewPlaces = response.data.arr;
          this.viewMes = `You Want to Go`
          this.viewBeenWant = false;
        }, error => {
          console.error(error.message);
        }).catch(err => console.error('Catch', err));
      }
  }
  // Load immediately on page load
  this.getPlaces();

  // Delete Item
  this.deletePlace = (id) => {
    //console.log('You will be deleted', id);
    $http({
      method: 'DELETE',
      url: '/places/' + id
    }).then(response => {
      console.log(response.data)
      const removeByIndex = this.places.findIndex(p => p._id === id)
      console.log('rmInx:', removeByIndex)
      this.places.splice(removeByIndex, 1);
      const rmBeenToId = this.beenToArr.findIndex(p => p._id === id);
      if ( rmBeenToId >= 0 ) this.beenToArr.splice(rmBeenToId, 1);
      const rmWantToId = this.wantToArr.findIndex(p => p._id === id);
      if ( rmWantToId >= 0 ) this.wantToArr.splice(rmWantToId, 1);
      this.showModal = false;
      this.edit = false;
    }, error => {
      console.error(error.message)
    }).catch(err => console.error('Catch', err));
    this.getPlaces();
  }

  // Update Item
  this.updateModal = ( place ) => {
    //console.log('full edit running...', place);
    this.edit = true;
    this.currentEdit = angular.copy(place);
  }

  this.updatePlace = () => {
    //console.log('edit submit...', this.currentEdit);
    $http({
      method: 'PUT',
      url: '/places/' + this.currentEdit._id,
      data: this.currentEdit
    }).then(response => {
      //console.log('responce:', response.data);
      //console.table(this.places);
      const updateByIndex = this.places.findIndex(place => place._id === response.data._id)
      //console.log('update ind:', updateByIndex);
      // this.places.splice(updateByIndex , 1, response.data)
      this.places[updateByIndex] = response.data;
      this.openShow(this.places[updateByIndex]);
    }).catch(err => console.error('Catch', err));
    this.edit = false;
    this.currentEdit = {};
  };

  this.dontUpdate = () => {
    this.edit = false;
    this.currentEdit = {};
  }

  // Show Modal Logic ---------------

  //Open place show modal
  this.openShow = (place) => {
    this.place = place;
    if (user.logged) {
      //console.log('this.user: true');
      this.wantTo = user.placesWant.includes(place._id)
      this.beenTo = user.placesBeen.includes(place._id)
      //console.log('wantTo:',this.wantTo);
      //console.log('beenTo:',this.beenTo);
      this.place.liked = user.likes.includes(place._id)
      console.log('user liked:', this.place.liked);
    }
    this.showModal = true;
    if (place.user == user._id) {
      this.editDelete = true;
    } else {
      this.editDelete = false;
    }
    console.log('openShow ===========');
    console.log('this.place:', this.place);
    console.log('++++this.user:' , this.user);
  }

  this.closeShow = () => {
    this.showModal = false;
    this.edit = false;
    this.place = {};
    this.wantTo = null;
    this.beenTo = null;
    this.getMyPlaces();
  };

  this.addLike = () => {
    console.log('==== add like ====');
    //console.log(this.place);
    //console.log(this.user);
    $http({
      url: `/users/addLike/${user._id}/${this.place._id}`,
      method: 'post'
    }).then(response =>  {
      //console.log('response:', response.data);
      updateUser(response.data.user);
      this.place = response.data.place
      this.place.liked = true;
      this.showModal = false;
      this.edit = false;
      this.openShow(this.place)
    }, ex => {
        console.log('ex', ex.data.err);
        this.loginError = ex.statusText;
    }).catch(err => this.loginError = 'Something went wrong' );
  }

  this.removeLike = () => {
    console.log('==== remove like ====');
    console.log(this.place);
    console.log(this.user);
    $http({
      url: `/users/removeLike/${user._id}/${this.place._id}`,
      method: 'put'
    }).then(response =>  {
      console.log('response:', response.data);
      updateUser(response.data);
      this.place = response.data.place
      this.place.liked = false;
      this.showModal = false;
      this.edit = false;
      this.openShow(this.place)
    }, ex => {
        console.log('ex', ex.data.err);
        this.loginError = ex.statusText;
    }).catch(err => this.loginError = 'Something went wrong' );
  }

  this.addWant = (place) => {
    $http({
      url: `/users/addWant/${user._id}/${place._id}`,
      method: 'get'
    }).then(response =>  {
      updateUser(response.data);
      //console.log('addWant:',user);
      if (this.beenTo) this.removeBeen(place)
      this.wantTo = true;
      this.error = null;
    }, ex => {
        console.log('ex', ex.data.err);
        this.loginError = ex.statusText;
    }).catch(err => this.loginError = 'Something went wrong' );
  };

  this.addBeen = (place) => {
    $http({
      url: `/users/addBeen/${user._id}/${place._id}`,
      method: 'get'
    }).then(response =>  {
      updateUser(response.data);
      //console.log('addBeen:',user);
      if (this.wantTo) this.removeWant(place)
      this.beenTo = true;
      this.error = null;
    }, ex => {
        console.log('ex', ex.data.err);
        this.loginError = ex.statusText;
    }).catch(err => this.loginError = 'Something went wrong' );
  };

  this.removeWant = (place) => {
    $http({
      url: `/users/removeWant/${user._id}/${place._id}`,
      method: 'get'
    }).then(response =>  {
      updateUser(response.data);
      //console.log('removeWant:',user);
      this.wantTo = false;
      this.error = null;
    }, ex => {
        console.log('ex', ex.data.err);
        this.loginError = ex.statusText;
    }).catch(err => this.loginError = 'Something went wrong' );
  };

  this.removeBeen = (place) => {
    $http({
      url: `/users/removeBeen/${user._id}/${place._id}`,
      method: 'get'
    }).then(response =>  {
      //console.log('removeBeen Resp:', response.data);
      //console.log('SessionClient:', req.session);
      updateUser(response.data);
      console.log('removeBeen:',user);
      this.beenTo = false;
      this.error = null;
    }, ex => {
        console.log('ex', ex.data.err);
        this.loginError = ex.statusText;
    }).catch(err => this.loginError = 'Something went wrong' );
  };

  // myTracker ---------------

  this.getMyPlaces = () => {
    // console.log('getMyPlaces Running');
    if (user.logged) {
      $http({
        url: `/users/${user._id}`,
        method: 'get'
      }).then(response => {
        console.log('myPlaces', response.data.myPlaces);
        updateUser(response.data.user);
        this.beenToArr = response.data.myPlaces.beenTo
        this.wantToArr = response.data.myPlaces.wantTo
        //console.log('beenTo:', this.beenTo);
        //console.log('wantTo:', this.wantTo);
      }, ex => {
        console.log(ex.data.err, ex.statusText);
     }).catch(err => console.log(err));
   }
  };
  this.getMyPlaces();

  // Add Modal:

  this.openAdd = () => {
    //console.log('openAdd Firing');
    this.addShow = true;
    this.getQuote();
  }

  this.closeAdd = () => {
    //console.log('closeAdd firing');
    this.addShow = false;
    this.quote = {};
    this.newForm = {};
  }

  this.getQuote = () => {
    $http({
      method: 'get',
      url: '/quote'
    }).then(response => {
      //console.log(response.data);
      this.quote = {};
      this.quote.quoteText = response.data.quoteText;
      this.quote.quoteAuthor = response.data.quoteAuthor;
    }, ex => {
      console.log(ex);
   }).catch(err => console.log(err));
  }

  // Open Login from show page
  this.openLogin = () => {
    $scope.$parent.ctrl.showLogin = true;
  }
  //Listen for login
  $scope.$on('updateAuth', (data) => {
    console.log('listener');
    this.user = user;
    this.user.logged = true;
    if (this.showModal) {
      this.showModal = false;
      this.edit = false;
      this.openShow(this.place)
    }
  })

  $scope.$on('logout', (data) => {
    console.log('listener out');
    this.user = false;
    this.user.logged = false;
    if (this.showModal) {
      this.showModal = false;
      this.edit = false;
      this.user = false;
      this.openShow(this.place)
    }
  })

}]);

app.controller('NaviController', ['$http', '$scope', '$location', function($http, $scope, $location) {
  // User States:
  // console.log('new NaviController');
  this.user = user;
  this.showLogin = false;
  if (user.logged) {
    this.userName = this.user.username;
  }

  // Check Server for Session
  $http({
      method: 'get',
      url: '/sessions',
    }).then(response => {
      //console.log('sessionReq:', response.data.user);
      if (response.data.user) {
        user = response.data.user;
        user.logged = true;
        this.user = user
        this.userName = user.username
      }
      console.log('userInfo:', user);
    }, error => {
      console.log('error:', error);
    }).catch(err => console.error('Catch:', err))

  // Register
  this.registerUser = () => {
    //console.log('register: ', this.newUserForm);
    $http({
      url: '/users',
      method: 'post',
      data: this.newUserForm
    }).then(response => {
      console.log('RegisterResponce:', response.data);
      updateUser(response.data);
      //$rootScope.user = user;
      this.user = user;
      this.userName = response.data.username;
      this.newUserForm = {};
      this.error = null;
      this.showLogin = false;
      $scope.$broadcast('updateAuth', { data: this.user })
    }, ex => {
      console.log(ex.data.err, ex.statusText);
      this.registerError = 'Hmm, maybe try a different username...';
   })
   .catch(err => this.registerError = 'Something went wrong' );
   };

  // Login
  this.loginUser = () => {
    $http({
      url: '/sessions/login',
      method: 'post',
      data: this.loginForm
    }).then(response =>  {
      console.log('LoginResponce:', response.data);
      //console.log('SessionClient:', req.session);
      updateUser(response.data);
      //$rootScope.user = user;
      this.user = user;
      this.userName = response.data.username;
      this.loginForm = {};
      this.error = null;
      this.showLogin = false;
      $scope.$broadcast('updateAuth', { data: this.user })
    }, ex => {
       console.log('ex', ex.data.err);
       this.loginError = ex.statusText;
    })
    .catch(err => this.loginError = 'Something went wrong' );
  };

  // Logout
  this.logout = () => {
    $http({ url: '/sessions/logout', method: 'delete' })
    .then((response) => {
       console.log(response.data);
       user = {};
       //$rootScope.user = null;
       this.user = null;
       this.userName = null;
       $scope.$broadcast('logout', { data: this.user })
       $location.path('/');
    }, ex => {
       console.log('ex', ex.data.err);
       this.loginError = ex.statusText;
    })
    .catch(err => this.loginError = 'Something went wrong' );
  }

  this.openLogin = () => {
    this.showLogin = true;
  }

  this.closeLogin = () => {
    this.showLogin = false;
  }

}]);

app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
  // Enables Push State
  $locationProvider.html5Mode({ enabled: true });

  $routeProvider.when('/', {
    templateUrl: 'partials/places.html',
    controller: 'MainController as ctrl',
    controllerAs: 'ctrl'
  });

  $routeProvider.when('/about', {
    templateUrl: 'partials/about.html',
  });

  $routeProvider.when('/myTracker', {
    templateUrl: 'partials/userShow.html',
    controller: 'MainController as ctrl',
    controllerAs: 'ctrl'
  });

  $routeProvider.when('/viewAll/wantTo', {
    templateUrl: 'partials/places.html',
    controller: 'MainController as ctrl',
    controllerAs: 'ctrl'
  });

  $routeProvider.when('/viewAll/beenTo', {
    templateUrl: 'partials/places.html',
    controller: 'MainController as ctrl',
    controllerAs: 'ctrl'
  });

  $routeProvider.otherwise({
    redirectTo: '/'
  });

}]);
