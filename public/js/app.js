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
}); // Thanks to StackOverflow: Rubens Mariuzzo Source: https://stackoverflow.com/questions/16349578/angular-directive-for-a-fallback-image

app.controller('MainController', ['$http', '$route', '$scope', '$location', function($http, $route, $scope, $location) {
  let CtrlUrl = $location.url();
  console.log('MainController:', CtrlUrl);
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
    $http({
      method: 'POST',
      url: '/places',
      data: this.newForm
    }).then(response => {
      this.places.push(response.data);
      let temp = { _id: response.data._id }
      if (this.newForm.beenOrWant == 'beenTo') {
        this.addBeen(temp)
        this.beenToArr.unshift(response.data)
      } else {
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
      $http({
          method: 'GET',
          url: '/places'
        }).then(response => {
          console.log('allPlaces',response.data);
          this.places = response.data;
        }, error => {
          console.error(error.message);
        }).catch(err => console.error('Catch', err));
    if (url == '/viewAll/beenTo') {
      this.viewAll = true
      $http({
        method: 'GET',
        url: `/places/beenTo/${user._id}`
        }).then(response => {
          this.viewPlaces = response.data.arr;
          this.viewMes = `You've Been`
          this.viewBeenWant = true;
        }, error => {
          console.error(error.message);
        }).catch(err => console.error('Catch', err));
    }
    if (url == '/viewAll/wantTo') {
      this.viewAll = true
      $http({
          method: 'GET',
          url: `/places/wantTo/${user._id}`
        }).then(response => {
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
    $http({
      method: 'DELETE',
      url: '/places/' + id
    }).then(response => {
      const removeByIndex = this.places.findIndex(p => p._id === id)
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
    this.edit = true;
    this.currentEdit = angular.copy(place);
  }

  this.updatePlace = () => {
    $http({
      method: 'PUT',
      url: '/places/' + this.currentEdit._id,
      data: this.currentEdit
    }).then(response => {
      const updateByIndex = this.places.findIndex(place => place._id === response.data._id)
      this.places.splice(updateByIndex , 1, response.data)
      this.place = response.data;
      this.openShow(response.data);
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
      this.place.liked = user.likes.includes(place._id)
    }
    this.showModal = true;
    if (place.user._id == user._id) {
      this.editDelete = true;
    } else {
      this.editDelete = false;
    }
  };

  this.closeShow = () => {
    this.showModal = false;
    this.edit = false;
    this.place = {};
    this.wantTo = null;
    this.beenTo = null;
    this.getMyPlaces();
  };

  this.addLike = () => {
    $http({
      url: `/users/addLike/${user._id}/${this.place._id}`,
      method: 'post'
    }).then(response =>  {
      updateUser(response.data.user);
      this.place = response.data.place
      this.place.liked = true;
      this.showModal = false;
      this.openShow(this.place)
    }, ex => {
        $scope.$parent.ctrl.showLogin = true;
        this.loginError = ex.statusText;
    }).catch(err => this.loginError = 'Something went wrong' );
  }

  this.removeLike = () => {
    $http({
      url: `/users/removeLike/${user._id}/${this.place._id}`,
      method: 'put'
    }).then(response =>  {
      updateUser(response.data.user);
      this.place = response.data.place
      this.place.liked = false;
      this.showModal = false;
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
      if (this.beenTo) this.removeBeen(place)
      this.wantTo = true;
      this.error = null;
    }, ex => {
        console.log('ex', ex.data.err);
    }).catch(err => this.loginError = 'Something went wrong' );
  };

  this.addBeen = (place) => {
    $http({
      url: `/users/addBeen/${user._id}/${place._id}`,
      method: 'get'
    }).then(response =>  {
      updateUser(response.data);
      if (this.wantTo) this.removeWant(place)
      this.beenTo = true;
      this.error = null;
    }, ex => {
        console.log('ex', ex.data.err);
    }).catch(err => this.loginError = 'Something went wrong' );
  };

  this.removeWant = (place) => {
    $http({
      url: `/users/removeWant/${user._id}/${place._id}`,
      method: 'get'
    }).then(response =>  {
      updateUser(response.data);
      this.wantTo = false;
      this.error = null;
    }, ex => {
        console.log('ex', ex.data.err);
    }).catch(err => this.loginError = 'Something went wrong' );
  };

  this.removeBeen = (place) => {
    $http({
      url: `/users/removeBeen/${user._id}/${place._id}`,
      method: 'get'
    }).then(response =>  {
      updateUser(response.data);
      this.beenTo = false;
      this.error = null;
    }, ex => {
        console.log('ex', ex.data.err);
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
        updateUser(response.data.user);
        this.beenToArr = response.data.myPlaces.beenTo
        this.wantToArr = response.data.myPlaces.wantTo
      }, ex => {
        console.log(ex.data.err, ex.statusText);
     }).catch(err => console.log(err));
   }
  };
  this.getMyPlaces();

  // Add Modal:

  this.openAdd = () => {
    this.addShow = true;
    this.getQuote();
  }

  this.closeAdd = () => {
    this.addShow = false;
    this.quote = {};
    this.newForm = {};
  }

  this.getQuote = () => {
    $http({
      method: 'get',
      url: '/quote'
    }).then(response => {
      this.quote = {};
      this.quote.quoteText = response.data.quoteText;
      this.quote.quoteAuthor = response.data.quoteAuthor;
    }, ex => {
      console.log(ex);
   }).catch(err => console.log(err));
  }

  // Open Login from show page
  this.openLogin = () => {
    this.showLogin = true;
    $scope.$parent.ctrl.showLogin = true;
  }

  this.closeLogin = () => {
    this.showLogin = false;
    $scope.$parent.ctrl.showLogin = false;
  }

  //Listen for login
  $scope.$on('updateAuth', (data) => {
    // console.log('listener');
    this.user = user;
    this.user.logged = true;
    if (this.showModal) {
      this.showModal = false;
      this.edit = false;
      this.openShow(this.place)
    }
  })

  $scope.$on('logout', (data) => {
    //console.log('listener out');
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
      updateUser(response.data);
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
      updateUser(response.data);
      this.user = user;
      this.userName = response.data.username;
      this.loginForm = {};
      this.error = null;
      this.showLogin = false;
      this.loginError = null;
      $scope.$broadcast('updateAuth', { data: this.user })
    }, ex => {
       this.loginError = `Hmm, we can't find a match...`;
    })
    .catch(err => this.loginError = `Hmm, we can't find a match...` );
  };

  // Logout
  this.logout = () => {
    $http({ url: '/sessions/logout', method: 'delete' })
    .then((response) => {
       user = {};
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
