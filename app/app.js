import angular from 'angular'
import uiBootstrap from 'angular-ui-bootstrap'

import uiRouter from 'angular-ui-router'

import LongtripsCtrl from './longtrips/longtrips.controller';
import LongtripsService from './longtrips/longtrips.service';

angular.module('my-app', [uiBootstrap, uiRouter])
  .service('LongtripsService', LongtripsService)
  .controller('LongtripsCtrl', LongtripsCtrl)
  .config(['$stateProvider', ($stateProvider) => {
  $stateProvider
    .state('home', {
      url: '',
      templateUrl: 'views/home.html'
    })
    .state('main', {
      url: '/',
      templateUrl: 'views/home.html'
    })
    .state('longtrips', {
      url: '/longtrips',
      templateUrl: 'views/longtrips.html'
    })
  }]);
