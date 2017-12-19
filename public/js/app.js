const app = angular.module('traveler_tracker_App', ['ngRoute']);

// Global Varibles?
let user = {};

const updateUser = (data) => {
  user = data;
  user.logged = true;
  return
}

app.controller('MainController', ['$http', '$route', function($http, $route) {
  // console.log('Hey');
  this.test = 'What!';
  this.showModal = false;
  this.place = {};
  this.wantTo = null;
  this.beenTo = null;

  this.newForm = {};
  this.newUserForm = {};
  this.edit = false;
  this.currentEdit = {};

  // Routes

  // Check Server for Session
  $http({
    method: 'get',
    url: '/sessions',
  }).then(response => {
    //console.log('sessionReq:', response.data.user);
    if (response.data.user) { user = response.data.user}
    console.log('userInfo:', user);
  }, error => {
    console.log('error:', error);
  }).catch(err => console.error('Catch:', err))

  // Add a place
  this.addPlace = () => {
    this.newForm.user = user._id
    $http({
      method: 'POST',
      url: '/places',
      data: this.newForm
    }).then(response => {
      this.places.push(response.data);
      console.table(response.data);
      this.newForm = {};
    }, error => {
      console.log(error);
    }).catch(err => console.error('Catch', err))
  }

  // Get all places
  this.getPlaces = () => {
    $http({
      method: 'GET',
      url: '/places'
    }).then(response => {
      console.log(response.data);
      this.places = response.data;
    }, error => {
      console.error(error.message);
    }).catch(err => console.error('Catch', err));
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
      // console.table(response.data)
      const removeByIndex = this.places.findIndex(p => p._id === id)
      // console.log('I want to delete this one!', removeByIndex)
      this.places.splice(removeByIndex, 1);
      this.showModal = false;
      this.edit = false;
    }, error => {
      console.error(error.message)
    }).catch(err => console.error('Catch', err));
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
    if (user.logged) {
      //console.log('this.user: true');
      this.wantTo = user.placesWant.includes(place._id)
      this.beenTo = user.placesBeen.includes(place._id)
      console.log('wantTo:',this.wantTo);
      console.log('beenTo:',this.beenTo);
      this.user = true;
    }
    this.showModal = true;
    //console.log(this.showModal);
    this.place = place;
    //console.log(this.place);
  }

  this.closeShow = () => {
    this.showModal = false;
    this.edit = false;
    this.place = {};
    this.wantTo = null;
    this.beenTo = null;
    this.getMyPlaces();
  };

  this.addWant = (place) => {
    $http({
      url: `/users/addWant/${user._id}/${place._id}`,
      method: 'get'
    }).then(response =>  {
      //console.log('addWant Resp:', response.data);
      //console.log('SessionClient:', req.session);
      updateUser(response.data);
      console.log('addWant:',user);
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
      //console.log('addWant Resp:', response.data);
      //console.log('SessionClient:', req.session);
      updateUser(response.data);
      console.log('addBeen:',user);
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
      //console.log('removeWant Resp:', response.data);
      //console.log('SessionClient:', req.session);
      updateUser(response.data);
      console.log('removeWant:',user);
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
    if (user.logged) {
      $http({
        url: `/users/${user._id}`,
        method: 'get'
      }).then(response => {
        console.log(response.data.myPlaces);
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
    console.log('openAdd Firing');
    this.addShow = true;
  }

  this.closeAdd = () => {
    console.log('closeAdd firing');
    this.addShow = false;
  }

}]);

app.controller('UserController', ['$http', '$route', function($http, $route) {
  // User States:
  this.user = user

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
      this.user = user
      this.newUserForm = {};
      this.error = null;
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
      this.user = user
      this.loginForm = {};
      this.error = null;
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
       this.user = null;
    }, ex => {
       console.log('ex', ex.data.err);
       this.loginError = ex.statusText;
    })
    .catch(err => this.loginError = 'Something went wrong' );
  }

}]);

app.controller('MyTrackerController', ['$http', '$route', function($http, $route) {

}]);

app.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
  // Enables Push State
  $locationProvider.html5Mode({ enabled: true });

  $routeProvider.when('/', {
    templateUrl: 'partials/places.html', // render http://localhost:3000/contact.html
    controller: 'MainController as ctrl', // attach controller ContactController
    controllerAs: 'ctrl' // alias for ContactController (like ng-controller="ContactController as ctrl")
  });

  $routeProvider.when('/signin', {
    templateUrl: 'partials/userLogin.html',
    controller: 'UserController as user',
    controllerAs: 'user'
  });

  $routeProvider.when('/myTracker', {  // when http://localhost:3000/pets/:id
    templateUrl: 'partials/userShow.html',
    controller: 'MainController as ctrl',
    controllerAs: 'ctrl'
  });

  // $routeProvider.when('/pricing', {
  //   templateUrl: 'pricing.html',
  //   controller: 'PricingController',
  //   controllerAs: 'ctrl',
  //   price: '$1 trillion dollars'
  // });
  //
  // $routeProvider.when('/joke', {
  //   templateUrl: 'joke.html',
  //   controller: 'JokeController',
  //   controllerAs: 'ctrl'
  // });
  //
  // $routeProvider.when('/all', {
  //   templateUrl: 'all.html',
  //   controller: 'AllController',
  //   controllerAs: 'ctrl'
  // });
  //
  $routeProvider.otherwise({
    redirectTo: '/'
  });

}]);
