'use strict';

/**
 * @ngdoc function
 * @name neuroApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the neuroApp
 */
angular.module('neuroApp')
  .controller('SearchCtrl', function ($scope, $http, Tag, env, _) {

    var self = this;

    $scope.params = {};
    $scope.authors = [];
    $scope.tags = [];

    $scope.paging = {
      currentPage: 1,
      pageSize: 10,
      maxSize: 10,
    };
    $scope.status = {
      loading: false,
      disableSubmit: true,
      showPaging: false,
    };
    $scope.results = {
      numResults: null,
      articles: [],
    };

    $scope.Tag = Tag;

    self.handleSuccess = function(response) {
      $scope.searchForm.$setPristine();
      $scope.results.articles = response.data.results;
      $scope.results.numResults = response.data.count;
      $scope.paging.pageStart = ($scope.paging.currentPage - 1) * $scope.paging.pageSize + 1;
      $scope.paging.pageEnd = Math.min($scope.paging.currentPage * $scope.paging.pageSize, $scope.results.numResults);
      $scope.status.loading = false;
      $scope.status.showPaging = true;
    };
    self.handleError = function() {
      $scope.status.loading = false;
    };

    $scope.setPage = function() {
      self.fetchArticles();
    };

    $scope.$watch('[params, tags, searchForm.$invalid, searchForm.$pristine]', function() {
      var form = $scope.searchForm;
      if (!form || form.$invalid || form.$pristine) {
        $scope.status.disableSubmit = true;
        return;
      }
      var serialized = self.serialize();
      $scope.status.disableSubmit = Object.keys(serialized).length === 0;
    }, true);

    self.serialize = function() {
      var ret = {};
      angular.forEach($scope.params, function(value, key) {
        if (value) {
          ret[key] = value;
        }
      });
      ret.authors = $scope.authors.length ?
          _.pluck($scope.authors, 'label') :
          undefined;
      ret.tags = $scope.tags.length ?
          _.pluck($scope.tags, 'label') :
          undefined;
      ret.page_num = $scope.paging.currentPage;  // jshint ignore:line
      ret.page_size = $scope.paging.pageSize;    // jshint ignore:line
      return ret;
    };

    self.fetchArticles = function() {
      $scope.status.loading = true;
      $scope.results.articles = [];
      $http({
        method: 'get',
        url: env.apiUrl + 'articles/',
        params: self.serialize()
      }).then(
        self.handleSuccess,
        self.handleError
      );
    };

    $scope.submit = function(form) {
      if (form.$invalid) {
        return;
      }
      $scope.paging.currentPage = 1;
      $scope.status.showPaging = false;
      self.fetchArticles();
    };

  });

