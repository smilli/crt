var Crt = function(numEquations) {
  this.equations = {};
  this.primes = [];
  this._generateProblem(numEquations);
}


// Using these b/c assuming no student wants to do CRT on large primes
Crt.prototype.PRIMES = [3, 5, 11, 13, 17, 19]


Crt.prototype._generateProblem = function(numEquations) {
  var primesIndex, xEquivTo, prime;
  var usedPrimes = {}
  for (var i = 0; i < numEquations; i++) {
    primesIndex = Math.floor(Math.random() * this.PRIMES.length);
    while (primesIndex in usedPrimes) {
      primesIndex = Math.floor(Math.random() * this.PRIMES.length);
    }
    usedPrimes[primesIndex] = true;
    prime = this.PRIMES[primesIndex];
    this.primes.push(prime);
    xEquivTo = Math.floor(Math.random() * prime);
    this.equations[prime] = xEquivTo;
  }
}


angular.module('crtApp', [])
  .controller('ProblemController', ['$scope', function($scope) {
    var prob = new Crt(3);
    $scope.equations = prob.equations;
    var product = 1;
    for (var i = 0; i < prob.primes.length; i++) {
      product *= prob.primes[i];
    }
    $scope.primesProd = product;
  }]);
