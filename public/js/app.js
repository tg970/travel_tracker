const app = angular.module('traveler_tracker_App', []);


app.controller('MainController', ['$http', function($http) {
  // console.log('Hey');
  this.test = 'What!';
  this.showModal = false;
  this.place = {};

  this.newForm = {};
  this.newUserForm = {};
  this.edit = false;
  this.currentEdit = {};



  // Routes

// Add a place
  this.addPlace = () => {
    // console.log('Submit button calls createHoliday function');
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
       console.table(response.data);
       this.places = response.data;
        // console.log(this.items);
     }, error => {
       console.error(error.message);
     }).catch(err => console.error('Catch', err));
   }
   // Load immediately on page load
   this.getPlaces();

// Delete Item
   this.deletePlace = (id) => {
    console.log('You will be deleted', id);

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
    }, error => {console.error(error.message)
    }).catch(err => console.error('Catch', err));
  }

// Update Item
this.updateModal = ( place ) => {
   console.log('full edit running...', place);
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
      console.log('responce:', response.data);
      console.table(this.places);
      const updateByIndex = this.places.findIndex(place => place._id === response.data._id)
      console.log('update ind:', updateByIndex);
      this.places.splice(updateByIndex , 1, response.data)
    }).catch(err => console.error('Catch', err));
    this.edit = false;
   this.currentEdit = {};
   };

   this.dontUpdate = () => {
      this.edit = false;
      this.currentEdit = {};
   }



   // User Routes -----------------------------------

// Register
  this.registerUser = () => {
   console.log('register: ', this.newUserForm);
   $http({
     url: '/users',
     method: 'post',
     data: this.newUserForm })
   .then(response => {
      console.log('RegisterResponce:', response.data);
      this.user = response.data;
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
        data: this.loginForm })
      .then(response =>  {
         console.log('LoginResponce:', response.data);
         //console.log('SessionClient:', req.session);
         this.user = response.data;
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
         this.user = null;
      });
   }



   //Open place show modal
   this.openShow = (place) => {
     this.showModal = true;
     // console.log(this.showModal);
     this.place = place;
     // console.log(this.place);
   }

   this.closeShow = () => {
     this.showModal = false;
     this.edit = false;
   }



}]);
